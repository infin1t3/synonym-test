import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { User, db } from '@/lib/db';

interface UserStore {
  // Data state
  users: User[];
  favorites: Set<string>;
  
  // Loading states
  isLoading: boolean;
  isError: boolean;
  errorMessage: string;
  isOffline: boolean;
  
  // Pagination state
  currentPage: number;
  totalResults: number;
  resultsPerPage: number;
  
  // Actions
  setUsers: (users: User[]) => void;
  addUsers: (users: User[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setOffline: (offline: boolean) => void;
  setPagination: (page: number, total?: number) => void;
  
  // Favorites actions
  toggleFavorite: (userId: string) => Promise<void>;
  loadFavorites: () => Promise<void>;
  
  // Data fetching actions
  fetchUsers: (page?: number) => Promise<void>;
  loadFromCache: () => Promise<void>;
  clearCache: () => Promise<void>;
}

export const useUserStore = create<UserStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      users: [],
      favorites: new Set<string>(),
      isLoading: false,
      isError: false,
      errorMessage: '',
      isOffline: false,
      currentPage: 1,
      totalResults: 0,
      resultsPerPage: 10,

      // Basic setters
      setUsers: (users) => set({ users }),
      addUsers: (users) => set((state) => ({ 
        users: [...state.users, ...users] 
      })),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ 
        isError: !!error, 
        errorMessage: error || '' 
      }),
      setOffline: (isOffline) => set({ isOffline }),
      setPagination: (page, total) => set((state) => ({ 
        currentPage: page,
        totalResults: total !== undefined ? total : state.totalResults
      })),

      // Favorites management
      toggleFavorite: async (userId) => {
        const { favorites } = get();
        const newFavorites = new Set(favorites);
        
        if (newFavorites.has(userId)) {
          newFavorites.delete(userId);
          // Remove from database
          await db.favorites.where('userId').equals(userId).delete();
        } else {
          newFavorites.add(userId);
          // Add to database
          await db.favorites.add({
            id: `fav_${userId}_${Date.now()}`,
            userId,
            createdAt: new Date()
          });
        }
        
        set({ favorites: newFavorites });
      },

      loadFavorites: async () => {
        try {
          const favoriteRecords = await db.favorites.toArray();
          const favoriteUserIds = new Set(favoriteRecords.map(f => f.userId));
          set({ favorites: favoriteUserIds });
        } catch (error) {
          console.error('Failed to load favorites:', error);
        }
      },

      // Data fetching
      fetchUsers: async (page = 1) => {
        const { resultsPerPage } = get();
        set({ isLoading: true, isError: false, errorMessage: '' });

        try {
          const response = await fetch(
            `https://randomuser.me/api/?page=${page}&results=${resultsPerPage}`
          );
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          const data = await response.json();
          const users: User[] = data.results.map((user: any) => ({
            ...user,
            id: user.login.uuid
          }));

          // Store in cache
          await db.transaction('rw', db.users, db.cache, async () => {
            // Store users
            await db.users.bulkPut(users);
            
            // Store cache metadata
            await db.cache.put({
              id: `page_${page}`,
              page,
              lastFetched: new Date(),
              totalResults: data.info?.results || resultsPerPage
            });
          });

          if (page === 1) {
            set({ 
              users, 
              currentPage: page,
              totalResults: data.info?.results || resultsPerPage,
              isOffline: false
            });
          } else {
            get().addUsers(users);
            set({ currentPage: page });
          }

        } catch (error) {
          console.error('Failed to fetch users:', error);
          set({ 
            isError: true, 
            errorMessage: error instanceof Error ? error.message : 'Failed to fetch users',
            isOffline: true
          });
          
          // Try to load from cache if fetch fails
          await get().loadFromCache();
        } finally {
          set({ isLoading: false });
        }
      },

      loadFromCache: async () => {
        try {
          const cachedUsers = await db.users.toArray();
          if (cachedUsers.length > 0) {
            set({ 
              users: cachedUsers,
              isOffline: true 
            });
          }
        } catch (error) {
          console.error('Failed to load from cache:', error);
        }
      },

      clearCache: async () => {
        try {
          await db.transaction('rw', db.users, db.cache, db.favorites, async () => {
            await db.users.clear();
            await db.cache.clear();
            await db.favorites.clear();
          });
          
          set({ 
            users: [], 
            favorites: new Set(),
            currentPage: 1,
            totalResults: 0
          });
        } catch (error) {
          console.error('Failed to clear cache:', error);
        }
      }
    }),
    {
      name: 'user-store'
    }
  )
); 