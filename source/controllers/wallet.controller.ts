import { Router } from "express";
import { WalletService } from "../service/wallet.service";

export class WalletController {
    public router: Router;
    private walletService: WalletService;

    constructor() {
        this.walletService = new WalletService();
        this.router = Router();
        this.routes();
    }

    private routes() {
        this.router.post("getOrConnectWallet", this.getOrConnectWallet);
        this.router.post("/balance", this.balance);


    }
    getOrConnectWallet() {
        console.log("Initializin wallet");

        
        
    }
    balance() {
        throw new Error("Method not implemented.");
    }
}