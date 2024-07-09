import { User } from 'src/modules/config/users/entities/user.entity';
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
} from 'typeorm';
import { ClientType } from '../../client-types/entities/client-type.entity';
import { TaxpayerType } from '../../taxpayer-types/entities/taxpayer-type.entity';
import { City } from '../../cities/entities/city.entity';
import { DocumentType } from '../../document-types/entities/document-type.entity';

@Entity('clients')
export class Client {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    name: string;

    @Column({ type: 'int', unique: true })
    phone: number;

    @Column()
    email: string;

    @Column()
    observations: string;

    @Column({ type: 'text' })
    address: string;

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date; // Creation date

    @UpdateDateColumn()
    updatedAt: Date; // Last updated date

    @ManyToOne(() => User, (user) => user.clients)
    user: User;

    @ManyToOne(() => User, (user) => user.clientsUpdated, { nullable: true })
    userUpdate?: User;

    @ManyToOne(() => ClientType, (clientType) => clientType.clients)
    clientType: ClientType;

    @ManyToOne(() => TaxpayerType, (taxpayer) => taxpayer.clients)
    taxpayer: TaxpayerType;

    @ManyToOne(() => City, (city) => city.clients)
    city: City;

    @Column()
    identification: string;

    @ManyToOne(() => DocumentType, (documentType) => documentType.clients)
    documentType: DocumentType;
}
