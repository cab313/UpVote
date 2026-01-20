'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { FeatureRequestWithMeta, SortOption } from '@/lib/types';
import { FeatureRequestCard } from '@/components/FeatureRequestCard';
import { FeatureRequestDetail } from '@/components/FeatureRequestDetail';
import { SubmitRequestModal } from '@/components/SubmitRequestModal';
import { AdminPanel } from '@/components/AdminPanel';
import { Avatar } from '@/components/Avatar';
import { useDemoMode } from './providers';
import { getMockRequests, DEMO_USER } from '@/lib/mockData';
import Link from 'next/link';

export default function HomePage() {
  const { data: session, status } = useSession();
  const { isDemoMode } = useDemoMode();
  const [requests, setRequests] = useState<FeatureRequestWithMeta[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<FeatureRequestWithMeta | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>('trending');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showMobileDetail, setShowMobileDetail] = useState(false);

  // In demo mode, use mock data; otherwise fetch from API
  const fetchRequests = useCallback(async () => {
    if (isDemoMode) {
      // Use mock data in demo mode
      const mockData = getMockRequests({
        search: searchQuery,
        sort: sortOption,
      });
      setRequests(mockData);

      // Update selected request if it exists
      if (selectedRequest) {
        const updated = mockData.find((r) => r.id === selectedRequest.id);
        if (updated) {
          setSelectedRequest(updated);
        }
      }
      setIsLoading(false);
      return;
    }

    try {
      const params = new URLSearchParams({
        sort: sortOption,
        search: searchQuery,
      });

      const response = await fetch(`/api/requests?${params}`);
      if (response.ok) {
        const data = await response.json();
        setRequests(data.requests);

        // Update selected request if it exists
        if (selectedRequest) {
          const updated = data.requests.find(
            (r: FeatureRequestWithMeta) => r.id === selectedRequest.id
          );
          if (updated) {
            setSelectedRequest(updated);
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    } finally {
      setIsLoading(false);
    }
  }, [sortOption, searchQuery, selectedRequest, isDemoMode]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Get user info - from session in normal mode, from DEMO_USER in demo mode
  const currentUser = isDemoMode
    ? { ...DEMO_USER, image: DEMO_USER.image }
    : session?.user;
  const isAdmin = isDemoMode ? DEMO_USER.isAdmin : session?.user?.isAdmin;

  const handleRequestSelect = (request: FeatureRequestWithMeta) => {
    setSelectedRequest(request);
    setShowMobileDetail(true);
  };

  const handleNewRequest = (newRequest: FeatureRequestWithMeta) => {
    setRequests((prev) => [newRequest, ...prev]);
    setSelectedRequest(newRequest);
    setShowMobileDetail(true);
  };

  const handleMobileBack = () => {
    setShowMobileDetail(false);
  };

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'trending', label: 'Trending' },
    { value: 'most_voted', label: 'Most Voted' },
    { value: 'newest', label: 'Newest' },
    { value: 'oldest', label: 'Oldest' },
  ];

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-border bg-card px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-white">Feature Requests</h1>
            <span className="hidden sm:inline-flex px-2 py-0.5 bg-purple-500/20 text-purple-400 text-sm rounded-full">
              {requests.length} request{requests.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Search - hidden on mobile */}
            <div className="hidden md:block relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search requests..."
                className="w-64 pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-white text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Admin link */}
            {isAdmin && (
              <Link
                href="/admin"
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-amber-500/20 border border-amber-500/50 text-amber-400 rounded-lg text-sm hover:bg-amber-500/30 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Admin
              </Link>
            )}

            {/* User menu */}
            {status === 'loading' && !isDemoMode ? (
              <div className="w-8 h-8 skeleton rounded-full" />
            ) : currentUser ? (
              <div className="flex items-center gap-2">
                <Avatar
                  name={currentUser.name || 'User'}
                  image={currentUser.image}
                  size="md"
                />
                {isDemoMode ? (
                  <span className="hidden sm:inline-flex px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                    Demo Mode
                  </span>
                ) : (
                  <button
                    onClick={() => signOut()}
                    className="hidden sm:block text-sm text-text-secondary hover:text-white"
                  >
                    Sign out
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={() => signIn('google')}
                className="px-4 py-2 btn-primary text-white text-sm rounded-lg"
              >
                Sign in
              </button>
            )}
          </div>
        </div>

        {/* Mobile search */}
        <div className="md:hidden mt-3">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search requests..."
              className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-white text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`
            w-full md:w-80 lg:w-96 flex-shrink-0 border-r border-border bg-card
            flex flex-col overflow-hidden
            ${showMobileDetail ? 'hidden md:flex' : 'flex'}
          `}
        >
          {/* Sort dropdown */}
          <div className="flex-shrink-0 p-3 border-b border-border">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="w-full p-2 bg-background border border-border rounded-lg text-white text-sm focus:ring-2 focus:ring-purple-500"
              aria-label="Sort requests by"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Request list */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 w-3/4 skeleton rounded" />
                    <div className="h-3 w-1/2 skeleton rounded" />
                    <div className="h-12 skeleton rounded" />
                  </div>
                ))}
              </div>
            ) : requests.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-purple-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                <p className="text-text-secondary font-medium mb-1">
                  {searchQuery ? 'No matching requests found' : 'No feature requests yet'}
                </p>
                <p className="text-sm text-text-muted">
                  {searchQuery ? 'Try adjusting your search terms' : 'Be the first to submit one!'}
                </p>
              </div>
            ) : (
              requests.map((request) => (
                <FeatureRequestCard
                  key={request.id}
                  request={request}
                  isSelected={selectedRequest?.id === request.id}
                  onClick={() => handleRequestSelect(request)}
                />
              ))
            )}
          </div>

          {/* Submit button */}
          <div className="flex-shrink-0 p-3 border-t border-border">
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full py-3 btn-primary text-white font-medium rounded-lg flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Submit Request
            </button>
          </div>
        </aside>

        {/* Detail panel */}
        <main
          className={`
            flex-1 overflow-hidden bg-background
            ${showMobileDetail ? 'block' : 'hidden md:block'}
          `}
        >
          {selectedRequest ? (
            <div className="h-full overflow-y-auto p-6">
              <FeatureRequestDetail
                request={selectedRequest}
                onClose={handleMobileBack}
              />

              {/* Admin panel (only for admins) */}
              {isAdmin && (
                <div className="mt-6">
                  <AdminPanel request={selectedRequest} onUpdate={fetchRequests} />
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-center p-8">
              <div>
                <svg
                  className="w-16 h-16 mx-auto text-text-muted mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                  />
                </svg>
                <h2 className="text-xl font-medium text-text-secondary mb-2">
                  Select a feature request
                </h2>
                <p className="text-text-muted max-w-sm">
                  Choose a request from the list to view details, vote, and add comments.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Submit Modal */}
      <SubmitRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleNewRequest}
      />
    </div>
  );
}
