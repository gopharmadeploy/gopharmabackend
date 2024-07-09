import { Test, TestingModule } from '@nestjs/testing';
import { IdentificationTypesController } from './identification-types.controller';
import { IdentificationTypesService } from './identification-types.service';

describe('IdentificationTypesController', () => {
  let controller: IdentificationTypesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IdentificationTypesController],
      providers: [IdentificationTypesService],
    }).compile();

    controller = module.get<IdentificationTypesController>(IdentificationTypesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
