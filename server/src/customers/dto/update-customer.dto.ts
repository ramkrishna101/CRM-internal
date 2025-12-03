import { PartialType } from '@nestjs/mapped-types';
import { CreateCustomerDto } from './create-customer.dto';
import { IsOptional, IsUUID } from 'class-validator';

export class UpdateCustomerDto extends PartialType(CreateCustomerDto) {
  @IsUUID()
  @IsOptional()
  tagId?: string | null;
}
