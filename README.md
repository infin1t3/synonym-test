# User Directory - Local-First Application

A modern, responsive user directory application built with Next.js 15, featuring offline-first capabilities, dark mode, and comprehensive testing. This application demonstrates local-first principles by providing full functionality even when offline through intelligent caching and data persistence.

## 🚀 Features

- **Local-First Architecture**: Full offline functionality with IndexedDB caching
- **Persistent Offline Mode**: Toggle offline mode that persists across page refreshes  
- **Dark/Light Theme**: Automatic system theme detection with manual toggle
- **Real-time Search**: Filter users by name or email with instant results
- **Advanced Sorting**: Sort by name, email, age, or country in ascending/descending order
- **Favorites System**: Mark users as favorites with persistent storage
- **Responsive Design**: Mobile-first design that works on all screen sizes
- **Comprehensive Testing**: Full test coverage using React Testing Library and Jest

## 📋 Prerequisites

- Node.js (see `.nvmrc` for required version)
- npm or yarn package manager

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd synonym-test
   ```

2. **Use the correct Node.js version** (if using nvm)
   ```bash
   nvm use
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Set up environment variables** (optional)
   ```bash
   cp .env.example .env.local
   # Edit .env.local to customize the API URL if needed
   ```

## 🚀 Running the Project

### Development Mode
```bash
npm run dev
```
The application will be available at `http://localhost:3000`

### Production Build
```bash
npm run build
npm start
```

### Testing
```bash
# Run tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Linting
```bash
# Check for lint errors
npm run lint

# Fix lint errors automatically
npm run lint:fix
```

## 🔄 Simulating Offline/Failure Scenarios

The application provides multiple ways to test offline functionality:

### 1. Manual Offline Toggle
- Use the **Offline toggle** in the top-right corner of the application
- This simulates offline mode and forces the app to use cached data
- The setting persists across page refreshes

### 2. Browser Developer Tools
- Open Chrome/Firefox DevTools (F12)
- Go to the **Network** tab
- Check **"Offline"** to simulate network failure
- The app will automatically detect this and switch to cached data

### 3. Network Throttling
- In DevTools Network tab, select **"Slow 3G"** or **"Fast 3G"**
- This helps test loading states and error handling

### 4. API Endpoint Modification
- Modify the `NEXT_PUBLIC_API_URL` in `.env.local` to point to a non-existent endpoint
- This will trigger error states and fallback to cached data

## 🧪 Testing Strategy

The test suite covers:

- **State Management**: All Zustand store actions and state changes
- **Data Fetching**: API calls, error handling, and offline scenarios  
- **Search & Filtering**: Text search and sorting functionality
- **Favorites Management**: Adding/removing favorites with persistence
- **Error Handling**: Graceful degradation when operations fail
- **Offline Behavior**: Manual offline mode and cache loading

Run tests with:
```bash
npm test -- --coverage
```

## 🏗️ Architecture

### Tech Stack
- **Framework**: Next.js 15 with App Router
- **State Management**: Zustand with persistence middleware
- **Database**: IndexedDB via Dexie.js for client-side storage
- **Styling**: Tailwind CSS v4
- **Icons**: Radix UI Icons
- **Testing**: Jest + React Testing Library
- **TypeScript**: Full type safety throughout

### Key Design Patterns
- **Local-First**: Data is cached locally and the app works offline
- **Progressive Enhancement**: Core functionality works without JavaScript
- **Responsive Design**: Mobile-first approach with fluid layouts
- **Error Boundaries**: Graceful error handling and recovery
- **Optimistic Updates**: UI updates immediately, syncs in background

## 🎯 Known Issues & Limitations

### Current Limitations
1. **Limited Pagination**: Only basic pagination is implemented (no virtual scrolling for very large datasets)
2. **Search Performance**: Client-side search may be slow with thousands of users
3. **Sync Conflicts**: No conflict resolution for data that changes while offline
4. **Image Caching**: User profile images are not cached for offline viewing
5. **Real-time Updates**: No WebSocket support for real-time data updates

### Browser Compatibility
- **Modern Browsers**: Full support for Chrome 90+, Firefox 88+, Safari 14+
- **IndexedDB**: Required for offline functionality (supported in all modern browsers)
- **CSS Grid/Flexbox**: Used extensively (IE11 not supported)

## 🔮 Future Improvements

Given more time, I would implement:

### Performance Optimizations
- **Virtual Scrolling**: Handle thousands of users efficiently
- **Service Worker**: More robust offline capabilities and background sync
- **Image Optimization**: Lazy loading and WebP format support
- **Bundle Splitting**: Code splitting for better initial load times

### Enhanced Features
- **Advanced Search**: Full-text search with filters by location, age range, etc.
- **Data Synchronization**: Conflict resolution for offline changes
- **User Profiles**: Detailed view with more user information
- **Export Functionality**: CSV/PDF export of user lists
- **Accessibility**: Screen reader support and keyboard navigation

### Developer Experience
- **Storybook**: Component documentation and visual testing
- **E2E Testing**: Playwright or Cypress integration
- **Performance Monitoring**: Real User Monitoring (RUM) integration
- **Error Tracking**: Sentry or similar error tracking service

### Infrastructure
- **PWA Support**: App manifest and service worker for mobile installation
- **CDN Integration**: Static asset optimization
- **API Pagination**: Server-side pagination for better performance
- **Real-time Features**: WebSocket integration for live updates

## 📁 Project Structure

```
src/
├── app/                 # Next.js App Router pages
├── components/          # Reusable React components
├── lib/                 # Utility functions and configurations
│   ├── constants.ts     # Application constants
│   └── db.ts           # Dexie database configuration
└── store/              # Zustand state management
    ├── userStore.ts    # Main application state
    └── __tests__/      # Test files
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Built with ❤️ using Next.js, TypeScript, and modern web technologies.**
