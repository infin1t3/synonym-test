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
  isManualOffline: boolean;
  
  // Search and sort states
  searchTerm: string;
  sortBy: 'name' | 'email' | 'age' | 'country';
  sortOrder: 'asc' | 'desc';
  
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
  setManualOffline: (offline: boolean) => void;
  setPagination: (page: number, total?: number) => void;
  
  // Search and sort actions
  setSearchTerm: (term: string) => void;
  setSortBy: (field: 'name' | 'email' | 'age' | 'country') => void;
  setSortOrder: (order: 'asc' | 'desc') => void;
  getFilteredAndSortedUsers: () => User[];
  
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
      isManualOffline: false,
      currentPage: 1,
      totalResults: 0,
      resultsPerPage: 10,
      searchTerm: '',
      sortBy: 'name',
      sortOrder: 'asc',

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
      setManualOffline: (isManualOffline) => set({ isManualOffline }),
      setPagination: (page, total) => set((state) => ({ 
        currentPage: page,
        totalResults: total !== undefined ? total : state.totalResults
      })),
      
      // Search and sort actions
      setSearchTerm: (searchTerm) => set({ searchTerm }),
      setSortBy: (sortBy) => set({ sortBy }),
      setSortOrder: (sortOrder) => set({ sortOrder }),
      
      getFilteredAndSortedUsers: () => {
        const { users, searchTerm, sortBy, sortOrder } = get();
        
        // Filter users based on search term
        const filtered = users.filter(user => {
          const fullName = `${user.name.first} ${user.name.last}`.toLowerCase();
          const email = user.email.toLowerCase();
          const term = searchTerm.toLowerCase();
          return fullName.includes(term) || email.includes(term);
        });
        
        // Sort users
        filtered.sort((a, b) => {
          let valueA: string | number;
          let valueB: string | number;
          
          switch (sortBy) {
            case 'name':
              valueA = `${a.name.first} ${a.name.last}`;
              valueB = `${b.name.first} ${b.name.last}`;
              break;
            case 'email':
              valueA = a.email;
              valueB = b.email;
              break;
            case 'age':
              valueA = a.dob.age;
              valueB = b.dob.age;
              break;
            case 'country':
              valueA = a.location.country;
              valueB = b.location.country;
              break;
            default:
              valueA = `${a.name.first} ${a.name.last}`;
              valueB = `${b.name.first} ${b.name.last}`;
          }
          
          if (typeof valueA === 'string' && typeof valueB === 'string') {
            valueA = valueA.toLowerCase();
            valueB = valueB.toLowerCase();
          }
          
          if (sortOrder === 'asc') {
            return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
          } else {
            return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
          }
        });
        
        return filtered;
      },

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
        const { resultsPerPage, isManualOffline } = get();
        set({ isLoading: true, isError: false, errorMessage: '' });

        // Check manual offline mode
        if (isManualOffline) {
          set({ 
            isError: true, 
            errorMessage: 'Manual offline mode enabled',
            isOffline: true
          });
          await get().loadFromCache();
          set({ isLoading: false });
          return;
        }

        try {
          const response = await fetch(
            `https://randomuser.me/api/?page=${page}&results=${resultsPerPage}`
          );
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          const data = await response.json();
          const users: User[] = data.results.map((user: Omit<User, 'id'>) => ({
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