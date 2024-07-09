import { Test, TestingModule } from '@nestjs/testing';
import { PrinterModelsController } from './printer_models.controller';
import { PrinterModelsService } from './printer_models.service';

describe('PrinterModelsController', () => {
    let controller: PrinterModelsController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [PrinterModelsController],
            providers: [PrinterModelsService],
        }).compile();

        controller = module.get<PrinterModelsController>(PrinterModelsController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
