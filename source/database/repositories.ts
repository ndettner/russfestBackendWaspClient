import { EntityRepository, getRepository, Repository } from "typeorm";
import DBUsers from "./entities/user.entity";

@EntityRepository(DBUsers)
export class DBUserRepository extends Repository<DBUsers>{  

}


