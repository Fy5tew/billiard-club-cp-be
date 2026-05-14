import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum NewsStatus {
  Draft = 'Draft',
  Review = 'Review',
  Published = 'Published',
}

@Entity('news')
export class NewsEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'text' })
  summary: string;

  @Column({ type: 'jsonb' })
  content: Record<string, unknown>;

  @Column({ type: 'text', default: '' })
  searchText: string;

  @Index('news_status_idx')
  @Column({
    type: 'enum',
    enum: NewsStatus,
    default: NewsStatus.Draft,
  })
  status: NewsStatus;

  @Column('text', { array: true, default: [] })
  tags: string[];

  @Column({ type: 'varchar', nullable: true })
  coverImageFilename: string | null;

  @Column({ type: 'uuid' })
  authorId: string;

  @Index('news_published_at_idx')
  @Column({ type: 'timestamp', nullable: true })
  publishedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
