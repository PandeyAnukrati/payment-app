import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payment, PaymentDocument, PaymentStatus } from './schemas/payment.schema';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentQueryDto } from './dto/payment-query.dto';
import { WebsocketGateway } from '../websocket/websocket.gateway';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    @Inject(forwardRef(() => WebsocketGateway))
    private websocketGateway: WebsocketGateway,
  ) {}

  async create(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    const transactionId = this.generateTransactionId();
    const payment = new this.paymentModel({
      ...createPaymentDto,
      transactionId,
      currency: createPaymentDto.currency || 'USD',
    });
    const savedPayment = await payment.save();
    
    // Emit real-time update
    this.websocketGateway.emitNewPayment(savedPayment);
    
    // Update stats
    const stats = await this.getStats();
    this.websocketGateway.emitStatsUpdate(stats);
    
    return savedPayment;
  }

  async findAll(query: PaymentQueryDto): Promise<{
    payments: Payment[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 10, status, method, startDate, endDate, receiver } = query;
    
    const filter: any = {};
    
    if (status) filter.status = status;
    if (method) filter.method = method;
    if (receiver) filter.receiver = { $regex: receiver, $options: 'i' };
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;
    
    const [payments, total] = await Promise.all([
      this.paymentModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.paymentModel.countDocuments(filter),
    ]);

    return {
      payments,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Payment> {
    const payment = await this.paymentModel.findById(id).exec();
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    return payment;
  }

  async getStats(): Promise<any> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    weekAgo.setHours(0, 0, 0, 0);

    const [
      totalPaymentsToday,
      totalPaymentsWeek,
      totalRevenueToday,
      totalRevenueWeek,
      failedTransactions,
      revenueChart,
    ] = await Promise.all([
      this.paymentModel.countDocuments({
        createdAt: { $gte: today },
        status: PaymentStatus.SUCCESS,
      }),
      this.paymentModel.countDocuments({
        createdAt: { $gte: weekAgo },
        status: PaymentStatus.SUCCESS,
      }),
      this.paymentModel.aggregate([
        {
          $match: {
            createdAt: { $gte: today },
            status: PaymentStatus.SUCCESS,
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
          },
        },
      ]),
      this.paymentModel.aggregate([
        {
          $match: {
            createdAt: { $gte: weekAgo },
            status: PaymentStatus.SUCCESS,
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
          },
        },
      ]),
      this.paymentModel.countDocuments({
        status: PaymentStatus.FAILED,
      }),
      this.getRevenueChart(),
    ]);

    return {
      totalPaymentsToday,
      totalPaymentsWeek,
      totalRevenueToday: totalRevenueToday[0]?.total || 0,
      totalRevenueWeek: totalRevenueWeek[0]?.total || 0,
      failedTransactions,
      revenueChart,
    };
  }

  private async getRevenueChart(): Promise<any[]> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const chartData = await this.paymentModel.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
          status: PaymentStatus.SUCCESS,
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt',
            },
          },
          revenue: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Fill missing days with 0
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      const dayData = chartData.find(item => item._id === dateString);
      result.push({
        date: dateString,
        revenue: dayData?.revenue || 0,
        count: dayData?.count || 0,
      });
    }

    return result;
  }

  private generateTransactionId(): string {
    return 'TXN' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();
  }

  async seedSampleData(): Promise<void> {
    const count = await this.paymentModel.countDocuments();
    if (count > 0) return;

    const samplePayments = [
      {
        amount: 150.00,
        receiver: 'John Doe',
        status: PaymentStatus.SUCCESS,
        method: 'credit_card' as any,
        description: 'Online purchase',
        currency: 'USD',
      },
      {
        amount: 75.50,
        receiver: 'Jane Smith',
        status: PaymentStatus.SUCCESS,
        method: 'paypal' as any,
        description: 'Service payment',
        currency: 'USD',
      },
      {
        amount: 200.00,
        receiver: 'Bob Johnson',
        status: PaymentStatus.FAILED,
        method: 'bank_transfer' as any,
        description: 'Refund',
        currency: 'USD',
      },
      {
        amount: 89.99,
        receiver: 'Alice Brown',
        status: PaymentStatus.PENDING,
        method: 'debit_card' as any,
        description: 'Subscription',
        currency: 'USD',
      },
    ];

    for (const payment of samplePayments) {
      await this.create(payment);
    }
  }
}