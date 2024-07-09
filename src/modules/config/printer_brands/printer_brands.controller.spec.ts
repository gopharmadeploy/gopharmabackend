import { Test, TestingModule } from '@nestjs/testing';
import { PrinterBrandsController } from './printer_brands.controller';
import { PrinterBrandsService } from './printer_brands.service';

describe('PrinterBrandsController', () => {
    let controller: PrinterBrandsController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [PrinterBrandsController],
            providers: [PrinterBrandsService],
        }).compile();

        controller = module.get<PrinterBrandsController>(PrinterBrandsController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
