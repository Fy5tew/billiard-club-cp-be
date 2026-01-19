import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { BilliardTableEntity } from './billiard-table.entity';
import type { BilliardTablePhotoId } from '../dtos/billiard-table.dto';

@Entity({ name: 'billiard_table_photos' })
export class BilliardTablePhotoEntity {
  @PrimaryGeneratedColumn('uuid')
  id: BilliardTablePhotoId;

  @Column({ type: 'varchar', nullable: false })
  billiardTableId: string;

  @Column({ type: 'varchar', nullable: false })
  photoFilename: string;

  @ManyToOne(() => BilliardTableEntity, (table) => table.photos, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'billiard_table_id' })
  billiardTable: BilliardTableEntity;
}
