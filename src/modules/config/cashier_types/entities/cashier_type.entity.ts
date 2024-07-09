import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Cashier } from '../../cashiers/entities/cashier.entity';

@Entity('cashier_types')
export class CashierType {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    type: string;

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date; // Creation date

    @UpdateDateColumn()
    updatedAt: Date; // Last updated date

    @ManyToOne(() => User, (user) => user.cashierTypes)
    user: User;

    @ManyToOne(() => User, (user) => user.cashierTypesUpdated, { nullable: true })
    userUpdate?: User;

    @OneToMany(() => Cashier, (cashier) => cashier.cashierType)
    cashiers: Cashier[];
}
