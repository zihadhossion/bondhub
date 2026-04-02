import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FlagEntity } from './entities/flag.entity';
import { CreateFlagDto } from './dtos/create-flag.dto';
import { FlagStatusEnum } from '../../shared/enums/flag-status.enum';

@Injectable()
export class FlagsService {
  constructor(
    @InjectRepository(FlagEntity)
    private readonly flagRepository: Repository<FlagEntity>,
  ) {}

  async create(dto: CreateFlagDto, userId: string): Promise<FlagEntity> {
    const existing = await this.flagRepository.findOne({
      where: {
        contentType: dto.contentType,
        contentId: dto.contentId,
        flaggedById: userId,
        status: FlagStatusEnum.pending,
      },
    });

    if (existing) {
      throw new ConflictException('You have already flagged this content!');
    }

    const flag = this.flagRepository.create({
      contentType: dto.contentType,
      contentId: dto.contentId,
      flaggedById: userId,
      reason: dto.reason,
    } as Partial<FlagEntity>);

    return this.flagRepository.save(flag);
  }
}
