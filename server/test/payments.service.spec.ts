import { Test, TestingModule } from "@nestjs/testing";
import { getModelToken } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { PaymentsService } from "../src/payments/payments.service";
import {
  Payment,
  PaymentDocument,
  PaymentStatus,
  PaymentMethod,
} from "../src/payments/schemas/payment.schema";
import { CreatePaymentDto } from "../src/payments/dto/create-payment.dto";
import { PaymentQueryDto } from "../src/payments/dto/payment-query.dto";

describe("PaymentsService", () => {
  let service: PaymentsService;
  let model: Model<PaymentDocument>;

  const mockPayment = {
    _id: "mockId",
    amount: 100,
    receiver: "John Doe",
    status: PaymentStatus.SUCCESS,
    method: PaymentMethod.CREDIT_CARD,
    currency: "USD",
    description: "Test payment",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPaymentModel = {
    new: jest.fn().mockResolvedValue(mockPayment),
    constructor: jest.fn().mockResolvedValue(mockPayment),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    create: jest.fn(),
    countDocuments: jest.fn(),
    aggregate: jest.fn(),
    exec: jest.fn(),
    save: jest.fn().mockResolvedValue(mockPayment),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        {
          provide: getModelToken(Payment.name),
          useValue: mockPaymentModel,
        },
        {
          provide: "WebsocketGateway",
          useValue: {
            emitPaymentUpdate: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    model = module.get<Model<PaymentDocument>>(getModelToken(Payment.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("should create a payment", async () => {
      const createPaymentDto: CreatePaymentDto = {
        amount: 100,
        receiver: "John Doe",
        status: PaymentStatus.SUCCESS,
        method: PaymentMethod.CREDIT_CARD,
        currency: "USD",
        description: "Test payment",
      };

      mockPaymentModel.create.mockResolvedValue(mockPayment);

      const result = await service.create(createPaymentDto);

      expect(mockPaymentModel.create).toHaveBeenCalledWith(createPaymentDto);
      expect(result).toEqual(mockPayment);
    });

    it("should handle creation errors", async () => {
      const createPaymentDto: CreatePaymentDto = {
        amount: 100,
        receiver: "John Doe",
        status: PaymentStatus.SUCCESS,
        method: PaymentMethod.CREDIT_CARD,
        currency: "USD",
      };

      mockPaymentModel.create.mockRejectedValue(new Error("Creation failed"));

      await expect(service.create(createPaymentDto)).rejects.toThrow(
        "Creation failed"
      );
    });
  });

  describe("findAll", () => {
    it("should return paginated payments", async () => {
      const query: PaymentQueryDto = {
        page: 1,
        limit: 10,
      };

      const mockPayments = [mockPayment];
      const mockCount = 1;

      mockPaymentModel.find.mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockPayments),
      });

      mockPaymentModel.countDocuments.mockResolvedValue(mockCount);

      const result = await service.findAll(query);

      expect(result).toEqual({
        payments: mockPayments,
        totalCount: mockCount,
        totalPages: 1,
        currentPage: 1,
      });
    });

    it("should filter payments by status", async () => {
      const query: PaymentQueryDto = {
        status: PaymentStatus.SUCCESS,
        page: 1,
        limit: 10,
      };

      mockPaymentModel.find.mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockPayment]),
      });

      mockPaymentModel.countDocuments.mockResolvedValue(1);

      await service.findAll(query);

      expect(mockPaymentModel.find).toHaveBeenCalledWith({
        status: PaymentStatus.SUCCESS,
      });
    });

    it("should filter payments by method", async () => {
      const query: PaymentQueryDto = {
        method: PaymentMethod.CREDIT_CARD,
        page: 1,
        limit: 10,
      };

      mockPaymentModel.find.mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockPayment]),
      });

      mockPaymentModel.countDocuments.mockResolvedValue(1);

      await service.findAll(query);

      expect(mockPaymentModel.find).toHaveBeenCalledWith({
        method: PaymentMethod.CREDIT_CARD,
      });
    });

    it("should search payments by receiver", async () => {
      const query: PaymentQueryDto = {
        receiver: "John",
        page: 1,
        limit: 10,
      };

      mockPaymentModel.find.mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockPayment]),
      });

      mockPaymentModel.countDocuments.mockResolvedValue(1);

      await service.findAll(query);

      expect(mockPaymentModel.find).toHaveBeenCalledWith({
        receiver: { $regex: "John", $options: "i" },
      });
    });
  });

  describe("findOne", () => {
    it("should return a payment by id", async () => {
      mockPaymentModel.findById.mockResolvedValue(mockPayment);

      const result = await service.findOne("mockId");

      expect(mockPaymentModel.findById).toHaveBeenCalledWith("mockId");
      expect(result).toEqual(mockPayment);
    });

    it("should return null for non-existent payment", async () => {
      mockPaymentModel.findById.mockResolvedValue(null);

      const result = await service.findOne("nonExistentId");

      expect(result).toBeNull();
    });
  });

  describe("getStats", () => {
    it("should return payment statistics", async () => {
      const mockStats = [
        {
          _id: null,
          totalPaymentsToday: 5,
          totalPaymentsWeek: 20,
          totalRevenueToday: 500,
          totalRevenueWeek: 2000,
          failedTransactions: 2,
        },
      ];

      const mockRevenueChart = [
        { _id: "2023-01-01", revenue: 100 },
        { _id: "2023-01-02", revenue: 200 },
      ];

      mockPaymentModel.aggregate
        .mockResolvedValueOnce(mockStats)
        .mockResolvedValueOnce(mockRevenueChart);

      const result = await service.getStats();

      expect(result).toEqual({
        totalPaymentsToday: 5,
        totalPaymentsWeek: 20,
        totalRevenueToday: 500,
        totalRevenueWeek: 2000,
        failedTransactions: 2,
        revenueChart: [
          { date: "2023-01-01", revenue: 100 },
          { date: "2023-01-02", revenue: 200 },
        ],
      });
    });

    it("should handle empty stats", async () => {
      mockPaymentModel.aggregate
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      const result = await service.getStats();

      expect(result).toEqual({
        totalPaymentsToday: 0,
        totalPaymentsWeek: 0,
        totalRevenueToday: 0,
        totalRevenueWeek: 0,
        failedTransactions: 0,
        revenueChart: [],
      });
    });
  });
});
