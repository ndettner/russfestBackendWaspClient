import {PostgresConnectionOptions} from 'typeorm/driver/postgres/PostgresConnectionOptions';
import DBUsers from './database/entities/user.entity';


const typeOrmConfig: PostgresConnectionOptions = {
    type: 'postgres',
    host: process.env.PGHOST,
    port: Number(process.env.PGPORT),
    username: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    synchronize: true,
    logging: false,
    // für welche TS Datentypen wird in die Tabelle geschrieben
    entities: [
        DBUsers, "./db/DBUsers.ts"
    ],
    name: "register"
};

export {typeOrmConfig};
