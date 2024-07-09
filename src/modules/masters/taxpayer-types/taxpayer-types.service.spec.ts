import { Test, TestingModule } from '@nestjs/testing';
import { TaxpayerTypesService } from './taxpayer-types.service';

describe('TaxpayerTypesService', () => {
  let service: TaxpayerTypesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TaxpayerTypesService],
    }).compile();

    service = module.get<TaxpayerTypesService>(TaxpayerTypesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
