import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateInteractionDto } from './dto/create-interaction.dto';
import { UpdateInteractionDto } from './dto/update-interaction.dto';
import { Interaction } from './entities/interaction.entity';

@Injectable()
export class InteractionsService {
  constructor(
    @InjectRepository(Interaction)
    private interactionsRepository: Repository<Interaction>,
  ) {}

  async create(createInteractionDto: CreateInteractionDto) {
    const interaction =
      this.interactionsRepository.create(createInteractionDto);
    const saved = await this.interactionsRepository.save(interaction);
    return this.interactionsRepository.findOne({
      where: { id: saved.id },
      relations: ['agent'],
    });
  }

  findAllByCustomer(customerId: string) {
    return this.interactionsRepository.find({
      where: { customerId },
      order: { createdAt: 'DESC' },
      relations: ['agent'],
    });
  }

  findAll() {
    return this.interactionsRepository.find({
      order: { createdAt: 'DESC' },
      relations: ['agent'],
    });
  }

  findOne(id: string) {
    return this.interactionsRepository.findOne({
      where: { id },
      relations: ['agent'],
    });
  }

  async update(id: string, updateInteractionDto: UpdateInteractionDto) {
    await this.interactionsRepository.update(id, updateInteractionDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.interactionsRepository.delete(id);
    return { id };
  }
}
