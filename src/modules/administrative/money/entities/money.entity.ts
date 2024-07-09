import { User } from 'src/modules/config/users/entities/user.entity';
import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
    ManyToOne,
} from 'typeorm';

@Entity()
export class Administrative_Money {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    money: string;

    @Column()
    symbol: string;

    @Column({ nullable: true })
    file?: string; //puede ser nulo

    @CreateDateColumn({ type: 'timestamp' })
    createAt: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updateAt: Date;

    @Column({ default: true }) // Valor por defecto para isActive
    isActive: boolean;

    @ManyToOne(() => User, (user) => user.actions)
    user: User;

    @ManyToOne(() => User, (user) => user.actionsUpdated, { nullable: true })
    userUpdate?: User;
}
