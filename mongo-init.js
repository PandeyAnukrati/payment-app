// MongoDB initialization script
db = db.getSiblingDB("payment-dashboard");

// Create collections
db.createCollection("users");
db.createCollection("payments");

// Create indexes for better performance
db.users.createIndex({ username: 1 }, { unique: true });
db.users.createIndex({ email: 1 }, { unique: true });

db.payments.createIndex({ createdAt: -1 });
db.payments.createIndex({ status: 1 });
db.payments.createIndex({ method: 1 });
db.payments.createIndex({ receiver: 1 });
db.payments.createIndex({ transactionId: 1 }, { unique: true });

print("Database initialized successfully!");
