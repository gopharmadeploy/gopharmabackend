import { Test, TestingModule } from '@nestjs/testing';
import { UnitsMeasurementController } from './units-measurement.controller';
import { UnitsMeasurementService } from './units-measurement.service';

describe('UnitsMeasurementController', () => {
  let controller: UnitsMeasurementController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UnitsMeasurementController],
      providers: [UnitsMeasurementService],
    }).compile();

    controller = module.get<UnitsMeasurementController>(UnitsMeasurementController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
