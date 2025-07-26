'use client';

import React, { useEffect } from 'react';
import { useUserStore } from '@/store/userStore';
import { UserCard } from '@/components/UserCard';
import { LoadingState } from '@/components/LoadingState';
import { StatusDisplay, OfflineBanner } from '@/components/StatusDisplay';
import { Pagination } from '@/components/Pagination';
import { DarkModeToggle } from '@/components/DarkModeToggle';
import { SearchAndFilters } from '@/components/SearchAndFilters';

export default function Home() {
  const {
    users,
    isLoading,
    isError,
    errorMessage,
    isOffline,
    currentPage,
    totalResults,
    resultsPerPage,
    fetchUsers,
    loadFavorites,
    loadFromCache,
    clearCache,
    getFilteredAndSortedUsers,
  } = useUserStore();

  const filteredUsers = getFilteredAndSortedUsers();

  useEffect(() => {
    const initializeApp = async () => {
      // Load favorites from cache
      await loadFavorites();
      
      // Try to fetch fresh data, fallback to cache if offline
      try {
        await fetchUsers(1);
      } catch {
        // If initial fetch fails, try loading from cache
        await loadFromCache();
      }
    };

    initializeApp();
  }, [fetchUsers, loadFavorites, loadFromCache]);

  const handlePageChange = async (page: number) => {
    await fetchUsers(page);
  };

  const handleRetry = async () => {
    await fetchUsers(currentPage);
  };

  const handleClearCache = async () => {
    await clearCache();
    await fetchUsers(1);
  };

  // Show loading state only on initial load
  if (isLoading && users.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Loading Users...
            </h1>
          </div>
          <LoadingState />
        </div>
      </div>
    );
  }

  // Show error state if there's an error and no cached data
  if (isError && users.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <StatusDisplay
            type="error"
            title="Failed to Load Users"
            message={errorMessage || 'Something went wrong while fetching user data.'}
            action={{
              label: 'Try Again',
              onClick: handleRetry,
            }}
          />
        </div>
      </div>
    );
  }

  // Show empty state if no users and not loading
  if (!isLoading && users.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <StatusDisplay
            type="empty"
            title="No Users Found"
            message="There are no users to display at the moment."
            action={{
              label: 'Refresh',
              onClick: () => fetchUsers(1),
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Fixed Header */}
      <div className="sticky top-0 z-50 bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                User Directory
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Local-first app with offline support
              </p>
            </div>
            <DarkModeToggle />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Offline Banner */}
        <OfflineBanner isVisible={isOffline} />

        {/* Search and Filters */}
        <SearchAndFilters />

        {/* Controls */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {isOffline ? 'Showing cached data' : `${filteredUsers.length} of ${users.length} users`}
          </div>
          
          <button
            onClick={handleClearCache}
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none transition-colors duration-200 cursor-pointer"
          >
            Clear Cache
          </button>
        </div>

        {/* User Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredUsers.map((user) => (
            <UserCard key={user.id} user={user} />
          ))}
        </div>

        {/* Loading overlay for pagination */}
        {isLoading && users.length > 0 && (
          <div className="mb-8">
            <LoadingState count={3} />
          </div>
        )}

        {/* No results message */}
        {filteredUsers.length === 0 && users.length > 0 && !isLoading && (
          <div className="text-center py-12">
            <div className="text-gray-500 dark:text-gray-400">
              <p className="text-lg mb-2">No users found</p>
              <p className="text-sm">Try adjusting your search criteria</p>
            </div>
          </div>
        )}

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalResults={totalResults}
          resultsPerPage={resultsPerPage}
          isLoading={isLoading}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}
