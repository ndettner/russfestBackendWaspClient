import { Request, Response, NextFunction, Router } from 'express';
import UserEntity from '../database/entities/user.entity';
import HttpException from '../exceptions/HttpException';
import { UserService } from '../service/user.service';



export class UserController {
    public router: Router;
    private userService: UserService;

    constructor() {
        this.userService = new UserService();
        this.router = Router();
        this.routes();
    }

    public index = async (req: Request, res: Response) => {
        const user = await this.userService.index();
        res.send(user);
    }

    public register = async (req: Request, res: Response, next: NextFunction) => {
        const user = req['body'] as UserEntity;
        const newUser = await this.userService.create(user);

        // only send succesfull if user could be registered
        if (newUser) {
            res.send(newUser);
        } else {
            next(new HttpException(409, "User already exists", "Please chose a different username"))
        }
    }

    public login = async (req: Request, res: Response, next: NextFunction) => {
        const user = req['body'] as UserEntity;
        const logIn = await this.userService.login(user);

        // only send succesfull if a user coul be recieved
        if (logIn) {
            res.send(logIn);
        } else {
            next(new HttpException(419, "Could not login", "Password/username doesn't match"))
        }

    }

    public changePW = async (req: Request, res: Response, next: NextFunction) => {

        // TODO entity kennt newPassword nicht
        const user = req['body'] as UserEntity;
        const newPW = req['body']['newPassword']
                  
        const newPwUser = await this.userService.changePW(user, newPW);

        res.sendStatus(200);
    }


    public routes() {
        this.router.get("/index", this.index)
        this.router.post("/register", this.register)
        this.router.post("/login", this.login)
        this.router.post("/pw", this.changePW)
    }

}




