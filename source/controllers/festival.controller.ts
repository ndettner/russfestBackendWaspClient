import { Request, Response, Router } from "express";
import WebSocket from "ws";
import { HName, ISendTransactionResponse } from "../wasp_client";
import { FestivalService } from "../service/festival.service";
import { env } from "process";
import * as wasmclient from "../wasmclient"
import { Base58, IKeyPair } from "../wasmclient/crypto";
import { Buffer } from "../wasmclient/buffer"

type ParameterResult = { [key: string]: string };


export class FestivalController {
    public router: Router;
    private webSocket: WebSocket;
    private festivalService: FestivalService;

    constructor() {
        this.router = Router();
        this.routes()
        this.connectWebSocket();
        this.festivalService = new FestivalService();
    }

    private routes() {
        this.router.post("/addMusician", this.addMusician)
        this.router.post("/getMusicians", this.getMusicians)
        this.router.post("/requestShopLicence", this.requestShopLicence)
        this.router.post("/acceptShop", this.acceptShop)
        this.router.post("/denyShop", this.denyShop)
        this.router.post("/cancelShopRequest", this.cancelShopRequest)
        this.router.post("/updateDeniedShopRequest", this.updateDeniedShopRequest)
        this.router.post("/buyMerch", this.buyMerch)
    }

    public buyMerch = async (req: Request, res: Response) => {
        const seedKeyPair: SeedKeyPair = this.createSeedKeyPair(req.body["publicKey"], req.body["secretKey"], req.body["seed"]);
        const response = await this.festivalService.buyMerch(seedKeyPair, req.body["shopName"], req.body["musician"], req.body["productType"], req.body["price"])
        res.status(200).send()
    }

    public updateDeniedShopRequest = async (req: Request, res: Response) => {
        const seedKeyPair: SeedKeyPair = this.createSeedKeyPair(req.body["publicKey"], req.body["secretKey"], req.body["seed"]);
        const response = await this.festivalService.updateDeniedShopRequest(seedKeyPair, req.body["shopName"], req.body["newfee"], req.body["NewScAdress"], req.body["newHname"])
        res.status(200).send()
    }

    public cancelShopRequest = async (req: Request, res: Response) => {
        const seedKeyPair: SeedKeyPair = this.createSeedKeyPair(req.body["publicKey"], req.body["secretKey"], req.body["seed"]);
        const response = await this.festivalService.cancelShopRequest(seedKeyPair, req.body["shopName"])
        res.status(200).send()

    }

    public denyShop = async (req: Request, res: Response) => {
        const seedKeyPair: SeedKeyPair = this.createSeedKeyPair(req.body["publicKey"], req.body["secretKey"], req.body["seed"]);
        const response = await this.festivalService.denyShop(seedKeyPair, req.body["shopName"])
        res.status(200).send()
    }

    public acceptShop = async (req: Request, res: Response) => {

        const seedKeyPair: SeedKeyPair = this.createSeedKeyPair(req.body["publicKey"], req.body["secretKey"], req.body["seed"]);
        const response = await this.festivalService.acceptShop(seedKeyPair, req.body["shopName"])

        res.status(200).send();
    }

    public addMusician = async (req: Request, res: Response) => {

        const seedKeyPair: SeedKeyPair = this.createSeedKeyPair(req.body["publicKey"], req.body["secretKey"], req.body["seed"])
        const onLedgerResponse: ISendTransactionResponse = await this.festivalService.addMusician(seedKeyPair, req.body["musicianName"], req.body["address"], req.body["shop"]);

        /* 
        if (typeof onLedgerResponse.error !== "undefined") {
            res.status(405).send(onLedgerResponse.error);
        } else {
            res.status(200).send();
        } */

        res.status(200).send()
    }


    public requestShopLicence = async (req: Request, res: Response) => {
        const shopName = req.body["name"];
        const fee: bigint = BigInt(req.body["fee"]);
        const SCAgentID: wasmclient.AgentID = req.body["ScAgentID"];
        const musicianName = req.body["musicianName"];
        const Hname: string = "0x" + req.body["Hname"];
        const seedKeyPair: SeedKeyPair = this.createSeedKeyPair(req.body["publicKey"], req.body["secretKey"], req.body["seed"])
        console.log(seedKeyPair);


        await this.festivalService.requestShopLicence(seedKeyPair, shopName, fee, SCAgentID, musicianName, parseInt(Hname));
        res.status(200).send()
    }

    public getMusicians = async (req: Request, res: Response) => {
        const getMusicianViewResult: ParameterResult = await this.festivalService.getMusicians();
    }


    public connectWebSocket() {
        const chainID = env.RUSSFEST_CHAIN_ID;
        const webSocketUrl: string = `ws://159.69.187.49:9090/chain/${chainID}/ws`;
        console.log(`Conneting to WebSocket => ${webSocketUrl}`);
        try {
            this.webSocket = new WebSocket(webSocketUrl);
            this.webSocket.on("message", (data) => {

                const msg = data.toString();
                if (msg.startsWith("vmmsg")) {
                    let eventType = "test"
                    // const eventType = msg.split("fairroulette.")[1].split(" ")[0];
                    switch (eventType) {
                        case "bet.placed":
                            console.log(` BET PLACED: ${msg}`);
                            break
                        case "round.number":
                            console.log(` ROUND NUMBER: ${msg}`);
                            break
                        case "round.winning_number":
                            console.log(` WINNING NUMBER:  ${msg}`);
                            break
                        case "payout":
                            console.log(` PAYOUT: ${msg}`);
                            break
                    }
                } else {
                    console.log(msg);
                };
            })
        } catch (e) {
            console.log(e);
        }





    }

    private createSeedKeyPair(publiKey: string, secretKey: string, seed: string): SeedKeyPair {
        return new SeedKeyPair(publiKey, secretKey, seed);
    }

}



export class SeedKeyPair {
    public keyPair: IKeyPair
    public seed: Buffer
    constructor(pubKey: string, secretKey: string, seed: string) {
        this.keyPair = {
            publicKey: Base58.decode(pubKey),
            secretKey: Base58.decode(secretKey)
        }
        this.seed = Base58.decode(seed)
    }
}