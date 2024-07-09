import { Test, TestingModule } from '@nestjs/testing';
import { CashierTypesController } from './cashier_types.controller';
import { CashierTypesService } from './cashier_types.service';

describe('CashierTypesController', () => {
    let controller: CashierTypesController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [CashierTypesController],
            providers: [CashierTypesService],
        }).compile();

        controller = module.get<CashierTypesController>(CashierTypesController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
