import { Test, TestingModule } from '@nestjs/testing';
import { TypesPackagingController } from './types-packaging.controller';
import { TypesPackagingService } from './types-packaging.service';

describe('TypesPackagingController', () => {
  let controller: TypesPackagingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TypesPackagingController],
      providers: [TypesPackagingService],
    }).compile();

    controller = module.get<TypesPackagingController>(TypesPackagingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
