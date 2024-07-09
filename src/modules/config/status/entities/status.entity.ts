import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Status {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    status: string;

    @Column()
    module: string;

    @Column({ default: 'white' }) // Valor por defecto para color
    color: string;

    @Column({ default: true }) // Valor por defecto para isActive
    isActive: boolean;

    @CreateDateColumn({ type: 'timestamp' }) // Fecha de creación
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp' }) // Fecha de actualización
    updatedAt: Date;

    @ManyToOne(() => User, (user) => user.statuses)
    user: User;

    @ManyToOne(() => User, (user) => user.statusesUpdated, { nullable: true })
    userUpdate?: User;
}
