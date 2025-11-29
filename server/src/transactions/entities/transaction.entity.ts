import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string; // BigInt is returned as string in JS/TS usually to avoid precision loss

  @Column({ type: 'timestamptz' })
  date: Date;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ length: 255 })
  type: string;

  @Column({ type: 'text' })
  remark: string;

  @Column({ length: 255 })
  panel: string;

  // The client column (external_id in customer record)
  // Note: The relationship to Customer is composite and requires joining through websites table
  // Join condition: transaction.website -> websites.name -> websites.id -> customer.website_id
  //                 AND transaction.client -> customer.external_id
  // This must be handled manually in queries due to the three-table join requirement
  @Column({ name: 'client', length: 255, nullable: true })
  client: string;

  @Column({ length: 255 })
  branch: string;

  @Column({ name: 'source_file', length: 255 })
  sourceFile: string;

  // This is the website name/identifier string, NOT the UUID
  // Maps to websites.name or websites.url
  @Column({ length: 255 })
  website: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @Column({ name: 'website_hash', type: 'bigint', nullable: true })
  websiteHash: string;
}
