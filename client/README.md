# Payment Dashboard Mobile App (React Native)

A mobile-first Payment Management Dashboard built with React Native and Expo that provides a beautiful, intuitive interface for managing payments and viewing analytics.

## 🚀 Features

- **Secure Authentication**: JWT-based login with secure token storage
- **Dashboard Analytics**: Real-time payment metrics and revenue charts
- **Transaction Management**: View, filter, and search payment transactions
- **Payment Creation**: Simulate new payments with various methods
- **Real-time Updates**: Live data updates via WebSocket connection
- **Responsive Design**: Optimized for mobile devices
- **Offline Support**: Graceful handling of network issues

## 📱 Screenshots

_Add your app screenshots here_

## 🛠 Tech Stack

- **React Native**: Cross-platform mobile development
- **Expo**: Development platform and tools
- **React Navigation**: Navigation library
- **React Native Paper**: Material Design components
- **React Native Chart Kit**: Beautiful charts and graphs
- **Axios**: HTTP client for API calls
- **Socket.IO**: Real-time WebSocket communication
- **Expo Secure Store**: Secure token storage
- **TypeScript**: Type-safe development

## 📁 Project Structure

```
src/
├── screens/                    # App screens
│   ├── LoginScreen.tsx        # Authentication screen
│   ├── DashboardScreen.tsx    # Main dashboard with metrics
│   ├── TransactionListScreen.tsx # Payment transactions list
│   ├── TransactionDetailsScreen.tsx # Individual payment details
│   └── AddPaymentScreen.tsx   # Create new payment form
├── components/                 # Reusable components
│   └── TransactionCard.tsx    # Payment transaction card
├── services/                   # External services
│   ├── api.ts                 # REST API client
│   └── websocket.ts           # WebSocket service
├── utils/                      # Utility functions
│   └── auth.ts                # Authentication helpers
└── types/                      # TypeScript type definitions
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (Mac) or Android Studio
- Physical device with Expo Go app

### Installation

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure API endpoints**

   Update the server URLs in:

   - `src/services/api.ts`
   - `src/services/websocket.ts`

   ```typescript
   const API_BASE_URL = "http://YOUR_SERVER_IP:3000";
   ```

3. **Start the development server**

   ```bash
   npm start
   ```

4. **Run on device/simulator**
   - **Physical Device**: Install Expo Go and scan QR code
   - **iOS Simulator**: Press `i` in terminal
   - **Android Emulator**: Press `a` in terminal

## 📱 App Screens

### 1. Login Screen

- Username/password authentication
- Secure token storage
- Demo credentials display
- Beautiful gradient design

### 2. Dashboard Screen

- Key payment metrics cards
- Revenue trend chart (last 7 days)
- Real-time data updates
- Pull-to-refresh functionality

### 3. Transactions List

- Paginated payment list
- Search by receiver name
- Filter by status and payment method
- Real-time new payment notifications

### 4. Transaction Details

- Complete payment information
- Status indicators
- Payment method icons
- Formatted dates and amounts

### 5. Add Payment Screen

- Payment creation form
- Dropdown selectors for status/method
- Form validation
- Success/error handling

## 🔐 Authentication

### Login Process

1. User enters credentials
2. App calls `/auth/login` endpoint
3. JWT token stored securely using Expo Secure Store
4. User data cached for app state
5. Token included in all API requests

### Token Management

```typescript
// Store token securely
await storeToken(response.access_token);

// Retrieve token for API calls
const token = await getToken();

// Logout and clear data
await logout();
```

## 📊 Real-time Features

### WebSocket Integration

The app connects to WebSocket server for real-time updates:

```typescript
// Connect to WebSocket
const socket = WebSocketService.connect();

// Join dashboard room for stats updates
WebSocketService.joinRoom("dashboard");

// Listen for new payments
WebSocketService.onNewPayment((payment) => {
  // Update UI with new payment
});

// Listen for stats updates
WebSocketService.onStatsUpdate((stats) => {
  // Update dashboard metrics
});
```

## 🎨 UI/UX Features

### Design System

- **Material Design**: React Native Paper components
- **Consistent Colors**: Primary (#667eea) and accent colors
- **Typography**: Clear hierarchy and readable fonts
- **Icons**: Material Icons for consistency
- **Animations**: Smooth transitions and loading states

### Responsive Design

- Optimized for various screen sizes
- Touch-friendly interface elements
- Proper spacing and padding
- Accessible design patterns

## 🔧 Configuration

### API Configuration

Update server endpoints in `src/services/api.ts`:

```typescript
const API_BASE_URL = "http://localhost:3000"; // Development
// const API_BASE_URL = 'https://your-api.com'; // Production
```

### App Configuration

Modify `app.json` for app settings:

```json
{
  "expo": {
    "name": "Payment Dashboard",
    "slug": "payment-dashboard",
    "version": "1.0.0"
    // ... other settings
  }
}
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

### Test Structure

```
__tests__/
├── screens/           # Screen component tests
├── components/        # Component unit tests
├── services/          # Service layer tests
└── utils/            # Utility function tests
```

## 📦 Building for Production

### Android Build

```bash
# Build APK
expo build:android

# Build AAB (recommended for Play Store)
expo build:android -t app-bundle
```

### iOS Build

```bash
# Build for App Store
expo build:ios

# Build for simulator
expo build:ios -t simulator
```

### Over-the-Air Updates

```bash
# Publish update
expo publish

# Publish to specific channel
expo publish --release-channel production
```

## 🚀 Deployment

### Expo Application Services (EAS)

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure EAS
eas build:configure

# Build for production
eas build --platform all
```

### Environment Variables

Create `.env` files for different environments:

```bash
# .env.development
API_BASE_URL=http://localhost:3000

# .env.production
API_BASE_URL=https://your-production-api.com
```

## 🔍 Debugging

### Common Issues

1. **Network Requests Failing**

   - Check API URL configuration
   - Verify server is running
   - Check device/emulator network connectivity

2. **Authentication Issues**

   - Clear stored tokens: `await logout()`
   - Check JWT token expiration
   - Verify server authentication endpoint

3. **WebSocket Connection Issues**
   - Check WebSocket server URL
   - Verify network connectivity
   - Check server WebSocket configuration

### Debug Tools

- **React Native Debugger**: Advanced debugging
- **Flipper**: Mobile app debugging platform
- **Expo Dev Tools**: Built-in debugging tools

## 📈 Performance Optimization

### Best Practices

- **Image Optimization**: Use appropriate image sizes
- **List Performance**: Implement FlatList for large datasets
- **Memory Management**: Proper cleanup of listeners
- **Bundle Size**: Remove unused dependencies
- **Caching**: Implement appropriate caching strategies

### Monitoring

- **Expo Analytics**: Track app usage
- **Crash Reporting**: Monitor app stability
- **Performance Metrics**: Track app performance

## 🤝 Contributing

### Development Workflow

1. Create feature branch
2. Follow TypeScript best practices
3. Add tests for new features
4. Update documentation
5. Submit pull request

### Code Style

- Use TypeScript for type safety
- Follow React Native best practices
- Use consistent naming conventions
- Add proper error handling
- Include loading states

## 📞 Support

### Troubleshooting

1. Check Expo documentation
2. Verify all dependencies are installed
3. Clear Metro cache: `expo start -c`
4. Reset Expo cache: `expo r -c`

### Getting Help

- Expo Discord community
- React Native documentation
- Stack Overflow
- GitHub issues

---

**Happy Mobile Development! 📱**
