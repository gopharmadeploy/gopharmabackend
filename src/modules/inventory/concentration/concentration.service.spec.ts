import { Test, TestingModule } from '@nestjs/testing';
import { ConcentrationService } from './concentration.service';

describe('ConcentrationService', () => {
  let service: ConcentrationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConcentrationService],
    }).compile();

    service = module.get<ConcentrationService>(ConcentrationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
