'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { FeatureRequestWithDetails, FeatureRequestStatus, STATUS_CONFIG } from '@/lib/types';
import { StatusBadge } from '@/components/StatusBadge';
import { formatRelativeTime, cn } from '@/lib/utils';

/**
 * Admin Dashboard Page
 * Only accessible to users with @meta.com or @fb.com email domains
 * Provides bulk management of feature requests
 */
export default function AdminPage() {
  const { data: session } = useSession();
  const [requests, setRequests] = useState<FeatureRequestWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<FeatureRequestStatus | 'all'>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await fetch('/api/requests?sort=newest');
      if (response.ok) {
        const data = await response.json();
        setRequests(data.requests);
      }
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkStatusChange = async (newStatus: FeatureRequestStatus) => {
    if (selectedIds.size === 0) return;

    for (const id of selectedIds) {
      try {
        await fetch(`/api/requests/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        });
      } catch (error) {
        console.error(`Failed to update request ${id}:`, error);
      }
    }

    setSelectedIds(new Set());
    fetchRequests();
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.size} request(s)?`)) return;

    for (const id of selectedIds) {
      try {
        await fetch(`/api/requests/${id}`, { method: 'DELETE' });
      } catch (error) {
        console.error(`Failed to delete request ${id}:`, error);
      }
    }

    setSelectedIds(new Set());
    fetchRequests();
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredRequests.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredRequests.map((r) => r.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const filteredRequests = statusFilter === 'all'
    ? requests
    : requests.filter((r) => r.status === statusFilter);

  const statusCounts = {
    all: requests.length,
    under_review: requests.filter((r) => r.status === 'under_review').length,
    planned: requests.filter((r) => r.status === 'planned').length,
    in_progress: requests.filter((r) => r.status === 'in_progress').length,
    implemented: requests.filter((r) => r.status === 'implemented').length,
    declined: requests.filter((r) => r.status === 'declined').length,
  };

  if (!session?.user?.isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-text-secondary mb-4">
            This page is only accessible to administrators.
          </p>
          <Link href="/" className="text-purple-400 hover:text-purple-300">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-text-secondary hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </Link>
            <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/20 border border-amber-500/50 rounded-lg">
            <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            <span className="text-sm text-amber-400">{session.user.email}</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {Object.entries(statusCounts).map(([status, count]) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status as typeof statusFilter)}
              className={cn(
                'p-4 rounded-lg border transition-colors text-left',
                statusFilter === status
                  ? 'bg-purple-500/20 border-purple-500'
                  : 'bg-card border-border hover:bg-card-hover'
              )}
            >
              <div className="text-2xl font-bold text-white mb-1">{count}</div>
              <div className="text-sm text-text-secondary capitalize">
                {status === 'all' ? 'All' : status.replace('_', ' ')}
              </div>
            </button>
          ))}
        </div>

        {/* Bulk actions */}
        {selectedIds.size > 0 && (
          <div className="mb-4 p-4 bg-card border border-border rounded-lg flex flex-wrap items-center gap-3">
            <span className="text-white font-medium">
              {selectedIds.size} selected
            </span>
            <div className="flex flex-wrap gap-2">
              <span className="text-text-secondary">Change status to:</span>
              {(['under_review', 'planned', 'in_progress', 'implemented', 'declined'] as FeatureRequestStatus[]).map(
                (status) => (
                  <button
                    key={status}
                    onClick={() => handleBulkStatusChange(status)}
                    className="px-3 py-1 text-sm rounded-lg border border-border bg-background hover:bg-card-hover"
                  >
                    <StatusBadge status={status} />
                  </button>
                )
              )}
            </div>
            <button
              onClick={handleBulkDelete}
              className="px-3 py-1 text-sm bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/30"
            >
              Delete Selected
            </button>
          </div>
        )}

        {/* Request table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-background border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === filteredRequests.length && filteredRequests.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-border bg-card text-purple-500 focus:ring-purple-500"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Title</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Author</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Votes</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Comments</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Created</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-text-muted">
                      Loading...
                    </td>
                  </tr>
                ) : filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-text-muted">
                      No requests found
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-card-hover">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(request.id)}
                          onChange={() => toggleSelect(request.id)}
                          className="rounded border-border bg-card text-purple-500 focus:ring-purple-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {request.isPinned && (
                            <svg className="w-4 h-4 text-purple-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M5.5 3A2.5 2.5 0 003 5.5v2.879a2.5 2.5 0 00.732 1.767l6.5 6.5a2.5 2.5 0 003.536 0l2.878-2.878a2.5 2.5 0 000-3.536l-6.5-6.5A2.5 2.5 0 008.38 3H5.5zM6 7a1 1 0 100-2 1 1 0 000 2z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                          <span className="text-white font-medium line-clamp-1">{request.title}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={request.status} />
                      </td>
                      <td className="px-4 py-3 text-sm text-text-secondary">{request.authorName}</td>
                      <td className="px-4 py-3 text-sm text-text-secondary">{request.upvotes}</td>
                      <td className="px-4 py-3 text-sm text-text-secondary">{request.commentCount}</td>
                      <td className="px-4 py-3 text-sm text-text-secondary">
                        {formatRelativeTime(request.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/?selected=${request.id}`}
                          className="text-sm text-purple-400 hover:text-purple-300"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
