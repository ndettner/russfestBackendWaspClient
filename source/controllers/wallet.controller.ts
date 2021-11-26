import { Request, Response, Router } from "express";
import { WalletService } from "../service/wallet.service";
import { Base58, BasicClient, Colors, IFaucetRequestContext, IKeyPair } from "../wasp_client";
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
        this.router.post("/validateSeed", this.validateSeed);
        this.router.post("/generateNewWallet", this.generateNewWallet)
        this.router.post("/balance", this.balance);
    }

    public generateNewWallet = async (req: Request, res: Response) => {
        const userID: number = req.body["hash"];
        const walletSeed: Buffer = this.walletService.generateNewSeed(userID);
        const address: string = this.walletService.generateAddress(walletSeed, userID)
        const keyPair: IKeyPair = this.walletService.generateKeyPair(walletSeed, userID)
        const faucetRequestResult: IFaucetRequestContext = await this.walletService.requestFaucetFunds(address);

        let returnJSON = {
            "seed": Base58.encode(walletSeed),
            "address": address,
            "publicKey": Base58.encode(keyPair.publicKey),
            "secretKey": Base58.encode(keyPair.secretKey)
        };
        res.json(returnJSON)
    }

    public validateSeed = async (req: Request, res: Response) => {
        const walletseed: string = req.body["seed"];
        const isValid: boolean = this.walletService.validateSeed(walletseed);

        if (isValid) {
            res.status(200).send("Your Key is valid");
        } else {
            res.send("Your Key is not valid")
        }
    }
    public balance = async (req: Request, res: Response) => {
        const address = req.body["address"];
        const color = req.body["color"];
        let balance = await this.walletService.getBalance(address, color);
        res.send(balance.toString());
    }
}