import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Profile } from './profile.entity';
import { Page } from '../../pages/entities/page.entity';
import { Package } from '../../packages/entities/package.entity';

@Entity('profiles_pages')
export class ProfilePages {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Profile, (profile) => profile.profilePages)
    profile: Profile;

    @ManyToOne(() => Page, (page) => page.profilePages)
    page: Page;

    @ManyToOne(() => Package, (pack) => pack.profilePages)
    package: Package;
}
