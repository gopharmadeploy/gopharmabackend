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
import { Printer } from '../../printers/entities/printer.entity';

@Entity('printer_types')
export class PrinterType {
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

    @ManyToOne(() => User, (user) => user.printerTypes)
    user: User;

    @ManyToOne(() => User, (user) => user.printerTypesUpdated, { nullable: true })
    userUpdate?: User;

    @OneToMany(() => Printer, (printer) => printer.printerType)
    printers: Printer[];
}
