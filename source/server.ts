/** source/server.ts */
import express, { Request, Response } from 'express';
import morgan from 'morgan';
import { UserController } from './controllers/user.controller';
import dotenv from 'dotenv';
import { typeOrmConfig } from './ormconfig';
import { createConnection } from 'typeorm';
import errorMiddleware from './middleware/error.middleware';
import { WalletController } from './controllers/wallet.controller';
import { WaspController } from './controllers/wasp.controller';
import { FestivalController } from './controllers/festival.controller';
import * as wasmclient from "./wasmclient"

class Server {
    private userController!: UserController;
    private walletController!: WalletController;
    private waspController!: WaspController;
    private festivalController!: FestivalController;
    private app: express.Application;

    constructor() {
        this.app = express();
        dotenv.config();
        this.configuration();
        this.routes();
        this.initializeErrorHandling()
        let client: wasmclient.ServiceClient = wasmclient.ServiceClient.default();

    }


    public configuration() {
        /** Logging */
        this.app.use(morgan('dev'));

        // ** Set Port */
        this.app.set('port', process.env.PORT || 3001);


        /** Takes care of JSON data */
        this.app.use(express.json());

        /** Takes care of URL encdoded data */
        this.app.use(express.urlencoded({ extended: true }));

        /** RULES OF OUR API */
        this.app.use((req, res, next) => {
            // set the CORS policy
            res.header('Access-Control-Allow-Origin', '*');
            // set the CORS headers
            res.header('Access-Control-Allow-Headers', 'origin, X-Requested-With,Content-Type,Accept, Authorization');
            // set the CORS method headers
            if (req.method === 'OPTIONS') {
                res.header('Access-Control-Allow-Methods', 'GET PATCH DELETE POST');
                return res.status(200).json({});
            }
            next();
        });
    }

    public async routes() {
        await createConnection(typeOrmConfig);

        this.userController = new UserController();
        this.walletController = new WalletController();
        this.waspController = new WaspController();
        this.festivalController = new FestivalController();

        this.app.get("/", (req: Request, res: Response) => {
            res.send("Hello world!");
        });

        this.app.use("/api/user", this.userController.router);
        this.app.use("/api/wallet", this.walletController.router);
        this.app.use("/api/wasp", this.waspController.router);
        this.app.use("/api/russfest", this.festivalController.router)
    }

    private initializeErrorHandling() {
        this.app.use(errorMiddleware)
    }

    /**
     * Used to start the server
     */

    public start() {
        this.app.listen(this.app.get("port"), () => {
            console.log(`Server is listening ${this.app.get("port")} port`);
        });
    }
}



const server = new Server();
server.start()
