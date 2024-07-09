import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Provider } from './provider.entity';
import { Administrative_Bank } from 'src/modules/administrative/banks/entities/bank.entity';

@Entity('provider_accounts')
export class ProviderAccount {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    name: string;

    @Column()
    email: string;

    @Column({ type: 'int' })
    phone: number;

    @ManyToOne(() => Provider, (provider) => provider.providerAccounts)
    provider: Provider;

    @ManyToOne(() => Administrative_Bank, (bank) => bank.providerAccounts)
    bank: Administrative_Bank;
}
