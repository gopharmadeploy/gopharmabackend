import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Profile } from '../../profiles/entities/profile.entity';
import { Action } from '../../actions/entities/action.entity';
import { Application } from '../../applications/entities/application.entity';
import { Package } from '../../packages/entities/package.entity';
import { Page } from '../../pages/entities/page.entity';
import { Status } from '../../status/entities/status.entity';
import { PrinterBrand } from '../../printer_brands/entities/printer_brand.entity';
import { PrinterType } from '../../printer_types/entities/printer_type.entity';
import { PrinterModel } from '../../printer_models/entities/printer_model.entity';
import { Printer } from '../../printers/entities/printer.entity';
import { CashierType } from '../../cashier_types/entities/cashier_type.entity';
import { Cashier } from '../../cashiers/entities/cashier.entity';
import { State } from 'src/modules/masters/states/entities/state.entity';
import { City } from 'src/modules/masters/cities/entities/city.entity';
import { DocumentType } from 'src/modules/masters/document-types/entities/document-type.entity';
import { ClientType } from 'src/modules/masters/client-types/entities/client-type.entity';
import { TaxpayerType } from 'src/modules/masters/taxpayer-types/entities/taxpayer-type.entity';
import { Client } from 'src/modules/masters/clients/entities/client.entity';
import { Provider } from 'src/modules/masters/providers/entities/provider.entity';
import { IdentificationType } from 'src/modules/masters/identification-types/entities/identification-type.entity';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column({ default: true })
    isActive: boolean;

    // @Column({ type: 'int', nullable: true })
    // profileId?: number;

    @ManyToOne(() => Profile, (profile) => profile.id)
    profile: Profile;

    @CreateDateColumn()
    createdAt: Date; // Creation date

    @UpdateDateColumn({ nullable: true })
    updatedAt?: Date; // Last updated date

    @OneToMany(() => Action, (action) => action.user)
    actions: Action[];

    @OneToMany(() => Action, (action) => action.userUpdate)
    actionsUpdated: Action[];

    @OneToMany(() => Application, (application) => application.user)
    applications: Application[];

    @OneToMany(() => Application, (application) => application.userUpdate)
    applicationsUpdated: Application[];

    @OneToMany(() => Package, (packAge) => packAge.user)
    packages: Package[];

    @OneToMany(() => Package, (packAge) => packAge.userUpdate)
    packagesUpdated: Package[];

    @OneToMany(() => Page, (page) => page.user)
    pages: Page[];

    @OneToMany(() => Page, (page) => page.userUpdate)
    pagesUpdated: Page[];

    @OneToMany(() => Page, (page) => page.user)
    profiles: Page[];

    @OneToMany(() => Page, (page) => page.userUpdate)
    profilesUpdated: Page[];

    @OneToMany(() => Status, (statuses) => statuses.user)
    statuses: Status[];

    @OneToMany(() => Status, (statusesUpdated) => statusesUpdated.userUpdate)
    statusesUpdated: Status[];

    @OneToMany(() => PrinterBrand, (printerBrand) => printerBrand.user)
    printerBrands: PrinterBrand[];

    @OneToMany(() => PrinterBrand, (printerBrand) => printerBrand.userUpdate)
    printerBrandsUpdated: PrinterBrand[];

    @OneToMany(() => PrinterType, (printerType) => printerType.user)
    printerTypes: PrinterType[];

    @OneToMany(() => PrinterType, (printerType) => printerType.userUpdate)
    printerTypesUpdated: PrinterType[];

    @OneToMany(() => PrinterModel, (printerModel) => printerModel.user)
    printerModels: PrinterModel[];

    @OneToMany(() => PrinterModel, (printerModel) => printerModel.userUpdate)
    printerModelsUpdated: PrinterModel[];

    @OneToMany(() => Printer, (printer) => printer.user)
    printers: Printer[];

    @OneToMany(() => Printer, (printer) => printer.userUpdate)
    printersUpdated: Printer[];

    @OneToMany(() => CashierType, (cashierType) => cashierType.user)
    cashierTypes: CashierType[];

    @OneToMany(() => CashierType, (cashierType) => cashierType.userUpdate)
    cashierTypesUpdated: CashierType[];

    @OneToMany(() => Cashier, (cashier) => cashier.user)
    cashiers: Cashier[];

    @OneToMany(() => Cashier, (cashier) => cashier.userUpdate)
    cashiersUpdated: Cashier[];

    @OneToMany(() => State, (state) => state.user)
    states: State[];

    @OneToMany(() => State, (state) => state.userUpdate)
    statesUpdated: State[];

    @OneToMany(() => City, (city) => city.user)
    cities: City[];

    @OneToMany(() => City, (city) => city.userUpdate)
    citiesUpdated: City[];

    //guardar imagenes de perfil
    @Column({ nullable: true })
    filePath?: string; //puede ser nulo

    @Column()
    fullName: string;

    @Column()
    phoneNumber: string;

    @Column()
    dni: string;

    //campos para reiniciar password
    @Column({ nullable: true })
    resetToken: string;

    @Column({ nullable: true })
    resetTokenExpiration: Date;

    @OneToMany(() => DocumentType, (documentType) => documentType.user)
    documentTypes: DocumentType[];

    @OneToMany(() => DocumentType, (documentType) => documentType.userUpdate)
    documentTypesUpdated: DocumentType[];

    @OneToMany(() => ClientType, (clientType) => clientType.user)
    clientTypes: ClientType[];

    @OneToMany(() => ClientType, (clientType) => clientType.userUpdate)
    clientTypesUpdated: ClientType[];

    @OneToMany(() => TaxpayerType, (taxpayerType) => taxpayerType.user)
    taxpayerTypes: TaxpayerType[];

    @OneToMany(() => TaxpayerType, (taxpayerType) => taxpayerType.userUpdate)
    taxpayerTypesUpdated: TaxpayerType[];

    @OneToMany(() => Client, (client) => client.user)
    clients: Client[];

    @OneToMany(() => Client, (client) => client.userUpdate)
    clientsUpdated: Client[];

    @OneToMany(() => Provider, (provider) => provider.user)
    providers: Provider[];

    @OneToMany(() => Provider, (provider) => provider.userUpdate)
    providersUpdated: Provider[];

    @OneToMany(() => IdentificationType, (identificationType) => identificationType.user)
    identificationTypes: IdentificationType[];

    @OneToMany(() => IdentificationType, (identificationType) => identificationType.userUpdate)
    identificationTypesUpdated: IdentificationType[];
}
