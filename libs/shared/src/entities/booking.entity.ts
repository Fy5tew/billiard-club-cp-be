import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { BilliardTableEntity } from './billiard-table.entity';
import { UserEntity } from './user.entity';
import type { BilliardTableId } from '../dtos/billiard-table.dto';
import { BookingStatus } from '../dtos/booking.dto';
import type { UserId } from '../dtos/user.dto';

@Entity('bookings')
export class BookingEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  userId: UserId | null;

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'userId' })
  _user?: UserEntity;

  @Column({ type: 'uuid', nullable: true })
  billiardTableId: BilliardTableId | null;

  @ManyToOne(() => BilliardTableEntity, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'billiardTableId' })
  _billiardTable?: BilliardTableEntity;

  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.Pending,
  })
  status: BookingStatus;

  @Column({ type: 'timestamp' })
  startTime: Date;

  @Column({ type: 'timestamp' })
  endTime: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalCost: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
