import { Exclude } from 'class-transformer';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

import type { UserId } from '../types/user.types';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: UserId;

  @Column({ unique: true })
  email: string;

  @Exclude()
  @Column()
  password: string;

  @Column()
  name: string;

  @Column()
  surname: string;
}
