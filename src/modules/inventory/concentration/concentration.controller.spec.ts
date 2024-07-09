import { Test, TestingModule } from '@nestjs/testing';
import { ConcentrationController } from './concentration.controller';
import { ConcentrationService } from './concentration.service';

describe('ConcentrationController', () => {
  let controller: ConcentrationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConcentrationController],
      providers: [ConcentrationService],
    }).compile();

    controller = module.get<ConcentrationController>(ConcentrationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
