import { EntityRepository, Repository } from "typeorm";
import UserEntity from "../database/entities/user.entity";

@EntityRepository(UserEntity)
export class UserRepository extends Repository<UserEntity> {
    
}