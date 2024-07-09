import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { CashierType } from '../../cashier_types/entities/cashier_type.entity';
import { Printer } from '../../printers/entities/printer.entity';

@Entity('cashiers')
export class Cashier {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    ipAddress: string;

    @Column()
    mac: string;

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date; // Creation date

    @UpdateDateColumn()
    updatedAt: Date; // Last updated date

    @ManyToOne(() => User, (user) => user.cashiers)
    user: User;

    @ManyToOne(() => User, (user) => user.cashiersUpdated, { nullable: true })
    userUpdate?: User;

    @ManyToOne(() => CashierType, (cashierType) => cashierType.cashiers)
    cashierType: CashierType;

    @ManyToOne(() => Printer, (printer) => printer.cashiers)
    printer: Printer;
}
