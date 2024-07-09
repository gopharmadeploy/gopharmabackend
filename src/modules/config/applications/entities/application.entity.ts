import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Page } from '../../pages/entities/page.entity';

@Entity('applications')
export class Application {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date; // Creation date

    @UpdateDateColumn()
    updatedAt: Date; // Last updated date

    @ManyToOne(() => User, (user) => user.applications)
    user: User;

    @ManyToOne(() => User, (user) => user.applicationsUpdated, { nullable: true })
    userUpdate?: User;

    @OneToMany(() => Page, (page) => page.application)
    pages: Page[];
}
