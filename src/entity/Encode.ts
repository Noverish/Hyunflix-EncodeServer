import { Entity, BaseEntity, PrimaryColumn, Column } from 'typeorm';

@Entity()
export class Encode extends BaseEntity {
  @PrimaryColumn()
  id: number;

  @Column()
  inpath: string;

  @Column()
  outpath: string;

  @Column()
  options: string;

  @Column()
  progress: number;

  @Column()
  date: Date;
}
