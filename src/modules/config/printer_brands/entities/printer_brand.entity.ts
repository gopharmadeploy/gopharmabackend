import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
} from 'typeorm';
import { PrinterModel } from '../../printer_models/entities/printer_model.entity';
import { User } from '../../users/entities/user.entity';

@Entity('printer_brands')
export class PrinterBrand {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    brand: string;

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date; // Creation date

    @UpdateDateColumn()
    updatedAt: Date; // Last updated date

    @OneToMany(() => PrinterModel, (printerModel) => printerModel.printerBrand)
    printerModels: PrinterModel[];

    @ManyToOne(() => User, (user) => user.printerBrands)
    user: User;

    @ManyToOne(() => User, (user) => user.printerBrandsUpdated, { nullable: true })
    userUpdate?: User;
}
