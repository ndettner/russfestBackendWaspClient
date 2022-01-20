import { Router, Request, Response } from "express";
import { WaspService } from "../service/wasp.service";
import WebSocket from "ws";
import { Seed } from "../wasp_client";


export class WaspController {
    public router: Router;
    private waspService: WaspService;
    private webSocket: WebSocket;

    constructor() {
        this.waspService = new WaspService();
        this.router = Router();
        this.routes()
       //  this.connectWebSocket();

    }


    private routes() {
        this.router.post("/getWaspInfos", this.getWaspInfos);
    }

    public getWaspInfos = async (req: Request, res: Response) => {
        let response = await this.waspService.getWaspInfos();

        res.send(response);
    }


    public connectWebSocket() {
        // TODO websocket for my own wasp node at 159.69.187.49


        const webSocketUrl: string = "ws://159.69.187.49:9090/chain/e6Ya5RmDh2euTjpDxobfxdfwACBc1f5caTr8feXtQKBd/ws";
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