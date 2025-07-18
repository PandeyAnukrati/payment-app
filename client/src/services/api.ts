import axios from "axios";
import * as SecureStore from "expo-secure-store";

const API_BASE_URL = "http://10.94.178.232:3000"; // Change this to your server URL

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync("access_token");
      await SecureStore.deleteItemAsync("user");
      // You might want to redirect to login screen here
    }
    return Promise.reject(error);
  }
);

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
}

export interface Payment {
  _id: string;
  amount: number;
  receiver: string;
  status: "success" | "failed" | "pending";
  method: "credit_card" | "debit_card" | "paypal" | "bank_transfer" | "crypto";
  description?: string;
  transactionId: string;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentStats {
  totalPaymentsToday: number;
  totalPaymentsWeek: number;
  totalRevenueToday: number;
  totalRevenueWeek: number;
  failedTransactions: number;
  revenueChart: Array<{
    date: string;
    revenue: number;
    count: number;
  }>;
}

export interface PaymentQuery {
  page?: number;
  limit?: number;
  status?: string;
  method?: string;
  startDate?: string;
  endDate?: string;
  receiver?: string;
}

export interface PaymentListResponse {
  payments: Payment[];
  total: number;
  page: number;
  totalPages: number;
}

export interface CreatePaymentDto {
  amount: number;
  receiver: string;
  status: "success" | "failed" | "pending";
  method: "credit_card" | "debit_card" | "paypal" | "bank_transfer" | "crypto";
  description?: string;
  currency?: string;
}

export const authAPI = {
  login: (credentials: LoginCredentials): Promise<LoginResponse> =>
    api.post("/auth/login", credentials).then((res) => res.data),

  getProfile: () => api.get("/auth/profile").then((res) => res.data),
};

export const paymentsAPI = {
  getPayments: (query: PaymentQuery = {}): Promise<PaymentListResponse> =>
    api.get("/payments", { params: query }).then((res) => res.data),

  getPayment: (id: string): Promise<Payment> =>
    api.get(`/payments/${id}`).then((res) => res.data),

  createPayment: (payment: CreatePaymentDto): Promise<Payment> =>
    api.post("/payments", payment).then((res) => res.data),

  getStats: (): Promise<PaymentStats> =>
    api.get("/payments/stats").then((res) => res.data),
};

export const usersAPI = {
  getUsers: () => api.get("/users").then((res) => res.data),

  createUser: (user: any) => api.post("/users", user).then((res) => res.data),
};

export default api;
