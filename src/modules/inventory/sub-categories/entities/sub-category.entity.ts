import { User } from 'src/modules/config/users/entities/user.entity';
import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Category } from '../../categories/entities/category.entity';

@Entity('inventory_products_sub_category')
export class SubCategory {
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

    @ManyToOne(() => Category, (category) => category.id)
    category?: Category;

    @ManyToOne(() => SubCategory, (subCategpory) => subCategpory.subCategoryFather, {
        nullable: true,
    })
    subCategoryFather?: SubCategory;
}
