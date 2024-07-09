import { DocumentType } from 'src/modules/masters/document-types/entities/document-type.entity';
import { IdentificationType } from 'src/modules/masters/identification-types/entities/identification-type.entity';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';

export class DocumentTypesSeeder1719070222986 implements Seeder {
    track = false;

    public async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<any> {
        const identificationTypesRepository = dataSource.getRepository(IdentificationType);
        const documentTypesRepository = dataSource.getRepository(DocumentType);

        const documentTypesCedula = [
            { name: 'VENEZOLANO', code: 'V', user: { id: 1 }, userUpdate: { id: 1 } },
            { name: 'EXTRANGERO', code: 'E', user: { id: 1 }, userUpdate: { id: 1 } },
        ];
        const savedDocumentTypesCedula = await documentTypesRepository.save(documentTypesCedula);

        const documentTypesRif = [
            { name: 'VENEZOLANO', code: 'V', user: { id: 1 }, userUpdate: { id: 1 } },
            { name: 'EXTRANGERO', code: 'E', user: { id: 1 }, userUpdate: { id: 1 } },
            { name: 'JURIDICO', code: 'J', user: { id: 1 }, userUpdate: { id: 1 } },
            { name: 'GUBERNAMENTAL', code: 'G', user: { id: 1 }, userUpdate: { id: 1 } },
            { name: 'PASAPORTE', code: 'P', user: { id: 1 }, userUpdate: { id: 1 } },
        ];
        const savedDocumentTypesRif = await documentTypesRepository.save(documentTypesRif);

        const documentTypesPasaporte = [
            { name: 'PASAPORTE', code: 'P', user: { id: 1 }, userUpdate: { id: 1 } },
        ];
        const savedDocumentTypesPasaporte =
            await documentTypesRepository.save(documentTypesPasaporte);

        const identificationTypes = [
            {
                name: 'CÉDULA',
                code: 'C',
                user: { id: 1 },
                userUpdate: { id: 1 },
                documentTypes: savedDocumentTypesCedula,
            },
            {
                name: 'REGISTRO DE INFORMACIÓN FISCAL',
                code: 'RIF',
                user: { id: 1 },
                userUpdate: { id: 1 },
                documentTypes: savedDocumentTypesRif,
            },
            {
                name: 'PASAPORTE',
                code: 'P',
                user: { id: 1 },
                userUpdate: { id: 1 },
                documentTypes: savedDocumentTypesPasaporte,
            },
        ];

        await identificationTypesRepository.save(identificationTypes);
    }
}
