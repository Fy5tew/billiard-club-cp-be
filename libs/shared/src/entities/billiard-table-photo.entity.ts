import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { BilliardTableEntity } from './billiard-table.entity';
import type {
  BilliardTableId,
  BilliardTablePhotoId,
} from '../dtos/billiard-table.dto';

@Entity({ name: 'billiard_table_photos' })
export class BilliardTablePhotoEntity {
  @PrimaryGeneratedColumn('uuid')
  id: BilliardTablePhotoId;

  @Column({ name: 'billiard_table_id', type: 'uuid', nullable: false })
  billiardTableId: BilliardTableId;

  @Column({ type: 'varchar', nullable: false })
  photoFilename: string;

  @Column({ type: 'int', nullable: false })
  sortOrder: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => BilliardTableEntity, (table) => table.photos, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'billiard_table_id' })
  billiardTable: BilliardTableEntity;
}
