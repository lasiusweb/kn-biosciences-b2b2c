import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { IsNumber, Min, IsUUID, IsString } from 'class-validator';
import { Order } from './order.entity';
import { ProductVariant } from './product-variant.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Order, order => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => ProductVariant, { eager: true })
  @JoinColumn({ name: 'variant_id' })
  variant: ProductVariant;

  @Column({ type: 'int' })
  @IsNumber()
  @Min(1)
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  @IsNumber()
  @Min(0)
  totalPrice: number;

  @Column({ type: 'text', nullable: true })
  @IsString()
  notes?: string;

  @CreateDateColumn()
  createdAt: Date;
}