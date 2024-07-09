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
import { PrinterModel } from '../../printer_models/entities/printer_model.entity';
import { PrinterType } from '../../printer_types/entities/printer_type.entity';
import { Cashier } from '../../cashiers/entities/cashier.entity';

@Entity('printers')
export class Printer {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    serialNumber: string;

    @Column()
    ipAddress: string;

    @Column()
    port: string;

    @Column()
    mac: string;

    @Column()
    conectionUser: string;

    @Column()
    conectionPassword: string;

    @Column({ type: 'date' })
    instalationDate: Date;

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date; // Creation date

    @UpdateDateColumn()
    updatedAt: Date; // Last updated date

    @ManyToOne(() => User, (user) => user.printers)
    user: User;

    @ManyToOne(() => User, (user) => user.printersUpdated, { nullable: true })
    userUpdate?: User;

    @ManyToOne(() => PrinterModel, (printerModel) => printerModel.printers)
    printerModel: PrinterModel;

    @ManyToOne(() => PrinterType, (printerType) => printerType.printers)
    printerType: PrinterType;

    @OneToMany(() => Cashier, (cashier) => cashier.printer)
    cashiers: Cashier[];
}
