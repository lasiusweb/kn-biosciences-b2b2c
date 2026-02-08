import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { IsEnum, IsOptional, IsString, IsNumber, Min, Max, IsBoolean, IsArray, ArrayMaxSize } from 'class-validator';
import { Category } from './category.entity';
import { ProductVariant } from './product-variant.entity';

export enum ProductStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DRAFT = 'draft',
  ARCHIVED = 'archived',
}

export enum ProductSegment {
  AGRICULTURE = 'agriculture',
  AQUACULTURE = 'aquaculture',
  POULTRY_HEALTHCARE = 'poultry_healthcare',
  ANIMAL_HEALTHCARE = 'animal_healthcare',
  BIOREMEDIATION = 'bioremediation',
  SEEDS = 'seeds',
  ORGANIC_FARMING = 'organic_farming',
  FARM_EQUIPMENT = 'farm_equipment',
  TESTING_LAB = 'testing_lab',
  OILPALM = 'oilpalm',
}

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @IsString()
  name: string;

  @Column({ unique: true })
  @IsString()
  slug: string;

  @Column({ type: 'text' })
  @IsString()
  description: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  shortDescription?: string;

  @ManyToOne(() => Category, category => category.products, { eager: true })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({
    type: 'enum',
    enum: ProductSegment,
  })
  @IsEnum(ProductSegment)
  segment: ProductSegment;

  @Column({
    type: 'enum',
    enum: ProductStatus,
    default: ProductStatus.DRAFT,
  })
  @IsEnum(ProductStatus)
  status: ProductStatus;

  @Column({ default: false })
  @IsBoolean()
  featured: boolean;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  metaTitle?: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  metaDescription?: string;

  @Column('simple-array', { nullable: true })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  tags?: string[];

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  costPrice?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  msrp?: number; // Manufacturer's Suggested Retail Price

  @Column({ type: 'int', default: 0 })
  @IsNumber()
  @Min(0)
  sortOrder: number;

  @Column({ type: 'int', default: 0 })
  @IsNumber()
  @Min(0)
  viewCount: number;

  @Column({ type: 'int', default: 0 })
  @IsNumber()
  @Min(0)
  purchaseCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => ProductVariant, variant => variant.product)
  variants: ProductVariant[];
}