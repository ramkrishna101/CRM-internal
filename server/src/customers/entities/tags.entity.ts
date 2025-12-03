import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tags')
export class Tag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 255 })
  color: string;
}
