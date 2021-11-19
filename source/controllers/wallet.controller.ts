import { Request, Response, Router } from "express";
import { WalletService } from "../service/wallet.service";
import { Base58, BasicClient, Seed } from "../wasp_client";
import * as crypto from "crypto";
import * as numberGenerator from "number-generator";
import { Buffer } from "../wasp_client/buffer";
import { WaspHelpers } from "../wasp_client_helper";

export class WalletController {
    public router: Router;
    private walletService: WalletService;
    private waspHelpers: WaspHelpers;

    constructor() {
        this.walletService = new WalletService();
        this.waspHelpers = new WaspHelpers();
        this.router = Router();
        this.routes();
    }

    private routes() {
        this.router.get("/getOrConnectWallet", this.getOrConnectWallet);
        this.router.post("/balance", this.balance);


    }
    public getOrConnectWallet = async (req: Request, res: Response) => {

       

        
        
        const array = this.waspHelpers.generateSeed(2);

        let baseseed = Base58.encode(Buffer.from(array));

        

        console.log("Initializin wallet");
        let seed: string = "oVJ6qTRjUS5zRcnPnzCXCtTPBZiM5vxfxA8xQjaxQLw";
        if (Base58.isValid(baseseed)) {
            res.send(baseseed.toString());
        } else {
            res.send("Not Valid")
        }



    }
    balance() {
        throw new Error("Method not implemented.");
    }
}