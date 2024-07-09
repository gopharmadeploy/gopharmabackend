import { Test, TestingModule } from '@nestjs/testing';
import { UnitsConcentrationController } from './units-concentration.controller';
import { UnitsConcentrationService } from './units-concentration.service';

describe('UnitsConcentrationController', () => {
  let controller: UnitsConcentrationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UnitsConcentrationController],
      providers: [UnitsConcentrationService],
    }).compile();

    controller = module.get<UnitsConcentrationController>(UnitsConcentrationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
