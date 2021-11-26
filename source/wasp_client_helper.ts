import { IAllowedManaPledgeResponse, Seed } from "./wasp_client"
import { Buffer } from "./wasp_client/buffer"
import { aleaRNGFactory } from "number-generator";
import { IFaucetRequest } from "./wasp_client/binary_models";
import fetch = require('node-fetch'); 
export class WaspHelpers {
   
    headers: { [id: string]: string };



    constructor() {
        this.headers = {
            'Content-Type': 'application/json',
        };
    }
    // will produce a pseudo-random 32Uint array and returns a Buffer.

    public generateSeed(seed: number): Buffer {

        const array = new Uint32Array(Seed.SEED_SIZE);
        const numberGenerator = aleaRNGFactory(seed);

        for (let index = 0; index < array.length; index++) {
            array[index] = numberGenerator.uInt32();
        }

        return Buffer.from(array);
    }

    public async getAllowedManaPledge(): Promise<IAllowedManaPledgeResponse> {
        const headers: { [id: string]: string } = {
            'Content-Type': 'application/json',
        };
        let response: IAllowedManaPledgeResponse;
        const fetchresponse = await fetch(`${process.env.GOSHIMMERAPI}/mana/allowedManaPledge`, { method: "get", headers: this.headers });
        response = await fetchresponse.json();
        return response;

    }

    public async sendFaucetRequest(faucetRequest: IFaucetRequest) {
        // TODO try catch bzw then catch for fetch?
        let fetchresponse: Response = await fetch(`${process.env.GOSHIMMERAPI}/faucet`, { method: "post", headers: this.headers, body: JSON.stringify(faucetRequest) });
        const response = await fetchresponse.json();
    }

    public async getUnspentOutputs() {
        throw new Error("Method not implemented.");
    }


}