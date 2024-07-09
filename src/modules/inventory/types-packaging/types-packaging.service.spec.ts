import { Test, TestingModule } from '@nestjs/testing';
import { TypesPackagingService } from './types-packaging.service';

describe('TypesPackagingService', () => {
  let service: TypesPackagingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TypesPackagingService],
    }).compile();

    service = module.get<TypesPackagingService>(TypesPackagingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
