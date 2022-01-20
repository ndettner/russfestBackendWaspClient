import fetch = require('node-fetch');
import { env } from 'process';
import * as consts from '../consts';
import { HName, IOnLedger } from '../wasp_client';

export class WaspService {
    constructor() { }

    public async addMusician(musician: string, shop: string) {
        const addMusicianRequest: IOnLedger = {
            contract: HName.HashAsNumber(env.RUSSFEST),
            entrypoint: HName.HashAsNumber(consts.FuncAddMusician),
            arguments: [
                {
                    key: consts.ParamMusician,
                    value: HName.HashAsNumber(musician)
                },
                {
                    key: consts.ParamShop,
                    value: HName.HashAsNumber(shop)
                },
            ],

        };
        
    }

    public async getWaspInfos() {
        let fetchresponse: Response = await fetch(`${process.env.GENERICWASPINFO}`, { method: "get" });
        let response = await fetchresponse.json();
        return response;
    }
}