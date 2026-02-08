import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { IsEnum, IsOptional, IsString, IsNumber, Min, IsDecimal, ValidateNested, IsUUID, IsDate } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { User } from './user.entity';
import { OrderItem } from './order-item.entity';

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export enum PaymentMethod {
  RAZORPAY = 'razorpay',
  PAYU = 'payu',
  EASEBUZZ = 'easebuzz',
  STRIPE = 'stripe',
  BANK_TRANSFER = 'bank_transfer',
  COD = 'cod',
  UPI = 'upi',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @IsString()
  orderNumber: string;

  @ManyToOne(() => User, user => user.orders, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  @IsEnum(PaymentStatus)
  paymentStatus: PaymentStatus;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
  })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  paymentId?: string;

  @Column({ default: 'INR' })
  @IsString()
  currency: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  @IsNumber()
  @Min(0)
  subtotal: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  @IsNumber()
  @Min(0)
  taxAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  @IsNumber()
  @Min(0)
  shippingAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  @IsNumber()
  @Min(0)
  discountAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  @IsNumber()
  @Min(0)
  totalAmount: number;

  @Column('jsonb')
  shippingAddress: {
    firstName: string;
    lastName: string;
    company?: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
    email: string;
  };

  @Column('jsonb')
  billingAddress: {
    firstName: string;
    lastName: string;
    company?: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
    email: string;
  };

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  paymentLinkUrl?: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  shippingType?: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  shippingCarrier?: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  trackingNumber?: string;

  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  @Transform(({ value }) => value && new Date(value))
  shippedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  @Transform(({ value }) => value && new Date(value))
  deliveredAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => OrderItem, orderItem => orderItem.order, { cascade: true })
  items: OrderItem[];
}