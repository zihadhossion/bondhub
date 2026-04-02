import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException } from '@nestjs/common';
import { FlagsService } from './flags.service';
import { FlagEntity } from './entities/flag.entity';
import { FlagStatusEnum } from '../../shared/enums/flag-status.enum';
import { ContentTypeEnum } from '../../shared/enums/content-type.enum';

describe('FlagsService', () => {
  let service: FlagsService;
  let flagRepo: jest.Mocked<any>;

  beforeEach(async () => {
    flagRepo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FlagsService,
        { provide: getRepositoryToken(FlagEntity), useValue: flagRepo },
      ],
    }).compile();

    service = module.get<FlagsService>(FlagsService);
  });

  describe('create', () => {
    it('should throw ConflictException for duplicate pending flag', async () => {
      flagRepo.findOne.mockResolvedValue({
        id: 'flag-1',
        status: FlagStatusEnum.pending,
      } as FlagEntity);

      await expect(
        service.create(
          { contentType: ContentTypeEnum.post, contentId: 'post-1' },
          'user-1',
        ),
      ).rejects.toThrow(ConflictException);
    });

    it('should create flag when no duplicate exists', async () => {
      flagRepo.findOne.mockResolvedValue(null);
      const mockFlag = {
        id: 'flag-new',
        contentType: ContentTypeEnum.post,
        contentId: 'post-1',
        flaggedById: 'user-1',
        status: FlagStatusEnum.pending,
      } as FlagEntity;
      flagRepo.create.mockReturnValue(mockFlag);
      flagRepo.save.mockResolvedValue(mockFlag);

      const result = await service.create(
        { contentType: ContentTypeEnum.post, contentId: 'post-1' },
        'user-1',
      );
      expect(result).toBeDefined();
      expect(flagRepo.save).toHaveBeenCalled();
    });

    it('should allow flagging after previous flag dismissed', async () => {
      flagRepo.findOne.mockResolvedValue(null);
      const mockFlag = {
        id: 'flag-new2',
        contentType: ContentTypeEnum.comment,
        contentId: 'comment-1',
      } as FlagEntity;
      flagRepo.create.mockReturnValue(mockFlag);
      flagRepo.save.mockResolvedValue(mockFlag);

      const result = await service.create(
        { contentType: ContentTypeEnum.comment, contentId: 'comment-1' },
        'user-1',
      );
      expect(result).toBeDefined();
    });
  });
});
