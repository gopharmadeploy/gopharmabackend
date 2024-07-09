import { Test, TestingModule } from '@nestjs/testing';
import { UnitsConcentrationService } from './units-concentration.service';

describe('UnitsConcentrationService', () => {
  let service: UnitsConcentrationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UnitsConcentrationService],
    }).compile();

    service = module.get<UnitsConcentrationService>(UnitsConcentrationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
