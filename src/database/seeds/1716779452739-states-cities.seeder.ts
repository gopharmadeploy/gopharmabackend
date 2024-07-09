import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { venezuela } from 'src/data/venezuela';
import { State } from 'src/modules/masters/states/entities/state.entity';
import { City } from 'src/modules/masters/cities/entities/city.entity';

export class StatesSeeder1716779452739 implements Seeder {
    track = false;

    public async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<void> {
        const statesRepository = dataSource.getRepository(State);
        const citiesRepository = dataSource.getRepository(City);

        const dataStates = [];
        const dataCities = [];

        venezuela.forEach((element) => {
            element.estado = element.estado.toUpperCase();
            if (element.estado == 'DISTRITO CAPITAL') element.ciudades = ['CARACAS'];

            if (!dataStates.some((el) => el.name == element.estado)) {
                dataStates.push({
                    name: element.estado,
                    user: { id: 1 },
                    userUpdate: { id: 1 },
                });
            }

            element.ciudades.forEach((ciudad) => {
                ciudad = ciudad.toUpperCase();
                if (
                    !dataCities.some(
                        (el) =>
                            el.name == ciudad &&
                            dataStates[dataStates.map((e) => e.name).indexOf(element.estado)] ==
                                element.estado,
                    )
                ) {
                    dataCities.push({
                        name: ciudad,
                        user: { id: 1 },
                        userUpdate: { id: 1 },
                        state: dataStates[dataStates.map((e) => e.name).indexOf(element.estado)],
                    });
                }
            });
        });

        await statesRepository.save(dataStates);
        await citiesRepository.save(dataCities);
    }
}
