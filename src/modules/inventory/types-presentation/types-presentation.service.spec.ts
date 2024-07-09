import { Test, TestingModule } from '@nestjs/testing';
import { TypesPresentationService } from './types-presentation.service';

describe('TypesPresentationService', () => {
  let service: TypesPresentationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TypesPresentationService],
    }).compile();

    service = module.get<TypesPresentationService>(TypesPresentationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
