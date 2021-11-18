import { Connection, createConnection, getManager } from "typeorm";
import { User } from "../model/User";
import {typeOrmConfig} from '../ormconfig';
import DBUsers from "./entities/user.entity";


export default class Database {
    public connection: Promise<Connection>;
    public theConnection!: Connection;
    private manager: any;

    constructor(){
        console.log('createConnection ...');

        this.connection = createConnection(typeOrmConfig);

        this.connection
            .then((con) => {
                this.manager = getManager();
                return console.log('createConnection did work');
            })
            .catch((e) => console.log('createConnection failed \n' + e));
    }

    public async store(user : User){
        try{
            const theConnection = await this.connection;
            await this.doStore(theConnection, user);
        }catch(e){
            console.log('Could not store ' + user);
        }
    }

    private async doStore(theConnection: Connection, user: User){
        const UserEntity = this.manager.create(DBUsers, user)
        const self = this;
        try{
            const result = await theConnection.manager.save(UserEntity);
        }catch(error){
            console.log(error);
            
        }
    }
    
}

