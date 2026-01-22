import { Entity, Column, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { BilliardTablePhotoEntity } from './billiard-table-photo.entity';
import {
  BilliardTableStatus,
  BilliardTableType,
} from '../dtos/billiard-table.dto';
import type { BilliardTableId } from '../dtos/billiard-table.dto';

@Entity({ name: 'billiard_tables' })
export class BilliardTableEntity {
  @PrimaryGeneratedColumn('uuid')
  id: BilliardTableId;

  @Column({ type: 'varchar', nullable: false })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', nullable: false })
  hourlyPrice: number;

  @Column({
    type: 'enum',
    enum: BilliardTableType,
  })
  type: BilliardTableType;

  @Column({
    type: 'enum',
    enum: BilliardTableStatus,
    default: BilliardTableStatus.Maintenance,
  })
  status: BilliardTableStatus;

  @OneToMany(() => BilliardTablePhotoEntity, (photo) => photo.billiardTable)
  photos: BilliardTablePhotoEntity[];
}
