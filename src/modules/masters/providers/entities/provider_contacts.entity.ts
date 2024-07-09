import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Provider } from './provider.entity';

@Entity('provider_contacts')
export class ProviderContact {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    name: string;

    @Column()
    email: string;

    @Column({ type: 'int' })
    phone: number;

    @ManyToOne(() => Provider, (provider) => provider.providerContacts)
    provider: Provider;
}
