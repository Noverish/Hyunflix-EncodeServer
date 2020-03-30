import {
  Entity, BaseEntity, PrimaryGeneratedColumn, Column,
} from 'typeorm';

@Entity()
export default class Video extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  path: string;

  @Column()
  duration: number;

  @Column()
  width: number;

  @Column()
  height: number;

  @Column()
  bitrate: number;

  @Column('bigint')
  size: string;

  @Column({ default: '' })
  tags: string;

  @Column({ default: '' })
  authority: string;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  date: Date;
}
