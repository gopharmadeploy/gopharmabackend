import { Application } from 'src/modules/config/applications/entities/application.entity';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';

export class ApplicationsSeeder1716777448428 implements Seeder {
    track = false;

    public async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<void> {
        const repository = dataSource.getRepository(Application);

        const data = [
            { name: 'SISTEMA ADMINISTRATIVO', user: { id: 1 }, userUpdate: { id: 1 } },
            { name: 'SISTEMA CONTABLE', user: { id: 1 }, userUpdate: { id: 1 } },
        ];

        await repository.save(data);
    }
}
