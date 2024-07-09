import { IsNumber } from 'class-validator';
import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Administrative_Money } from '../../money/entities/money.entity';
import { User } from 'src/modules/config/users/entities/user.entity';

@Entity()
export class ExchangeRate {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Administrative_Money)
    currencyId: Administrative_Money;

    @ManyToOne(() => Administrative_Money) //usualmente será el bolívar
    exchangeToCurrency: Administrative_Money;

    @Column('decimal', { precision: 16, scale: 8 })
    @IsNumber()
    exchange: number;

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn({ nullable: true })
    updatedAt?: Date;

    @ManyToOne(() => User, (user) => user.statuses)
    user: User;
}
