import { Request, Response, Router } from "express";
import { WalletService } from "../service/wallet.service";
import { IFaucetRequestContext, } from "../wasmclient/goshimmer/faucet/faucet_models";
import { Buffer } from "../wasmclient/buffer"
import * as wasmclient from "../wasmclient"
import { ServiceClient } from "../wasmclient";
import { env } from "process";
import { getAgentId, Base58, IKeyPair, } from "../wasmclient/crypto";

export class WalletController {
    public router: Router;
    private walletService: WalletService;
    private walletServiceClient: wasmclient.ServiceClient;

    constructor() {
        this.walletService = new WalletService();
        this.router = Router();
        this.routes();
        this.walletServiceClient = new ServiceClient({
            seed: null,
            waspWebSocketUrl: "ws://127.0.0.1:9090",
            waspApiUrl: "159.69.187.49:9090",
            goShimmerApiUrl: env.GOSHIMMERAPI,
            chainId: env.RUSSFEST_CHAIN_ID
        });

    }
    private routes() {
        this.router.post("/validateSeed", this.validateSeed);
        this.router.post("/generateNewWallet", this.generateNewWallet)
        this.router.post("/balance", this.balance);
        // this.router.post("/addMusician", this.addMusician) 
    }

    public generateNewWallet = async (req: Request, res: Response) => {
        const userID: number = req.body["hash"];
        const walletSeed: Buffer = this.walletService.generateNewSeed(userID);
        const address: string = this.walletService.generateAddress(walletSeed, userID)
        const keyPair: IKeyPair = this.walletService.generateKeyPair(walletSeed, userID)
        const agentID: wasmclient.AgentID = getAgentId(keyPair);
        
        const faucetRequestResult: IFaucetRequestContext = await this.walletService.requestFaucetFunds(address);

        this.walletServiceClient.configuration.seed = walletSeed;
        await this.walletServiceClient.goShimmerClient.depositIOTAToAccountInChain(keyPair, agentID, 1n);

        let returnJSON = {
            "seed": Base58.encode(walletSeed),
            "address": address,
            "publicKey": Base58.encode(keyPair.publicKey),
            "secretKey": Base58.encode(keyPair.secretKey),
            "agendID" : agentID 
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
        this.walletServiceClient.configuration.seed = Base58.decode(req.body["seed"]);
        const address = req.body["address"];
        let balance = await this.walletServiceClient.goShimmerClient.getIOTABalance(req.body["address"])
        res.send(balance.toString());
    }
}