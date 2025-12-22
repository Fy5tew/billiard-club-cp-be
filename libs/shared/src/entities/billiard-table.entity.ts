import {
  Entity,
  Column,
  OneToMany,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import {
  BilliardTableStatus,
  BilliardTableType,
} from '../dtos/billiard-table.dto';
import type { BilliardTableId } from '../dtos/billiard-table.dto';
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
    default: BilliardTableStatus.Available,
  })
  status: BilliardTableStatus;

  @OneToMany(() => BilliardTablePhotoEntity, (photo) => photo.billiardTable)
  photos: BilliardTablePhotoEntity[];
}
