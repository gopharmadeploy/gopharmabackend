import { Administrative_Money } from 'src/modules/administrative/money/entities/money.entity';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';

export default class MoneySeeder implements Seeder {
    track = false;

    public async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<any> {
        const repository = dataSource.getRepository(Administrative_Money);

        var currency = [
            { money: 'Dólar', symbol: 'USD', isActive: true },
            { money: 'Bolívar', symbol: 'BSF', isActive: true },
            { money: 'Euro', symbol: 'EUR', isActive: true },
        ];

        await repository.save(currency);
    }
}
