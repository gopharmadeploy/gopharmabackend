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
import { PrinterBrand } from '../../printer_brands/entities/printer_brand.entity';
import { Printer } from '../../printers/entities/printer.entity';

@Entity('printer_models')
export class PrinterModel {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    model: string;

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date; // Creation date

    @UpdateDateColumn()
    updatedAt: Date; // Last updated date

    @ManyToOne(() => User, (user) => user.printerModels)
    user: User;

    @ManyToOne(() => User, (user) => user.printerModelsUpdated, { nullable: true })
    userUpdate?: User;

    @ManyToOne(() => PrinterBrand, (printerBrand) => printerBrand.printerModels)
    printerBrand: PrinterBrand;

    @OneToMany(() => Printer, (printer) => printer.printerModel)
    printers: Printer[];
}
