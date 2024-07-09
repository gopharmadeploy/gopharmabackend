import { Package } from 'src/modules/config/packages/entities/package.entity';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';

export class PackagesSeeder1716777577042 implements Seeder {
    track = false;

    public async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<void> {
        const repository = dataSource.getRepository(Package);

        const data = [
            { name: 'VER', actions: [{ id: 1 }], user: { id: 1 }, userUpdate: { id: 1 } },
            {
                name: 'VER, CREAR',
                actions: [{ id: 1 }, { id: 2 }],
                user: { id: 1 },
                userUpdate: { id: 1 },
            },
            {
                name: 'VER, CREAR, EDITAR',
                actions: [{ id: 1 }, { id: 2 }, { id: 3 }],
                user: { id: 1 },
                userUpdate: { id: 1 },
            },
            {
                name: 'VER, CREAR, EDITAR, CAMBIAR ESTATUS',
                actions: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }],
                user: { id: 1 },
                userUpdate: { id: 1 },
            },
        ];

        await repository.save(data);
    }
}
