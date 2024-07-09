import { Test, TestingModule } from '@nestjs/testing';
import { TaxpayerTypesController } from './taxpayer-types.controller';
import { TaxpayerTypesService } from './taxpayer-types.service';

describe('TaxpayerTypesController', () => {
  let controller: TaxpayerTypesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaxpayerTypesController],
      providers: [TaxpayerTypesService],
    }).compile();

    controller = module.get<TaxpayerTypesController>(TaxpayerTypesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
