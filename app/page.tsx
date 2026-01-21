'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { FeatureRequestWithMeta, SortOption } from '@/lib/types';
import { FeatureRequestCard } from '@/components/FeatureRequestCard';
import { FeatureRequestDetail } from '@/components/FeatureRequestDetail';
import { SubmitRequestModal } from '@/components/SubmitRequestModal';
import { AdminPanel } from '@/components/AdminPanel';
import { IconSidebar } from '@/components/IconSidebar';
import { useDemoMode } from './providers';
import { getMockRequests, DEMO_USER } from '@/lib/mockData';

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

  const fetchRequests = useCallback(async () => {
    if (isDemoMode) {
      const mockData = getMockRequests({
        search: searchQuery,
        sort: sortOption,
      });
      setRequests(mockData);

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

  // Check if we should show the empty state (no requests)
  const showEmptyState = !isLoading && requests.length === 0;

  return (
    <div className="h-screen flex bg-background">
      {/* Icon Sidebar */}
      <IconSidebar
        currentUser={currentUser}
        isAdmin={isAdmin}
        isDemoMode={isDemoMode}
        onSignIn={() => signIn('google')}
        onSignOut={() => signOut()}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 p-4">
        {/* Header */}
        <header className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-medium text-white">Feature Requests</h1>
            {isDemoMode && (
              <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                Demo
              </span>
            )}
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Create
          </button>
        </header>

        {/* Search Bar */}
        <div className="mb-4">
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
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-white text-sm placeholder-text-muted focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent caret-white"
              style={{ color: 'white' }}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 rounded-xl overflow-hidden">
          {showEmptyState ? (
            /* Empty State */
            <div className="h-full flex flex-col items-center justify-center">
              <div className="w-12 h-12 mb-4 text-text-muted">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-white font-medium mb-1">
                {searchQuery ? 'No requests found' : 'No feature requests yet'}
              </p>
              <p className="text-text-muted text-sm mb-6">
                {searchQuery ? 'Try adjusting your search terms.' : 'Get started by creating a new request.'}
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Create
              </button>
            </div>
          ) : (
            /* Split View: List + Detail */
            <div className="h-full flex">
              {/* Request List Sidebar */}
              <aside
                className={`
                  w-full md:w-80 lg:w-96 flex-shrink-0 border-r border-border bg-background-secondary
                  flex flex-col overflow-hidden
                  ${showMobileDetail ? 'hidden md:flex' : 'flex'}
                `}
              >
                {/* Sort dropdown */}
                <div className="flex-shrink-0 p-3 border-b border-border">
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value as SortOption)}
                    className="w-full p-2 bg-background border border-border rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-accent"
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
              </aside>

              {/* Detail Panel */}
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
                        className="w-12 h-12 mx-auto text-text-muted mb-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                        />
                      </svg>
                      <h2 className="text-lg font-medium text-text-secondary mb-1">
                        Select a request
                      </h2>
                      <p className="text-text-muted text-sm max-w-xs">
                        Choose a request from the list to view details and comments.
                      </p>
                    </div>
                  </div>
                )}
              </main>
            </div>
          )}
        </div>
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
