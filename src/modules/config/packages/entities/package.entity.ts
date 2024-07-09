import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    ManyToMany,
    JoinTable,
    OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Action } from '../../actions/entities/action.entity';
import { ProfilePages } from '../../profiles/entities/profilePages.entity';

@Entity('packages')
export class Package {
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

    @ManyToOne(() => User, (user) => user.packages)
    user: User;

    @ManyToOne(() => User, (user) => user.packagesUpdated, { nullable: true })
    userUpdate?: User;

    @ManyToMany(() => Action)
    @JoinTable()
    actions: Action[];

    @OneToMany(() => ProfilePages, (profilePages) => profilePages.package)
    profilePages: ProfilePages[];
}
