import { Brand } from 'src/modules/inventory/brands/entities/brand.entity';
import { Concentration } from 'src/modules/inventory/concentration/entities/concentration.entity';
import { QuantitiesPackage } from 'src/modules/inventory/quantities-package/entities/quantities-package.entity';
import { SubCategory } from 'src/modules/inventory/sub-categories/entities/sub-category.entity';
import { TypesPackaging } from 'src/modules/inventory/types-packaging/entities/types-packaging.entity';
import { TypesPresentation } from 'src/modules/inventory/types-presentation/entities/types-presentation.entity';
import { UnitsConcentration } from 'src/modules/inventory/units-concentration/entities/units-concentration.entity';
import { UnitsMeasurement } from 'src/modules/inventory/units-measurement/entities/units-measurement.entity';
import { User } from 'src/modules/config/users/entities/user.entity';
import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity('inventory_products_catalogue')
export class Catalogue {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Brand, (brand) => brand.id)
    brand?: Brand;

    @ManyToOne(() => SubCategory, (subCategory) => subCategory.id)
    subCategory?: SubCategory;

    @ManyToOne(() => TypesPresentation, (typesPresentation) => typesPresentation.id)
    typesPresentation?: TypesPresentation;

    @ManyToOne(() => Concentration, (unitsConcentration) => unitsConcentration.id)
    concentration?: Concentration;

    @ManyToOne(() => UnitsConcentration, (unitsConcentration) => unitsConcentration.id)
    unitConcentration?: UnitsConcentration;

    @ManyToOne(() => TypesPackaging, (typesPackaging) => typesPackaging.id)
    typesPackaging?: TypesPackaging;

    @ManyToOne(() => UnitsMeasurement, (unitsMeasurement) => unitsMeasurement.id)
    unitMeasurement?: UnitsMeasurement;

    @ManyToOne(() => QuantitiesPackage, (unitsMeasurement) => unitsMeasurement.id)
    quantityPackage?: QuantitiesPackage;

    @Column()
    //@Column({ unique: true })
    name: string;

    @Column()
    //@Column({ unique: true })
    description: string;

    @Column()
    //@Column({ unique: true })
    barcode: string;

    @Column()
    //@Column({ unique: true })
    pharmaceuticalDescription: string;

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

    @ManyToOne(() => User, (user) => user.packages)
    userUpdate: User;

    @Column({ nullable: true })
    img?: string;
}
