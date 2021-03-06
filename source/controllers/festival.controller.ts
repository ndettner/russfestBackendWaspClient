import { json, Request, Response, Router } from "express";
import WebSocket from "ws";
import { FestivalService } from "../service/festival.service";
import { env } from "process";
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
        // this.connectWebSocket();
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
        this.router.post("/sentIOTAtoChain", this.sentIOTAtoChain)
        this.router.post("/setOwner", this.setOwner)
        this.router.post("/getMerchShops", this.getMerchShops)
        this.router.post("/getMerchProducts", this.getMerchProducts)
        this.router.post("/getAllOpenShopRequests", this.getAllOpenShopRequest)
        this.router.post("/getFestivalEarnings", this.getFestivalEarnings)
        this.router.post("/getShopOwnerShops", this.getShopOwnerShops)
        this.router.post("/getShopOwnerRequests", this.getShopOwnerRequests)
        this.router.post("/getShopStatistics", this.getShopStatistics)
        this.router.post("/getMusiciansWithoutShop", this.getMusiciansWithoutShops)
        this.router.post("/shopOwnerAddTemplate", this.shopOwnerAddTemplate)
        this.router.post("/testRequest", this.testRequest)
        this.router.post("/testSingleString", this.testSingleString)
    }

    public testSingleString = async (req: Request, res: Response) => {
        try {
            const response = await this.festivalService.testSingleString();
            res.status(200).send(response)
        } catch (error) {
            res.status(400).send(error)

        }

    }

    public testRequest = async (req: Request, res: Response) => {
        try {
            const response = await this.festivalService.testRequest(req.body["shopName"])
            res.status(200).send(response);
        } catch (error) {
            res.status(400).send(error)
        }

    }

    public shopOwnerAddTemplate = async (req: Request, res: Response) => {
        try {
            const seedKeyPair: SeedKeyPair = this.createSeedKeyPair(req.body["publicKey"], req.body["secretKey"], req.body["seed"]);
            const response = await this.festivalService.shopOwnerAddTemplate(seedKeyPair, req.body["shopName"], req.body["musician"], BigInt(req.body["price"]), req.body["productType"])
            res.status(200).send();
        } catch (error) {
            res.status(400).send(error);
        }

    }


    public getShopStatistics = async (req: Request, res: Response) => {
        try {
            const seedKeyPair: SeedKeyPair = this.createSeedKeyPair(req.body["publicKey"], req.body["secretKey"], req.body["seed"]);
            const response = await this.festivalService.getShopStatistics(seedKeyPair, req.body["shopName"]);


            res.status(200).send(response.toJson());
        } catch (error) {

            console.log(error);
            res.status(400).send();
        }
    }



    public getShopOwnerShops = async (req: Request, res: Response) => {
        try {
            const seedKeyPair: SeedKeyPair = this.createSeedKeyPair(req.body["publicKey"], req.body["secretKey"], req.body["seed"]);
            const response = await this.festivalService.getShopOwnerShops(seedKeyPair);
            res.status(200).send(response);
        } catch (error) {
            console.log(error)
            res.status(400).send("[]");
        }

    }

    public getFestivalEarnings = async (req: Request, res: Response) => {

        try {
            let balance = "12345";
            res.status(200).send(balance);
        } catch (error) {
            console.log(error);
            res.status(400).send();
        }

    }



    public getMerchProducts = async (req: Request, res: Response) => {

        try {
            const response = await this.festivalService.getMerchProducts(req.body["shopName"]);
            res.status(200).send(response)
        } catch (error) {
            res.status(400).send(error)
        }


    }

    public getMerchShops = async (req: Request, res: Response) => {

        try {
            const response = await this.festivalService.getMerchShops();
            res.status(200).send(response);

        } catch (error) {
            res.status(400).send(error)
        }
    }

    public setOwner = async (req: Request, res: Response) => {
        const seedKeyPair: SeedKeyPair = this.createSeedKeyPair(req.body["publicKey"], req.body["secretKey"], req.body["seed"]);
        const response = await this.festivalService.setOwner(seedKeyPair);
    }

    public sentIOTAtoChain = async (req: Request, res: Response) => {
        const seedKeyPair: SeedKeyPair = this.createSeedKeyPair(req.body["publicKey"], req.body["secretKey"], req.body["seed"]);
        const response = await this.festivalService.sentIOTAtoChain(seedKeyPair);
        if (response) {
            res.status(200).send()
        } else {
            res.status(400).send()
        }

    }

    public buyMerch = async (req: Request, res: Response) => {
        const seedKeyPair: SeedKeyPair = this.createSeedKeyPair(req.body["publicKey"], req.body["secretKey"], req.body["seed"]);
        console.log(req.body);


        res.status(200).send("Bla bla bla");/* 
        const response = await this.festivalService.buyMerch(seedKeyPair, req.body["shopName"], req.body["musician"], req.body["productType"], req.body["price"])

        if (response === "") {
            res.status(200).send();
        } else {
            res.status(400).send(response);
        } */


    }

    public updateDeniedShopRequest = async (req: Request, res: Response) => {
        try {
            const seedKeyPair: SeedKeyPair = this.createSeedKeyPair(req.body["publicKey"], req.body["secretKey"], req.body["seed"]);
            const response = await this.festivalService.updateDeniedShopRequest(seedKeyPair, req.body["shopName"], req.body["fee"], req.body["hName"])

            if (response === "") {
                res.status(200).send()
            } else {
                res.status(400).send(response)
            }
        } catch (error) {
            res.status(400).send(error);
        }

    }

    public cancelShopRequest = async (req: Request, res: Response) => {
        try {
            const seedKeyPair: SeedKeyPair = this.createSeedKeyPair(req.body["publicKey"], req.body["secretKey"], req.body["seed"]);
            const response = await this.festivalService.cancelShopRequest(seedKeyPair, req.body["shopName"])

            if (response === "") {
                res.status(200).send()
            } else {
                res.status(400).send(response)
            }
        } catch (error) {
            res.status(400).send(error);
        }


    }

    public denyShop = async (req: Request, res: Response) => {

        try {
            const seedKeyPair: SeedKeyPair = this.createSeedKeyPair(req.body["publicKey"], req.body["secretKey"], req.body["seed"]);
            const response = await this.festivalService.denyShop(seedKeyPair, req.body["shopName"])

            if (response === "") {
                res.status(200).send()
            } else {
                res.status(400).send(response)
            }
        } catch (error) {
            res.status(400).send()
        }



    }

    public acceptShop = async (req: Request, res: Response) => {

        try {
            const seedKeyPair: SeedKeyPair = this.createSeedKeyPair(req.body["publicKey"], req.body["secretKey"], req.body["seed"]);
            const response = await this.festivalService.acceptShop(seedKeyPair, req.body["shopName"])

            if (response === "") {
                res.status(200).send();
            } else {
                res.status(400).send(response);
            }
        } catch (error) {
            res.status(400).send(error)
        }

    }

    public addMusician = async (req: Request, res: Response) => {

        const seedKeyPair: SeedKeyPair = this.createSeedKeyPair(req.body["publicKey"], req.body["secretKey"], req.body["seed"])
        try {
            const errorMessage: string = await this.festivalService.addMusician(seedKeyPair, req.body["musicianName"], req.body["shop"]);

            if (errorMessage === "") {
                res.status(200).send()
            } else {
                res.status(400).send(errorMessage);
            }
        } catch (error) {
            console.log(error);
            res.status(400).send(error);
        }



    }


    public requestShopLicence = async (req: Request, res: Response) => {
        try {
            console.log(req.body);

            const shopName = req.body["shopName"];
            const fee: bigint = BigInt(req.body["fee"]);
            const musicianName = req.body["musicianName"];
            const hName: string = "0x" + req.body["hName"];
            const seedKeyPair: SeedKeyPair = this.createSeedKeyPair(req.body["publicKey"], req.body["secretKey"], req.body["seed"])
            const errorMessage = await this.festivalService.requestShopLicence(seedKeyPair, shopName, fee, musicianName, parseInt(hName));

            if (errorMessage === "") {
                res.status(200).send()
            } else {
                res.status(400).send(errorMessage)
            }


        } catch (error) {
            console.log(error);
            res.status(400).send(error)

        }



        //await this.festivalService.requestShopLicence(seedKeyPair, shopName, fee, musicianName, parseInt(hName));

    }

    //////////////////////////////////// VIEWS ///////////////////////////////////////

    public getMusicians = async (req: Request, res: Response) => {
        try {
            const getMusicianViewResult = await this.festivalService.getMusicians();
            res.status(200).send(getMusicianViewResult)
        } catch (error) {
            console.log(error);

            res.status(400).send(error.toString())
        }
    }


    public getMusiciansWithoutShops = async (req: Request, res: Response) => {
        try {
            const response = await this.festivalService.getMusiciansWithoutShop();
            res.status(200).send(response);
        } catch (error) {
            console.log(error);

            res.status(400).send(error)
        }

    }

    public getShopOwnerRequests = async (req: Request, res: Response) => {
        try {
            const seedKeyPair: SeedKeyPair = this.createSeedKeyPair(req.body["publicKey"], req.body["secretKey"], req.body["seed"]);
            const response = await this.festivalService.getShopOwnerRequests(seedKeyPair);


            let jsonOpenRequests = []
            response[0].forEach((openRequest) => jsonOpenRequests.push(openRequest.toJson()))
            let jsonDeniedRequests = []
            response[1].forEach((deniedRequest) => jsonDeniedRequests.push(deniedRequest.toJson()))


            var json = {
                openRequests: jsonOpenRequests,
                deniedRequests: jsonDeniedRequests
            }

            res.status(200).send(json)
        } catch (error) {
            console.log(error);

            res.status(400).send(error)

        }


    }

    public getAllOpenShopRequest = async (req: Request, res: Response) => {
        try {
            const response = await this.festivalService.getAllOpenShops();
            let jsonResponse = []
            response.forEach((shop) => jsonResponse.push(shop.toJson()))

            res.status(200).send(jsonResponse);
        } catch (error) {
            console.log(error);
            res.status(400).send("[]");
        }

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