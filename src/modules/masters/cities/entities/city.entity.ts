import { User } from 'src/modules/config/users/entities/user.entity';
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
} from 'typeorm';
import { State } from '../../states/entities/state.entity';
import { Client } from '../../clients/entities/client.entity';

@Entity('cities')
export class City {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date; // Creation date

    @UpdateDateColumn()
    updatedAt: Date; // Last updated date

    @ManyToOne(() => User, (user) => user.cities)
    user: User;

    @ManyToOne(() => User, (user) => user.citiesUpdated, { nullable: true })
    userUpdate?: User;

    @ManyToOne(() => State, (state) => state.cities)
    state: State;

    @OneToMany(() => Client, (client) => client.city)
    clients: Client[];
}
