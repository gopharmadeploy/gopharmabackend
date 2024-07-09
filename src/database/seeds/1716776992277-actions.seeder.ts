import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { Action } from 'src/modules/config/actions/entities/action.entity';

export default class ActionsSeeder implements Seeder {
    track = false;

    public async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<void> {
        const repository = dataSource.getRepository(Action);

        const actions = [
            { name: 'VER', user: { id: 1 }, userUpdate: { id: 1 } },
            { name: 'CREAR', user: { id: 1 }, userUpdate: { id: 1 } },
            { name: 'EDITAR', user: { id: 1 }, userUpdate: { id: 1 } },
            { name: 'CAMBIAR ESTATUS', user: { id: 1 }, userUpdate: { id: 1 } },
        ];

        await repository.save(actions);
    }
}
