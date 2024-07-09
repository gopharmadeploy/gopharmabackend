import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import { SeederOptions } from 'typeorm-extension';

config();

export const dbdatasource: DataSourceOptions & SeederOptions = {
    type: 'mysql',
    host: process.env.DB_HOST,
    port: +process.env.DB_PORT,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: true,
    entities: [__dirname + '/../**/*.entity.{js,ts}'],
    seeds: ['src/database/seeds/**/*{.ts,.js}'],
};

const dataSource = new DataSource(dbdatasource);
export default dataSource;
