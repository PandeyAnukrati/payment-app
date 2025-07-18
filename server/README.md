# Payment Dashboard Backend (NestJS)

This is the backend API for the Payment Dashboard application built with NestJS, MongoDB, and WebSockets.

## 🚀 Features

- **JWT Authentication** with role-based access control
- **Payment Management** with CRUD operations
- **User Management** with admin/viewer roles
- **Real-time Updates** via WebSockets
- **Data Validation** with class-validator
- **MongoDB Integration** with Mongoose
- **Auto-seeding** of default data

## 📁 Project Structure

```
src/
├── auth/                   # Authentication module
│   ├── dto/               # Data transfer objects
│   ├── auth.controller.ts # Auth endpoints
│   ├── auth.service.ts    # Auth business logic
│   ├── jwt.strategy.ts    # JWT strategy
│   └── guards/            # Auth guards
├── users/                 # User management
│   ├── schemas/           # MongoDB schemas
│   ├── dto/               # Data transfer objects
│   ├── users.controller.ts
│   └── users.service.ts
├── payments/              # Payment operations
│   ├── schemas/           # Payment schema
│   ├── dto/               # Payment DTOs
│   ├── payments.controller.ts
│   └── payments.service.ts
├── websocket/             # WebSocket gateway
│   ├── websocket.gateway.ts
│   └── websocket.module.ts
├── common/                # Shared utilities
│   └── seeder.service.ts  # Data seeding
├── app.module.ts          # Main app module
└── main.ts                # Application entry point
```

## 🛠 Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env`:
   ```
   MONGODB_URI=mongodb://localhost:27017/payment-dashboard
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=24h
   PORT=3000
   ```

3. **Start MongoDB**
   ```bash
   # Local MongoDB
   mongod
   
   # Or use MongoDB Atlas (cloud)
   # Update MONGODB_URI in .env
   ```

4. **Run the application**
   ```bash
   # Development
   npm run start:dev
   
   # Production
   npm run build
   npm run start:prod
   ```

## 📡 API Endpoints

### Authentication
```
POST /auth/login
Body: { username: string, password: string }
Response: { access_token: string, user: UserObject }

GET /auth/profile
Headers: Authorization: Bearer <token>
Response: UserObject
```

### Payments
```
GET /payments
Query: page, limit, status, method, startDate, endDate, receiver
Headers: Authorization: Bearer <token>
Response: { payments: Payment[], total: number, page: number, totalPages: number }

GET /payments/:id
Headers: Authorization: Bearer <token>
Response: Payment

POST /payments
Headers: Authorization: Bearer <token>
Body: { amount: number, receiver: string, status: string, method: string, description?: string }
Response: Payment

GET /payments/stats
Headers: Authorization: Bearer <token>
Response: PaymentStats
```

### Users (Admin only)
```
GET /users
Headers: Authorization: Bearer <token>
Response: User[]

POST /users
Headers: Authorization: Bearer <token>
Body: { username: string, password: string, email: string, role?: string }
Response: User
```

## 🔐 Authentication & Authorization

### JWT Token
- Tokens expire in 24 hours (configurable)
- Include token in Authorization header: `Bearer <token>`

### Roles
- **admin**: Full access to all endpoints
- **viewer**: Read-only access to payments and stats

### Default Users
The application auto-seeds these users:
- **admin** / admin123 (admin role)
- **viewer** / viewer123 (viewer role)

## 📊 Data Models

### User Schema
```typescript
{
  username: string (unique)
  password: string (hashed)
  email: string (unique)
  role: 'admin' | 'viewer'
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
```

### Payment Schema
```typescript
{
  amount: number
  receiver: string
  status: 'success' | 'failed' | 'pending'
  method: 'credit_card' | 'debit_card' | 'paypal' | 'bank_transfer' | 'crypto'
  description?: string
  transactionId: string (auto-generated)
  currency: string (default: 'USD')
  processedAt: Date
  createdAt: Date
  updatedAt: Date
}
```

## 🔄 WebSocket Events

### Client → Server
```
joinRoom: string          # Join a specific room
leaveRoom: string         # Leave a room
```

### Server → Client
```
paymentUpdate: Payment    # Payment was updated
newPayment: Payment       # New payment created
statsUpdate: PaymentStats # Dashboard stats updated
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 🚀 Deployment

### Docker
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start:prod"]
```

### Environment Variables for Production
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/payment-dashboard
JWT_SECRET=your-super-secure-production-secret
JWT_EXPIRES_IN=24h
PORT=3000
NODE_ENV=production
```

## 📈 Performance Considerations

- **Database Indexing**: Indexes on frequently queried fields
- **Pagination**: All list endpoints support pagination
- **Caching**: Consider Redis for session storage in production
- **Rate Limiting**: Implement rate limiting for API endpoints

## 🔧 Configuration

### MongoDB Connection
The app connects to MongoDB using the `MONGODB_URI` environment variable. It supports both local and cloud MongoDB instances.

### JWT Configuration
JWT tokens are signed with the `JWT_SECRET` and expire based on `JWT_EXPIRES_IN` setting.

### CORS
CORS is enabled for all origins in development. Configure appropriately for production.

## 📝 Logging

The application uses NestJS built-in logger. Logs include:
- HTTP requests and responses
- WebSocket connections
- Database operations
- Authentication events

## 🛡 Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Tokens**: Secure token-based authentication
- **Input Validation**: class-validator for all DTOs
- **CORS Protection**: Configurable CORS settings
- **Role-based Access**: Guards for endpoint protection

## 🤝 Contributing

1. Follow NestJS conventions
2. Add tests for new features
3. Update documentation
4. Use TypeScript strictly
5. Follow the existing code style

## 📞 Support

For issues and questions:
1. Check the logs for error details
2. Verify MongoDB connection
3. Ensure all environment variables are set
4. Check JWT token validity

---

**Backend API is ready! 🚀**