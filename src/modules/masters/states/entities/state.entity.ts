import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
} from 'typeorm';

import { City } from '../../cities/entities/city.entity';
import { User } from 'src/modules/config/users/entities/user.entity';

@Entity('states')
export class State {
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

    @ManyToOne(() => User, (user) => user.states)
    user: User;

    @ManyToOne(() => User, (user) => user.statesUpdated, { nullable: true })
    userUpdate?: User;

    @OneToMany(() => City, (city) => city.state)
    cities: City[];
}
