import { ProviderAccount } from 'src/modules/masters/providers/entities/provider_accounts.entity';
import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Administrative_Bank {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    branch: string;

    @Column()
    name: string;

    @Column()
    adress: string;

    @Column()
    bankCode: number;

    @Column()
    ssn: number;

    @Column()
    phone: number;

    @Column()
    email: string;

    @Column()
    aba: string;

    @Column()
    routeNumber: number;

    @Column()
    swift: string;

    @Column()
    urbanization: string;

    @Column()
    street: string;

    @Column()
    building: string;

    @Column()
    municipality: string;

    @Column()
    city: string;

    @Column()
    codeZip: string;

    @CreateDateColumn({ type: 'timestamp' })
    createAt: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updateAt: Date;

    @Column({ default: true }) // Valor por defecto para isActive
    isActive: boolean;

    @OneToMany(() => ProviderAccount, (providerAccount) => providerAccount.bank)
    providerAccounts: ProviderAccount[];
}
