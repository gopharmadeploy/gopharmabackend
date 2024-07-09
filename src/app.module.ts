import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dbdatasource } from './database/data.source';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth/auth.guard';
import { SocketModule } from './socket/socket.module';
import { ScheduleModule } from '@nestjs/schedule';
import { UsersModule } from './modules/config/users/users.module';
import { ActionsModule } from './modules/config/actions/actions.module';
import { StatusModule } from './modules/config/status/status.module';
import { PackagesModule } from './modules/config/packages/packages.module';
import { ApplicationsModule } from './modules/config/applications/applications.module';
import { PagesModule } from './modules/config/pages/pages.module';
import { ProfilesModule } from './modules/config/profiles/profiles.module';
import { CompaniesModule } from './modules/config/companies/companies.module';
import { PrinterBrandsModule } from './modules/config/printer_brands/printer_brands.module';
import { PrinterTypesModule } from './modules/config/printer_types/printer_types.module';
import { PrinterModelsModule } from './modules/config/printer_models/printer_models.module';
import { PrintersModule } from './modules/config/printers/printers.module';
import { CashierTypesModule } from './modules/config/cashier_types/cashier_types.module';
import { CashiersModule } from './modules/config/cashiers/cashiers.module';
import { StatesModule } from './modules/masters/states/states.module';
import { CitiesModule } from './modules/masters/cities/cities.module';
import { BrandsModule } from './modules/inventory/brands/brands.module';
import { MailsModule } from './mails/mails.module';
import { BanksModule } from './modules/administrative/banks/banks.module';
import { CategoriesModule } from './modules/inventory/categories/categories.module';
import { SubCategoriesModule } from './modules/inventory/sub-categories/sub-categories.module';
import { TypesPresentationModule } from './modules/inventory/types-presentation/types-presentation.module';
import { UnitsConcentrationModule } from './modules/inventory/units-concentration/units-concentration.module';
import { TypesPackagingModule } from './modules/inventory/types-packaging/types-packaging.module';
import { UnitsMeasurementModule } from './modules/inventory/units-measurement/units-measurement.module';
import { CatalogueModule } from './modules/inventory/catalogue/catalogue.module';
import { MoneyModule } from './modules/administrative/money/money.module';
import { ExchangeRateModule } from './modules/administrative/exchange_rate/exchange_rate.module';
import { ConcentrationModule } from './modules/inventory/concentration/concentration.module';
import { QuantitiesPackageModule } from './modules/inventory/quantities-package/quantities-package.module';
import { ScrappingServiceModule } from './modules/administrative/scrapping_service/scrapping_service.module';
import { DocumentTypesModule } from './modules/masters/document-types/document-types.module';
import { ClientTypesModule } from './modules/masters/client-types/client-types.module';
import { TaxpayerTypesModule } from './modules/masters/taxpayer-types/taxpayer-types.module';
import { ClientsModule } from './modules/masters/clients/clients.module';
import { ProvidersModule } from './modules/masters/providers/providers.module';
import { IdentificationTypesModule } from './modules/masters/identification-types/identification-types.module';

@Module({
    imports: [
        ScheduleModule.forRoot(),
        TypeOrmModule.forRoot(dbdatasource),
        UsersModule,
        ActionsModule,
        StatusModule,
        AuthModule,
        PackagesModule,
        ApplicationsModule,
        PagesModule,
        ProfilesModule,
        CompaniesModule,
        PrinterBrandsModule,
        PrinterTypesModule,
        PrinterModelsModule,
        PrintersModule,
        CashierTypesModule,
        CashiersModule,
        StatesModule,
        CitiesModule,
        BrandsModule,
        MailsModule,
        BanksModule,
        CategoriesModule,
        SubCategoriesModule,
        TypesPresentationModule,
        UnitsConcentrationModule,
        TypesPackagingModule,
        UnitsMeasurementModule,
        CatalogueModule,
        MoneyModule,
        ExchangeRateModule,
        ConcentrationModule,
        QuantitiesPackageModule,
        ScrappingServiceModule,
        DocumentTypesModule,
        ClientTypesModule,
        TaxpayerTypesModule,
        ClientsModule,
        ProvidersModule,
        IdentificationTypesModule,
        SocketModule,
    ],
    providers: [
        {
            provide: APP_GUARD,
            useClass: AuthGuard,
        },
    ],
})
export class AppModule {}
