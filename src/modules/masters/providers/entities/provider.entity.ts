import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
} from 'typeorm';
import { ProviderContact } from './provider_contacts.entity';
import { ProviderAccount } from './provider_accounts.entity';
import { User } from 'src/modules/config/users/entities/user.entity';
import { TaxpayerType } from '../../taxpayer-types/entities/taxpayer-type.entity';

@Entity('providers')
export class Provider {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    name: string;

    @Column({ type: 'text' })
    address: string;

    @Column()
    website: string;

    @Column({ type: 'int' })
    taxRetentionPercentaje: number;

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date; // Creation date

    @UpdateDateColumn()
    updatedAt: Date; // Last updated date

    @ManyToOne(() => User, (user) => user.providers)
    user: User;

    @ManyToOne(() => User, (user) => user.providersUpdated, { nullable: true })
    userUpdate?: User;

    @OneToMany(() => ProviderContact, (providerContact) => providerContact.provider)
    providerContacts: ProviderContact[];

    @OneToMany(() => ProviderAccount, (providerAccount) => providerAccount.provider)
    providerAccounts: ProviderAccount[];

    @ManyToOne(() => TaxpayerType, (taxpayer) => taxpayer.providers)
    taxpayer: TaxpayerType;
}
