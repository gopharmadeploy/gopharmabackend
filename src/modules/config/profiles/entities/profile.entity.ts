import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { ProfilePages } from './profilePages.entity';
import { User } from '../../users/entities/user.entity';

@Entity('profiles')
export class Profile {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    description: string;

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date; // Creation date

    @UpdateDateColumn()
    updatedAt: Date; // Last updated date

    @ManyToOne(() => User, (user) => user.profiles)
    user: User;

    @ManyToOne(() => User, (user) => user.profilesUpdated, { nullable: true })
    userUpdate?: User;

    @OneToMany(() => ProfilePages, (profilePages) => profilePages.profile)
    profilePages: ProfilePages[];
    pages: any;
}
