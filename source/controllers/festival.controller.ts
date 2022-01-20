import { Request, Response, Router } from "express";
import WebSocket from "ws";
import * as consts from '../consts';
import { env } from "process";
import { Base58, HName, IKeyPair, IOnLedger, ISendTransactionResponse } from "../wasp_client";
import { FestivalService } from "../service/festival.service";

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
    }

    public addMusician = async (req: Request, res: Response) => {
        const onLedgerResponse: ISendTransactionResponse = await this.festivalService.addMusician(req.body["publicKey"], req.body["secretKey"], req.body["musicianName"], req.body["address"], req.body["shop"]);

        if (typeof onLedgerResponse.error !== "undefined") {
            res.status(405).send(onLedgerResponse.error);
        } else {
            res.status(200).send();
        }
    }

    public getMusicians = async (req: Request, res: Response) => {
        const getMusicianViewResult: ParameterResult = await this.festivalService.getMusicians();
    }


    public connectWebSocket() {
        const webSocketUrl: string = "ws://159.69.187.49:9090/chain/n82SFSYKLNAf37grGHW49TEZPxNkx7osmdjBoGUoHpAV/ws";
        console.log(`Conneting to WebSocket => ${webSocketUrl}`);
        try {
            this.webSocket = new WebSocket(webSocketUrl);
            this.webSocket.on("message", (data) => {

                const msg = data.toString();
                if (msg.startsWith("vmmsg")) {
                    const eventType = msg.split("fairroulette.")[1].split(" ")[0];
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

}