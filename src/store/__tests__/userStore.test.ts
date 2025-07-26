import { renderHook, act } from '@testing-library/react'
import { useUserStore } from '../userStore'
import { API_URL } from '@/lib/constants'
import { db } from '@/lib/db'
import type { User } from '@/lib/db'

// Mock fetch
const mockFetch = jest.fn()
global.fetch = mockFetch

// Mock console.error to suppress error logs during tests
const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

describe('useUserStore', () => {
  beforeEach(async () => {
    // Reset store state before each test
    useUserStore.setState({
      users: [],
      favorites: new Set(),
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
    })
    
    // Clear database
    try {
      await db.users.clear()
      await db.cache.clear() 
      await db.favorites.clear()
    } catch {
      // Ignore errors during cleanup
    }
    
    mockFetch.mockClear()
    consoleSpy.mockClear()
  })

  afterAll(() => {
    consoleSpy.mockRestore()
  })

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useUserStore())
      
      expect(result.current.users).toEqual([])
      expect(result.current.favorites).toEqual(new Set())
      expect(result.current.isLoading).toBe(false)
      expect(result.current.isError).toBe(false)
      expect(result.current.errorMessage).toBe('')
      expect(result.current.isOffline).toBe(false)
      expect(result.current.isManualOffline).toBe(false)
      expect(result.current.currentPage).toBe(1)
      expect(result.current.totalResults).toBe(0)
      expect(result.current.resultsPerPage).toBe(10)
      expect(result.current.searchTerm).toBe('')
      expect(result.current.sortBy).toBe('name')
      expect(result.current.sortOrder).toBe('asc')
    })
  })

  describe('Basic Setters', () => {
    it('should set users', () => {
      const { result } = renderHook(() => useUserStore())
      const mockUsers: User[] = [
        {
          id: '1',
          name: { first: 'John', last: 'Doe' },
          email: 'john@example.com',
          dob: { age: 30 },
          location: { country: 'US' },
          login: { uuid: '1' }
        } as User
      ]

      act(() => {
        result.current.setUsers(mockUsers)
      })

      expect(result.current.users).toEqual(mockUsers)
    })

    it('should set loading state', () => {
      const { result } = renderHook(() => useUserStore())

      act(() => {
        result.current.setLoading(true)
      })

      expect(result.current.isLoading).toBe(true)
    })

    it('should set error state', () => {
      const { result } = renderHook(() => useUserStore())

      act(() => {
        result.current.setError('Test error')
      })

      expect(result.current.isError).toBe(true)
      expect(result.current.errorMessage).toBe('Test error')
    })

    it('should clear error state', () => {
      const { result } = renderHook(() => useUserStore())

      act(() => {
        result.current.setError('Test error')
      })

      act(() => {
        result.current.setError(null)
      })

      expect(result.current.isError).toBe(false)
      expect(result.current.errorMessage).toBe('')
    })

    it('should set offline state', () => {
      const { result } = renderHook(() => useUserStore())

      act(() => {
        result.current.setOffline(true)
      })

      expect(result.current.isOffline).toBe(true)
    })

    it('should set manual offline state', () => {
      const { result } = renderHook(() => useUserStore())

      act(() => {
        result.current.setManualOffline(true)
      })

      expect(result.current.isManualOffline).toBe(true)
    })
  })

  describe('Search and Sort', () => {
    const mockUsers: User[] = [
      {
        id: '1',
        name: { first: 'Alice', last: 'Johnson' },
        email: 'alice@example.com',
        dob: { age: 25 },
        location: { country: 'US' },
        login: { uuid: '1' }
      } as User,
      {
        id: '2',
        name: { first: 'Bob', last: 'Smith' },
        email: 'bob@example.com',
        dob: { age: 35 },
        location: { country: 'UK' },
        login: { uuid: '2' }
      } as User,
      {
        id: '3',
        name: { first: 'Charlie', last: 'Brown' },
        email: 'charlie@example.com',
        dob: { age: 20 },
        location: { country: 'CA' },
        login: { uuid: '3' }
      } as User
    ]

    it('should filter users by search term (name)', () => {
      const { result } = renderHook(() => useUserStore())

      act(() => {
        result.current.setUsers(mockUsers)
        result.current.setSearchTerm('alice')
      })

      const filtered = result.current.getFilteredAndSortedUsers()
      expect(filtered).toHaveLength(1)
      expect(filtered[0].name.first).toBe('Alice')
    })

    it('should filter users by search term (email)', () => {
      const { result } = renderHook(() => useUserStore())

      act(() => {
        result.current.setUsers(mockUsers)
        result.current.setSearchTerm('bob@')
      })

      const filtered = result.current.getFilteredAndSortedUsers()
      expect(filtered).toHaveLength(1)
      expect(filtered[0].email).toBe('bob@example.com')
    })

    it('should sort users by name ascending', () => {
      const { result } = renderHook(() => useUserStore())

      act(() => {
        result.current.setUsers(mockUsers)
        result.current.setSortBy('name')
        result.current.setSortOrder('asc')
      })

      const sorted = result.current.getFilteredAndSortedUsers()
      expect(sorted[0].name.first).toBe('Alice')
      expect(sorted[1].name.first).toBe('Bob')
      expect(sorted[2].name.first).toBe('Charlie')
    })

    it('should sort users by age descending', () => {
      const { result } = renderHook(() => useUserStore())

      act(() => {
        result.current.setUsers(mockUsers)
        result.current.setSortBy('age')
        result.current.setSortOrder('desc')
      })

      const sorted = result.current.getFilteredAndSortedUsers()
      expect(sorted[0].dob.age).toBe(35) // Bob
      expect(sorted[1].dob.age).toBe(25) // Alice
      expect(sorted[2].dob.age).toBe(20) // Charlie
    })

    it('should sort users by country', () => {
      const { result } = renderHook(() => useUserStore())

      act(() => {
        result.current.setUsers(mockUsers)
        result.current.setSortBy('country')
        result.current.setSortOrder('asc')
      })

      const sorted = result.current.getFilteredAndSortedUsers()
      expect(sorted[0].location.country).toBe('CA') // Charlie
      expect(sorted[1].location.country).toBe('UK') // Bob
      expect(sorted[2].location.country).toBe('US') // Alice
    })
  })

  describe('Fetch Users', () => {
    const mockResponse = {
      results: [
        {
          name: { first: 'John', last: 'Doe' },
          email: 'john@example.com',
          dob: { age: 30 },
          location: { country: 'US' },
          login: { uuid: '123' }
        }
      ],
      info: { results: 1 }
    }

    it('should fetch users successfully', async () => {
      const { result } = renderHook(() => useUserStore())
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      await act(async () => {
        await result.current.fetchUsers(1)
      })

      expect(mockFetch).toHaveBeenCalledWith(`${API_URL}/?page=1&results=10`)
      expect(result.current.users).toHaveLength(1)
      expect(result.current.users[0].id).toBe('123')
      expect(result.current.isLoading).toBe(false)
      expect(result.current.isError).toBe(false)
      expect(result.current.isOffline).toBe(false)
    })

    it('should handle fetch error', async () => {
      const { result } = renderHook(() => useUserStore())
      
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      await act(async () => {
        await result.current.fetchUsers(1)
      })

      expect(result.current.isLoading).toBe(false)
      expect(result.current.isError).toBe(true)
      expect(result.current.errorMessage).toBe('Network error')
      expect(result.current.isOffline).toBe(true)
    })

    it('should handle HTTP error response', async () => {
      const { result } = renderHook(() => useUserStore())
      
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      })

      await act(async () => {
        await result.current.fetchUsers(1)
      })

      expect(result.current.isLoading).toBe(false)
      expect(result.current.isError).toBe(true)
      expect(result.current.errorMessage).toBe('HTTP 404: Not Found')
      expect(result.current.isOffline).toBe(true)
    })

    it('should skip fetch when manual offline mode is enabled', async () => {
      const { result } = renderHook(() => useUserStore())

      act(() => {
        result.current.setManualOffline(true)
      })

      await act(async () => {
        await result.current.fetchUsers(1)
      })

      expect(mockFetch).not.toHaveBeenCalled()
      expect(result.current.isError).toBe(true)
      expect(result.current.errorMessage).toBe('Manual offline mode enabled')
      expect(result.current.isOffline).toBe(true)
    })
  })

  describe('Pagination', () => {
    it('should set pagination correctly', () => {
      const { result } = renderHook(() => useUserStore())

      act(() => {
        result.current.setPagination(3, 100)
      })

      expect(result.current.currentPage).toBe(3)
      expect(result.current.totalResults).toBe(100)
    })

    it('should set pagination without total', () => {
      const { result } = renderHook(() => useUserStore())

      // Set initial total
      act(() => {
        result.current.setPagination(1, 50)
      })

      // Update page without changing total
      act(() => {
        result.current.setPagination(2)
      })

      expect(result.current.currentPage).toBe(2)
      expect(result.current.totalResults).toBe(50) // Should remain unchanged
    })
  })

  describe('Favorites Management', () => {
    it('should add user to favorites', async () => {
      const { result } = renderHook(() => useUserStore())

      await act(async () => {
        await result.current.toggleFavorite('user123')
      })

      expect(result.current.favorites.has('user123')).toBe(true)
    })

    it('should remove user from favorites', async () => {
      const { result } = renderHook(() => useUserStore())

      // First add to favorites
      await act(async () => {
        await result.current.toggleFavorite('user123')
      })

      expect(result.current.favorites.has('user123')).toBe(true)

      // Then remove from favorites
      await act(async () => {
        await result.current.toggleFavorite('user123')
      })

      expect(result.current.favorites.has('user123')).toBe(false)
    })
  })

  describe('Error Handling', () => {
    it('should handle loadFavorites error gracefully', async () => {
      const { result } = renderHook(() => useUserStore())

      // This should not throw an error even if IndexedDB operations fail
      await act(async () => {
        await result.current.loadFavorites()
      })

      // Should complete without errors
      expect(result.current.favorites).toEqual(new Set())
    })

    it('should handle loadFromCache error gracefully', async () => {
      const { result } = renderHook(() => useUserStore())

      await act(async () => {
        await result.current.loadFromCache()
      })

      // Should complete without errors
      expect(result.current.users).toEqual([])
    })

    it('should handle clearCache error gracefully', async () => {
      const { result } = renderHook(() => useUserStore())

      await act(async () => {
        await result.current.clearCache()
      })

      // Should complete without errors
      expect(result.current.users).toEqual([])
    })
  })

  describe('Adding Users', () => {
    it('should add users to existing list', () => {
      const { result } = renderHook(() => useUserStore())
      
      const existingUsers: User[] = [{
        id: '1',
        name: { first: 'John', last: 'Doe' },
        email: 'john@example.com',
        dob: { age: 30 },
        location: { country: 'US' },
        login: { uuid: '1' }
      } as User]

      const newUsers: User[] = [{
        id: '2',
        name: { first: 'Jane', last: 'Smith' },
        email: 'jane@example.com',
        dob: { age: 25 },
        location: { country: 'UK' },
        login: { uuid: '2' }
      } as User]

      act(() => {
        result.current.setUsers(existingUsers)
      })

      act(() => {
        result.current.addUsers(newUsers)
      })

      expect(result.current.users).toHaveLength(2)
      expect(result.current.users[0].id).toBe('1')
      expect(result.current.users[1].id).toBe('2')
    })
  })
}) 