import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { InteractionsService } from './interactions.service';
import { CreateInteractionDto } from './dto/create-interaction.dto';
import { UpdateInteractionDto } from './dto/update-interaction.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('interactions')
@UseGuards(JwtAuthGuard)
export class InteractionsController {
  constructor(private readonly interactionsService: InteractionsService) {}

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  @Post()
  create(@Body() createInteractionDto: CreateInteractionDto) {
    return this.interactionsService.create(createInteractionDto);
  }

  @Get()
  findAll(@Query('customerId') customerId?: string) {
    if (customerId) {
      return this.interactionsService.findAllByCustomer(customerId);
    }
    return this.interactionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.interactionsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateInteractionDto: UpdateInteractionDto,
  ) {
    return this.interactionsService.update(id, updateInteractionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.interactionsService.remove(id);
  }
}
