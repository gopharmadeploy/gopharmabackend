import { Injectable } from '@nestjs/common';
import { ApplicationsService } from 'src/modules/config/applications/applications.service';
import { Page } from 'src/modules/config/pages/entities/page.entity';
import { Profile } from 'src/modules/config/profiles/entities/profile.entity';
import { ProfilePages } from 'src/modules/config/profiles/entities/profilePages.entity';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';

@Injectable()
export class PagesSeeder1716777747675 implements Seeder {
    constructor(private applicationsService: ApplicationsService) {}

    public async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<void> {
        const pageRepository = dataSource.getRepository(Page);
        const profilePagesRepository = dataSource.getRepository(ProfilePages);
        const profileRepository = dataSource.getRepository(Profile);

        const pagesMaestros = [
            {
                name: 'Estados',
                route: '/dashboard/states',
                packages: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }],
                application: { id: 1 },
                user: { id: 1 },
                userUpdate: { id: 1 },
            },
            {
                name: 'Ciudades',
                route: '/dashboard/cities',
                packages: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }],
                application: { id: 1 },
                user: { id: 1 },
                userUpdate: { id: 1 },
            },
            {
                name: 'Tipos de Identificación',
                route: '/dashboard/identification_types',
                packages: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }],
                application: { id: 1 },
                user: { id: 1 },
                userUpdate: { id: 1 },
            },
            {
                name: 'Tipos de Documento',
                route: '/dashboard/document_types',
                packages: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }],
                application: { id: 1 },
                user: { id: 1 },
                userUpdate: { id: 1 },
            },
            {
                name: 'Tipos de Cliente',
                route: '/dashboard/client_types',
                packages: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }],
                application: { id: 1 },
                user: { id: 1 },
                userUpdate: { id: 1 },
            },
            {
                name: 'Tipos de Contribuyente',
                route: '/dashboard/taxpayer_types',
                packages: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }],
                application: { id: 1 },
                user: { id: 1 },
                userUpdate: { id: 1 },
            },
            {
                name: 'Clientes',
                route: '/dashboard/clients',
                packages: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }],
                application: { id: 1 },
                user: { id: 1 },
                userUpdate: { id: 1 },
            },
            {
                name: 'Proveedores',
                route: '/dashboard/providers',
                packages: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }],
                application: { id: 1 },
                user: { id: 1 },
                userUpdate: { id: 1 },
            },
        ];

        const pagesConfiguration = [
            {
                name: 'Usuarios',
                route: '/dashboard/users',
                packages: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }],
                application: { id: 1 },
                user: { id: 1 },
                userUpdate: { id: 1 },
            },
            {
                name: 'Acciones',
                route: '/dashboard/actions',
                packages: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }],
                application: { id: 1 },
                user: { id: 1 },
                userUpdate: { id: 1 },
            },
            {
                name: 'Aplicaciones',
                route: '/dashboard/applications',
                packages: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }],
                application: { id: 1 },
                user: { id: 1 },
                userUpdate: { id: 1 },
            },
            {
                name: 'Paquetes',
                route: '/dashboard/packages',
                packages: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }],
                application: { id: 1 },
                user: { id: 1 },
                userUpdate: { id: 1 },
            },
            {
                name: 'Páginas',
                route: '/dashboard/pages',
                packages: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }],
                application: { id: 1 },
                user: { id: 1 },
                userUpdate: { id: 1 },
            },
            {
                name: 'Perfiles',
                route: '/dashboard/profiles',
                packages: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }],
                application: { id: 1 },
                user: { id: 1 },
                userUpdate: { id: 1 },
            },
            {
                name: 'Estatus',
                route: '/dashboard/status',
                packages: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }],
                application: { id: 1 },
                user: { id: 1 },
                userUpdate: { id: 1 },
            },
            {
                name: 'Tipos de Impresora',
                route: '/dashboard/printer_types',
                packages: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }],
                application: { id: 1 },
                user: { id: 1 },
                userUpdate: { id: 1 },
            },
            {
                name: 'Marcas de Impresora',
                route: '/dashboard/printer_brands',
                packages: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }],
                application: { id: 1 },
                user: { id: 1 },
                userUpdate: { id: 1 },
            },
            {
                name: 'Modelos de Impresora',
                route: '/dashboard/printer_models',
                packages: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }],
                application: { id: 1 },
                user: { id: 1 },
                userUpdate: { id: 1 },
            },
            {
                name: 'Impresoras',
                route: '/dashboard/printers',
                packages: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }],
                application: { id: 1 },
                user: { id: 1 },
                userUpdate: { id: 1 },
            },
            {
                name: 'Tipo de Cajas',
                route: '/dashboard/cashier_types',
                packages: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }],
                application: { id: 1 },
                user: { id: 1 },
                userUpdate: { id: 1 },
            },
            {
                name: 'Cajas',
                route: '/dashboard/cashiers',
                packages: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }],
                application: { id: 1 },
                user: { id: 1 },
                userUpdate: { id: 1 },
            },
            {
                name: 'Empresas',
                route: '/dashboard/companies',
                packages: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }],
                application: { id: 1 },
                user: { id: 1 },
                userUpdate: { id: 1 },
            },
        ];

        const pagesAdministrative = [
            {
                name: 'Bancos',
                route: '/dashboard/administrative/banks',
                packages: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }],
                application: { id: 1 },
                user: { id: 1 },
                userUpdate: { id: 1 },
            },
            {
                name: 'Monedas',
                route: '/dashboard/administrative/money',
                packages: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }],
                application: { id: 1 },
                user: { id: 1 },
                userUpdate: { id: 1 },
            },
            {
                name: 'Tasas de cambio',
                route: '/dashboard/administrative/exchange_rate',
                packages: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }],
                application: { id: 1 },
                user: { id: 1 },
                userUpdate: { id: 1 },
            },
        ];

        const pagesInventory = [
            {
                name: 'Catalogo',
                route: '/dashboard/inventory/catalogue',
                packages: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }],
                application: { id: 1 },
                user: { id: 1 },
                userUpdate: { id: 1 },
            },
            {
                name: 'Marcas',
                route: '/dashboard/inventory/brands',
                packages: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }],
                application: { id: 1 },
                user: { id: 1 },
                userUpdate: { id: 1 },
            },

            {
                name: 'Categorias',
                route: '/dashboard/inventory/categories',
                packages: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }],
                application: { id: 1 },
                user: { id: 1 },
                userUpdate: { id: 1 },
            },
            {
                name: 'Sub categorias',
                route: '/dashboard/inventory/sub-categories',
                packages: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }],
                application: { id: 1 },
                user: { id: 1 },
                userUpdate: { id: 1 },
            },
            {
                name: 'Concentraciones',
                route: '/dashboard/inventory/concentration',
                packages: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }],
                application: { id: 1 },
                user: { id: 1 },
                userUpdate: { id: 1 },
            },

            {
                name: 'Tipos de paquetes',
                route: '/dashboard/inventory/types-packaging',
                packages: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }],
                application: { id: 1 },
                user: { id: 1 },
                userUpdate: { id: 1 },
            },
            {
                name: 'Tipos de presentacion',
                route: '/dashboard/inventory/types-presentation',
                packages: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }],
                application: { id: 1 },
                user: { id: 1 },
                userUpdate: { id: 1 },
            },
            {
                name: 'Unidades de concentracion',
                route: '/dashboard/inventory/units-concentration',
                packages: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }],
                application: { id: 1 },
                user: { id: 1 },
                userUpdate: { id: 1 },
            },
            {
                name: 'Unidades de medida',
                route: '/dashboard/inventory/units-measurement',
                packages: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }],
                application: { id: 1 },
                user: { id: 1 },
                userUpdate: { id: 1 },
            },
            {
                name: 'Cantidad por Paquete',
                route: '/dashboard/inventory/quantities-package',
                packages: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }],
                application: { id: 1 },
                user: { id: 1 },
                userUpdate: { id: 1 },
            },
        ];

        const savedPagesConfiguration = await pageRepository.save(pagesConfiguration);
        const savedPagesMaestros = await pageRepository.save(pagesMaestros);
        const savedPagesAdministrative = await pageRepository.save(pagesAdministrative);
        const savedPagesInventory = await pageRepository.save(pagesInventory);

        const pagesFather = [
            {
                name: 'Maestros',
                route: '/dashboard/maestros',
                packages: [{ id: 1 }],
                application: { id: 1 },
                user: { id: 1 },
                icon: 'DatabaseOutlined',
                userUpdate: { id: 1 },
                pages: savedPagesMaestros,
            },
            {
                name: 'Configuración',
                route: '/dashboard/configuracion',
                packages: [{ id: 1 }],
                application: { id: 1 },
                user: { id: 1 },
                userUpdate: { id: 1 },
                icon: 'SettingOutlined',
                pages: savedPagesConfiguration,
            },
            {
                name: 'Administrativo',
                route: '/dashboard/administrative',
                packages: [{ id: 1 }],
                application: { id: 1 },
                user: { id: 1 },
                userUpdate: { id: 1 },
                icon: 'FileOutlined',
                pages: savedPagesAdministrative,
            },
            {
                name: 'Inventario',
                route: '/dashboard/inventory',
                packages: [{ id: 1 }],
                application: { id: 1 },
                user: { id: 1 },
                userUpdate: { id: 1 },
                icon: 'ShoppingCartOutlined',
                pages: savedPagesInventory,
            },
        ];

        const pagesFatherConfig = await pageRepository.save(pagesFather);

        const profile = await profileRepository.findOne({ where: { id: 1 } });

        if (profile) {
            for (const page of pagesFatherConfig) {
                await profilePagesRepository.save({
                    profile,
                    page,
                    package: { id: 1 },
                });
                page.pages.forEach((el) => {
                    profilePagesRepository.save({
                        profile,
                        page: el,
                        package: { id: 4 },
                    });
                });
            }
        }
    }
}
