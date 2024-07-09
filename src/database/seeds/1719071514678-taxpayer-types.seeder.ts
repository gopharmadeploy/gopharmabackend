import { TaxpayerType } from 'src/modules/masters/taxpayer-types/entities/taxpayer-type.entity';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';

export class TaxpayerTypesSeeder1719071514678 implements Seeder {
    track = false;

    public async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<any> {
        const taxpayerTypesRepository = dataSource.getRepository(TaxpayerType);

        const taxpayerTypes = [
            { name: 'ORDINARIO', user: { id: 1 }, userUpdate: { id: 1 } },
            { name: 'ESPECIAL', user: { id: 1 }, userUpdate: { id: 1 } },
        ];
        await taxpayerTypesRepository.save(taxpayerTypes);
    }
}
