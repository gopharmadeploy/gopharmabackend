import { Test, TestingModule } from '@nestjs/testing';
import { IdentificationTypesService } from './identification-types.service';

describe('IdentificationTypesService', () => {
  let service: IdentificationTypesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IdentificationTypesService],
    }).compile();

    service = module.get<IdentificationTypesService>(IdentificationTypesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
