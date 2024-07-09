import { Test, TestingModule } from '@nestjs/testing';
import { PrinterBrandsService } from './printer_brands.service';

describe('PrinterBrandsService', () => {
    let service: PrinterBrandsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [PrinterBrandsService],
        }).compile();

        service = module.get<PrinterBrandsService>(PrinterBrandsService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
