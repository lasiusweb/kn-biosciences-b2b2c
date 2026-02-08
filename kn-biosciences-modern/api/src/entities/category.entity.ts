import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { IsEnum, IsOptional, IsString, IsNumber, Min, IsBoolean, ValidateNested, IsUUID } from 'class-validator';
import { Product } from './product.entity';

export enum CategoryStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  HIDDEN = 'hidden',
}

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @IsString()
  name: string;

  @Column({ unique: true })
  @IsString()
  slug: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ManyToOne(() => Category, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'parent_id' })
  parent?: Category;

  @Column({ type: 'int', default: 0 })
  @IsNumber()
  @Min(0)
  sortOrder: number;

  @Column({ default: true })
  @IsBoolean()
  isActive: boolean;

  @Column({
    type: 'enum',
    enum: CategoryStatus,
    default: CategoryStatus.ACTIVE,
  })
  @IsEnum(CategoryStatus)
  status: CategoryStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => Category, category => category.parent)
  children: Category[];

  @OneToMany(() => Product, product => product.category)
  products: Product[];
}