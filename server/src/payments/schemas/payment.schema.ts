import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PaymentDocument = Payment & Document;

export enum PaymentStatus {
  SUCCESS = 'success',
  FAILED = 'failed',
  PENDING = 'pending',
}

export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  PAYPAL = 'paypal',
  BANK_TRANSFER = 'bank_transfer',
  CRYPTO = 'crypto',
}

@Schema({ timestamps: true })
export class Payment {
  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  receiver: string;

  @Prop({ enum: PaymentStatus, required: true })
  status: PaymentStatus;

  @Prop({ enum: PaymentMethod, required: true })
  method: PaymentMethod;

  @Prop()
  description?: string;

  @Prop()
  transactionId: string;

  @Prop()
  currency: string;

  @Prop({ default: Date.now })
  processedAt: Date;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);