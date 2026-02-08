import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { IsEnum, IsOptional, IsString, IsNumber, Min, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { Product } from './product.entity';
import { ProductBatch } from './product-batch.entity';
import { Exclude } from 'class-transformer';

export enum WeightUnit {
  G = 'g',
  KG = 'kg',
  ML = 'ml',
  L = 'l',
}

export enum PackingType {
  BOX = 'box',
  DRUM = 'drum',
  BAG = 'bag',
  BOTTLE = 'bottle',
  POUCH = 'pouch',
  CARTON = 'carton',
  CONTAINER = 'container',
}

export enum ProductForm {
  POWDER = 'powder',
  LIQUID = 'liquid',
  GRANULES = 'granules',
  TABLET = 'tablet',
  CAPSULE = 'capsule',
  SEED = 'seed',
  PLANT = 'plant',
  EQUIPMENT = 'equipment',
}

@Entity('product_variants')
export class ProductVariant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Product, product => product.variants, { eager: true })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ unique: true })
  @IsString()
  sku: string;

  @Column({ type: 'decimal', precision: 10, scale: 3 })
  @IsNumber()
  @Min(0)
  weight: number;

  @Column({
    type: 'enum',
    enum: WeightUnit,
  })
  @IsEnum(WeightUnit)
  weightUnit: WeightUnit;

  @Column({
    type: 'enum',
    enum: PackingType,
  })
  @IsEnum(PackingType)
  packingType: PackingType;

  @Column({
    type: 'enum',
    enum: ProductForm,
  })
  @IsEnum(ProductForm)
  form: ProductForm;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  @IsNumber()
  @Min(0)
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  comparePrice?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  costPrice?: number;

  @Column({ type: 'int', default: 0 })
  @IsNumber()
  @Min(0)
  stockQuantity: number;

  @Column({ type: 'int', default: 10 })
  @IsNumber()
  @Min(0)
  lowStockThreshold: number;

  @Column({ default: true })
  @IsBoolean()
  trackInventory: boolean;

  @Column('text', { array: true, default: '{}' })
  @IsOptional()
  @IsArray()
  imageUrls: string[];

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Column({ default: true })
  @IsBoolean()
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => ProductBatch, batch => batch.variant)
  batches: ProductBatch[];
}