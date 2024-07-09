import { User } from 'src/modules/config/users/entities/user.entity';
import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity('inventory_products_units_concentration')
export class UnitsConcentration {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    @Column({ unique: true })
    name: string;

    @Column()
    @Column({ unique: true })
    code: string;

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date; // Creation date

    @UpdateDateColumn()
    updatedAt: Date; // Last updated date

    @ManyToOne(() => User, (user) => user.packages)
    user: User;

    @ManyToOne(() => User, (user) => user.packagesUpdated, { nullable: true })
    userUpdate?: User;
}
