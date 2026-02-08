import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { IsEmail, IsEnum, IsOptional, IsString, IsPhoneNumber, Length } from 'class-validator';
import { Exclude } from 'class-transformer';
import { Order } from './order.entity';

export enum UserRole {
  FARMER = 'farmer',
  DEALER = 'dealer',
  DISTRIBUTOR = 'distributor',
  ADMIN = 'admin',
  STAFF = 'staff',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING_VERIFICATION = 'pending_verification',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @IsEmail()
  email: string;

  @Exclude()
  @Column()
  password: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  firstName: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  lastName: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsPhoneNumber()
  phone: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.FARMER,
  })
  @IsEnum(UserRole)
  role: UserRole;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.PENDING_VERIFICATION,
  })
  @IsEnum(UserStatus)
  status: UserStatus;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(2, 255)
  companyName?: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(10, 15)
  gstNumber?: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  profilePictureUrl?: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  address?: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  district?: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  state?: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  pincode?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => Order, order => order.user)
  orders: Order[];
}