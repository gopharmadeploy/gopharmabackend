import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from 'src/modules/config/users/entities/user.entity';
import { Profile } from 'src/modules/config/profiles/entities/profile.entity';

export default class UserSeeder implements Seeder {
    track = false;

    public async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<void> {
        const repository = dataSource.getRepository(User);
        const password = '123456';
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, salt);

        const repositoryProfile = dataSource.getRepository(Profile);

        const profile = await repositoryProfile.save({
            name: 'Administrador',
            description: 'Administrador',
        });

        await repository.insert({
            name: 'Administrador',
            email: 'admin@admin.com',
            password: hashedPassword,
            profile: profile,
            fullName: 'Administrador',
            phoneNumber: '00000000',
            dni: '123345656',
        });
    }
}
