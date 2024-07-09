import { User } from 'src/modules/config/users/entities/user.entity';
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
} from 'typeorm';
import { DocumentType } from '../../document-types/entities/document-type.entity';

@Entity('identification_types')
export class IdentificationType {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    name: string;

    @Column()
    code: string;

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date; // Creation date

    @UpdateDateColumn()
    updatedAt: Date; // Last updated date

    @ManyToOne(() => User, (user) => user.identificationTypes)
    user: User;

    @ManyToOne(() => User, (user) => user.identificationTypesUpdated, { nullable: true })
    userUpdate?: User;

    @OneToMany(() => DocumentType, (documentType) => documentType.identificationType)
    documentTypes: DocumentType[];
}
