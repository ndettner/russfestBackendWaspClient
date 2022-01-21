import { getConnection } from "typeorm";
import UserEntity from "../database/entities/user.entity";
import { UserRepository } from "../repository/user.repository";

export class UserService {
    
    
    private userRepository: UserRepository
    constructor() {
        this.userRepository = getConnection("register").getCustomRepository(UserRepository);

    }

    public index = async () => {
        const user = await this.userRepository.find()
        return user;
    }

    public create = async (user: UserEntity) => {
        const existingUser = await this.userRepository.findOne(user);
        
        // Only insert if username is not taken already
        if (!existingUser) {
            const newUser = await this.userRepository.save(user);
            return newUser
        }else{
            return null
        }
    }

    public login = async (user: UserEntity) => {
        const existingUser = await this.userRepository.findOne(user);

        // only return user if user existst by username und password matches
        if (this.checkExistingPW(existingUser, user.password)){
            return existingUser
        }
        return null;
    }

    
    public changePW = async (user: UserEntity, newPW: string) => {
        let existingUser = await this.userRepository.findOne(user);
        // TODO doppelte verwendung von existingUser check in checkExistingPW
        // only change PW if user exists and has matching OW
        if (existingUser &&this.checkExistingPW(existingUser, user.password)){
            await this.userRepository.update(existingUser, {"password": newPW})
        }
    }


    private checkExistingPW(userFromDB: any, oldPW: string){
        if (userFromDB && userFromDB.password === oldPW ){
            return true;
        }else {
            return false;
        }
    }
}