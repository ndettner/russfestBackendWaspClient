import { WalletService } from "./wallet.service";
import { Base58, HName, IKeyPair, IOnLedger, ISendTransactionResponse } from "../wasp_client";
import { Request, Response, Router } from "express";
import { env } from "process";
import * as consts from '../consts';
import { AcceptShopFunc } from "../client";

type ParameterResult = { [key: string]: string };


export class FestivalService {
    private walletService: WalletService;
    // private waspclient: wasmclient.WaspClient;

    constructor() {
        this.walletService = new WalletService();
        
        /* this.waspclient = new wasmclient.ServiceClient({
            seed: 
        }); */

    }










    public async addMusician(pubKey: string, secretKey: string, musicianName: string, address: string, shop: string) {
        const keyPair: IKeyPair = {
            publicKey: Base58.decode(pubKey),
            secretKey: Base58.decode(secretKey)
        }

        const addMusicianRequest: IOnLedger = {
            contract: HName.HashAsNumber(env.RUSSFEST),
            entrypoint: HName.HashAsNumber(consts.FuncAddMusician),
            arguments: [
                {
                    key: "-name",
                    value: 4
                }
            ]
        };


        if (shop !== undefined) {
            addMusicianRequest.arguments.push({
                key: "-shop",
                value: HName.HashAsNumber(shop)
            });
        }


        const onLedgerResponse: ISendTransactionResponse = await this.walletService.sendOnLedgerRequest(keyPair, address, env.RUSSFEST_CHAIN_ID, addMusicianRequest)
        return onLedgerResponse;
    }

    public async getMusicians(): Promise<ParameterResult> {
        const response = await this.walletService.callView(env.RUSSFEST_CHAIN_ID, HName.HashAsString(env.RUSSFEST), consts.ViewGetMusicians);

        const resultMap: ParameterResult = {}

        if (response.Items) {
            for (const item of response.Items) {
                const key = Buffer.from(item.Key, 'base64').toString();
                const value = Buffer.from(item.Value, 'base64');

                resultMap[key] = value.toString();
            }
        }

        console.log(resultMap);
        return;
    }
}