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
import { Client } from '../../clients/entities/client.entity';

@Entity('client_types')
export class ClientType {
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

    @ManyToOne(() => User, (user) => user.clientTypes)
    user: User;

    @ManyToOne(() => User, (user) => user.clientTypesUpdated, { nullable: true })
    userUpdate?: User;

    @OneToMany(() => Client, (client) => client.clientType)
    clients: Client[];
}
