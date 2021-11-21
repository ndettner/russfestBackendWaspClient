import { Request, Response, Router } from "express";
import { WalletService } from "../service/wallet.service";
import { Base58, IKeyPair } from "../wasp_client";
import { Buffer } from "../wasp_client/buffer"

export class WalletController {
    public router: Router;
    private walletService: WalletService;

    constructor() {
        this.walletService = new WalletService();
        this.router = Router();
        this.routes();
    }

    private routes() {
        this.router.get("/validateWallet", this.validateWallet);
        this.router.get("/generateNewWallet", this.generateNewWallet)
        this.router.post("/balance", this.balance);
    }

    public generateNewWallet = async (req: Request, res: Response) => {
        // TODO look how to handle json proper
        const userID: number = 2;
        const walletSeed: Buffer = this.walletService.generateNewSeed(userID);
        console.log(walletSeed);
        const address: string = this.walletService.generateAddress(walletSeed, 0)
        const keyPair: IKeyPair = this.walletService.generateKeyPair(walletSeed, 0)
        this.walletService.requestFaucetFunds(Base58.encode(walletSeed), address, keyPair);
        res.send(walletSeed);
    }
    public validateWallet = async (req: Request, res: Response) => {
        // TODO look how to handle json proper
        const walletKey: string = req.body
        const isValid: boolean = this.walletService.validateWallet(walletKey);

        if (isValid) {
            res.send("Your Key is valid")
        } else {
            res.send("Your Key is not valid")
        }
    }
    balance() {
        throw new Error("Method not implemented.");
    }
}