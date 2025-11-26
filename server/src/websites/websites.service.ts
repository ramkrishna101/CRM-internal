import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Website } from './entities/website.entity';
import { CreateWebsiteDto } from './dto/create-website.dto';
import { UpdateWebsiteDto } from './dto/update-website.dto';

@Injectable()
export class WebsitesService {
  constructor(
    @InjectRepository(Website)
    private websitesRepository: Repository<Website>,
  ) {}

  create(createWebsiteDto: CreateWebsiteDto) {
    return 'This action adds a new website';
  }

  async findAll() {
    return this.websitesRepository.find();
  }

  async findOne(id: string) {
    return this.websitesRepository.findOne({ where: { id } });
  }

  update(id: string, updateWebsiteDto: UpdateWebsiteDto) {
    return `This action updates a #${id} website`;
  }

  remove(id: string) {
    return `This action removes a #${id} website`;
  }
}
