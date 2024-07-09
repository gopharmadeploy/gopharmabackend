import { Test, TestingModule } from '@nestjs/testing';
import { PrinterTypesService } from './printer_types.service';

describe('PrinterTypesService', () => {
    let service: PrinterTypesService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [PrinterTypesService],
        }).compile();

        service = module.get<PrinterTypesService>(PrinterTypesService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
