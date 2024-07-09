import { User } from 'src/modules/config/users/entities/user.entity';
import { Client } from '../../clients/entities/client.entity';
import { Provider } from '../../providers/entities/provider.entity';

import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
} from 'typeorm';

@Entity('taxpayer_types')
export class TaxpayerType {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    name: string;

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date; // Creation date

    @UpdateDateColumn()
    updatedAt: Date; // Last updated date

    @ManyToOne(() => User, (user) => user.taxpayerTypes)
    user: User;

    @ManyToOne(() => User, (user) => user.taxpayerTypesUpdated, { nullable: true })
    userUpdate?: User;

    @OneToMany(() => Client, (client) => client.taxpayer)
    clients: Client[];

    @OneToMany(() => Provider, (provider) => provider.taxpayer)
    providers: Provider[];
}
