import { PartialType } from '@nestjs/mapped-types';
import { CreateColdLeadDto } from './create-cold-lead.dto';

export class UpdateColdLeadDto extends PartialType(CreateColdLeadDto) {}
