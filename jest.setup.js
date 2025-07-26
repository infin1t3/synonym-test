import '@testing-library/jest-dom'

// Mock IndexedDB for Dexie
import 'fake-indexeddb/auto'

// Polyfill for structuredClone (needed for fake-indexeddb)
global.structuredClone = (obj) => JSON.parse(JSON.stringify(obj))

// Mock environment variables
process.env.NEXT_PUBLIC_API_URL = 'https://randomuser.me/api' 