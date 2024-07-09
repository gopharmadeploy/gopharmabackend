import { Test, TestingModule } from '@nestjs/testing';
import { PrinterTypesController } from './printer_types.controller';
import { PrinterTypesService } from './printer_types.service';

describe('PrinterTypesController', () => {
    let controller: PrinterTypesController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [PrinterTypesController],
            providers: [PrinterTypesService],
        }).compile();

        controller = module.get<PrinterTypesController>(PrinterTypesController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
