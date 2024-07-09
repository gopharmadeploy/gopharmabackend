import { Test, TestingModule } from '@nestjs/testing';
import { QuantitiesPackageController } from './quantities-package.controller';
import { QuantitiesPackageService } from './quantities-package.service';

describe('QuantitiesPackageController', () => {
  let controller: QuantitiesPackageController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuantitiesPackageController],
      providers: [QuantitiesPackageService],
    }).compile();

    controller = module.get<QuantitiesPackageController>(QuantitiesPackageController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
