import { Test, TestingModule } from '@nestjs/testing';
import { UnitsMeasurementService } from './units-measurement.service';

describe('UnitsMeasurementService', () => {
  let service: UnitsMeasurementService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UnitsMeasurementService],
    }).compile();

    service = module.get<UnitsMeasurementService>(UnitsMeasurementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
