import { Test, TestingModule } from '@nestjs/testing';
import { CashierTypesService } from './cashier_types.service';

describe('CashierTypesService', () => {
    let service: CashierTypesService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [CashierTypesService],
        }).compile();

        service = module.get<CashierTypesService>(CashierTypesService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
