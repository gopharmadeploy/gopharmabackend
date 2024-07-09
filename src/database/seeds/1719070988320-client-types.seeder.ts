import { ClientType } from 'src/modules/masters/client-types/entities/client-type.entity';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';

export class ClientTypesSeeder1719070988320 implements Seeder {
    track = false;

    public async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<any> {
        const clientTypesRepository = dataSource.getRepository(ClientType);

        const clientTypes = [
            { name: 'NATURAL', user: { id: 1 }, userUpdate: { id: 1 } },
            { name: 'JURIDICO', user: { id: 1 }, userUpdate: { id: 1 } },
        ];
        await clientTypesRepository.save(clientTypes);
    }
}
