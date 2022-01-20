import { Request, Response, Router } from "express";
import { WalletService } from "../service/wallet.service";
import { Base58, BasicClient, Colors, HName, IFaucetRequestContext, IKeyPair, IOnLedger, ISendTransactionResponse, Seed } from "../wasp_client";
import { Buffer } from "../wasp_client/buffer"
import { AcceptShopFunc, RussfestService } from "../client";
import * as wasmclient from "../wasmclient"
import { Decoder, Encoder } from "../wasmclient";
import { env } from "process";

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
        // this.router.post("/addMusician", this.addMusician)

        
        
    }



    public generateNewWallet = async (req: Request, res: Response) => {

        const russFestService = new RussfestService(new wasmclient.ServiceClient({
            seed: null,
            waspWebSocketUrl: "ws://127.0.0.1:9090",
            waspApiUrl: "159.69.187.49:9090",
            goShimmerApiUrl: "",
            chainId: env.RUSSFEST_CHAIN_ID
        }));

        let test = russFestService.getOwner();
        
        let response = await test.call().then();
        let owner: string = response.owner();
        console.log(owner);

        let encoder = new Encoder();
        let encoded = encoder.fromAgentID(owner);
        console.log(encoded);
        
        
        



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

    public exchangeToRussCoins = async (req: Request, res: Response) => {

    }
}