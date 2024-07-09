import { Test, TestingModule } from '@nestjs/testing';
import { QuantitiesPackageService } from './quantities-package.service';

describe('QuantitiesPackageService', () => {
  let service: QuantitiesPackageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QuantitiesPackageService],
    }).compile();

    service = module.get<QuantitiesPackageService>(QuantitiesPackageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
