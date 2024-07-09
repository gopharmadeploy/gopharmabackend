import { Test, TestingModule } from '@nestjs/testing';
import { TypesPresentationController } from './types-presentation.controller';
import { TypesPresentationService } from './types-presentation.service';

describe('TypesPresentationController', () => {
  let controller: TypesPresentationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TypesPresentationController],
      providers: [TypesPresentationService],
    }).compile();

    controller = module.get<TypesPresentationController>(TypesPresentationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
