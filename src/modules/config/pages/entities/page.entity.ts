import { Application } from '../../applications/entities/application.entity';
import { Package } from '../../packages/entities/package.entity';
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
    ManyToMany,
    JoinTable,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ProfilePages } from '../../profiles/entities/profilePages.entity';

@Entity('pages')
export class Page {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ nullable: true })
    icon: string;

    @Column({ nullable: true })
    route: string;

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date; // Creation date

    @UpdateDateColumn()
    updatedAt: Date; // Last updated date

    @ManyToOne(() => User, (user) => user.pages)
    user: User;

    @ManyToOne(() => User, (user) => user.pagesUpdated, { nullable: true })
    userUpdate?: User;

    @ManyToMany(() => Package)
    @JoinTable()
    packages: Package[];

    @OneToMany(() => Page, (page) => page.pageFather)
    pages: Page[];

    @ManyToOne(() => Page, (page) => page.pages, { nullable: true })
    pageFather?: Page;

    @OneToMany(() => ProfilePages, (profilePages) => profilePages.page)
    profilePages: ProfilePages[];

    @ManyToOne(() => Application, (application) => application.pages)
    application: Application;
}
