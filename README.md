# Full-Stack Payment Dashboard App

A secure, mobile-first Payment Management Dashboard built with React Native & NestJS that enables viewing and filtering payment transactions, simulating new payments, viewing payment trends and metrics, and managing users.

## 🚀 Features

### Frontend (React Native)

- **Login Screen**: JWT-based authentication with secure storage
- **Dashboard Screen**: Key payment metrics with real-time charts
- **Transactions List**: Paginated list with filters and search
- **Transaction Details**: Detailed view of individual payments
- **Add Payment Form**: Create new simulated payments
- **Real-time Updates**: WebSocket integration for live data

### Backend (NestJS)

- **Authentication**: JWT-based auth with role-based access control
- **Payment Management**: CRUD operations with filtering and pagination
- **User Management**: Admin and viewer roles
- **Real-time Features**: WebSocket support for live updates
- **Database**: MongoDB with Mongoose ODM
- **API Documentation**: RESTful API with validation

## 🛠 Tech Stack

| Layer            | Technology             |
| ---------------- | ---------------------- |
| Frontend         | React Native (Expo)    |
| Backend          | NestJS                 |
| Database         | MongoDB                |
| Authentication   | JWT                    |
| Charts           | react-native-chart-kit |
| Real-time        | WebSockets             |
| State Management | React Hooks            |

## 📱 Screenshots

_Add screenshots of your app here_

## 🏗 Project Structure

```
Payment-method/
├── server/                 # NestJS Backend
│   ├── src/
│   │   ├── auth/          # Authentication module
│   │   ├── users/         # User management
│   │   ├── payments/      # Payment operations
│   │   ├── websocket/     # WebSocket gateway
│   │   └── common/        # Shared utilities
│   └── package.json
├── client/                # React Native Frontend
│   ├── src/
│   │   ├── screens/       # App screens
│   │   ├── components/    # Reusable components
│   │   ├── services/      # API and WebSocket services
│   │   └── utils/         # Utility functions
│   └── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud)
- Expo CLI
- Android Studio / Xcode (for device testing)

### Backend Setup

1. **Navigate to server directory**

   ```bash
   cd server
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   ```bash
   # Copy .env file and update values
   cp .env.example .env
   ```

   Update `.env` with your MongoDB connection string:

   ```
   MONGODB_URI=mongodb://localhost:27017/payment-dashboard
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=24h
   PORT=3000
   ```

4. **Start MongoDB**

   ```bash
   # If using local MongoDB
   mongod
   ```

5. **Run the server**

   ```bash
   npm run start:dev
   ```

   The server will start on `http://localhost:3000`

### Frontend Setup

1. **Navigate to client directory**

   ```bash
   cd client
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Update API URL**

   In `src/services/api.ts` and `src/services/websocket.ts`, update the server URL:

   ```typescript
   const API_BASE_URL = "http://YOUR_IP_ADDRESS:3000"; // Replace with your server IP
   ```

4. **Start the Expo development server**

   ```bash
   npm start
   ```

5. **Run on device/simulator**
   - Install Expo Go app on your mobile device
   - Scan the QR code from the terminal
   - Or press `a` for Android emulator, `i` for iOS simulator

## 🔐 Default Credentials

The app comes with pre-seeded user accounts:

| Role   | Username | Password  |
| ------ | -------- | --------- |
| Admin  | admin    | admin123  |
| Viewer | viewer   | viewer123 |

## 📡 API Endpoints

### Authentication

- `POST /auth/login` - User login
- `GET /auth/profile` - Get user profile

### Payments

- `GET /payments` - List payments (with filters)
- `GET /payments/:id` - Get payment details
- `POST /payments` - Create new payment
- `GET /payments/stats` - Get dashboard statistics

### Users (Admin only)

- `GET /users` - List all users
- `POST /users` - Create new user

## 🔄 Real-time Features

The app includes WebSocket integration for:

- Live payment updates
- Real-time dashboard statistics
- New payment notifications

## 🧪 Testing

### Backend Testing

```bash
cd server
npm run test
npm run test:e2e
```

### Frontend Testing

```bash
cd client
npm test
```

## 📦 Building for Production

### Backend

```bash
cd server
npm run build
npm run start:prod
```

### Frontend

```bash
cd client
expo build:android
expo build:ios
```

## 🔧 Configuration

### Environment Variables

**Server (.env)**

```
MONGODB_URI=mongodb://localhost:27017/payment-dashboard
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h
PORT=3000
```

**Client**
Update API URLs in:

- `src/services/api.ts`
- `src/services/websocket.ts`

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- NestJS team for the amazing framework
- React Native community for excellent libraries
- MongoDB for the flexible database solution
- Expo team for simplifying React Native development

## 📞 Support

If you have any questions or need help with setup, please create an issue in the repository.

---

**Happy Coding! 🚀**
