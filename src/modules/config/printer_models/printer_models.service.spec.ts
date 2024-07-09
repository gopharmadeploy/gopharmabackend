import { Test, TestingModule } from '@nestjs/testing';
import { PrinterModelsService } from './printer_models.service';

describe('PrinterModelsService', () => {
    let service: PrinterModelsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [PrinterModelsService],
        }).compile();

        service = module.get<PrinterModelsService>(PrinterModelsService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
