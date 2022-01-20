import { WalletService } from "./wallet.service";
import { Base58, HName, IKeyPair, IOnLedger, ISendTransactionResponse } from "../wasp_client";
import { env } from "process";
import * as consts from '../consts';
import { AddMusicianFunc, RussfestService } from "../client";
import * as wasmclient from "../wasmclient"

type ParameterResult = { [key: string]: string };


export class FestivalService {
    private walletService: WalletService;
    private russfestService: RussfestService;
    // private waspclient: wasmclient.WaspClient;

    constructor() {
        this.walletService = new WalletService();
        this.russfestService = new RussfestService(new wasmclient.ServiceClient({
            seed: null,
            waspWebSocketUrl: "ws://127.0.0.1:9090",
            waspApiUrl: "159.69.187.49:9090",
            goShimmerApiUrl: env.GOSHIMMERAPI,
            chainId: env.RUSSFEST_CHAIN_ID
        }))
    }

    public async addMusician(pubKey: string, secretKey: string, musicianName: string, address: string, shop: string) {

        let addMusicianFunc: AddMusicianFunc = this.russfestService.addMusician();
        const keyPair: IKeyPair = {
            publicKey: Base58.decode(pubKey),
            secretKey: Base58.decode(secretKey)
        }
        
        addMusicianFunc.sign(keyPair);
        addMusicianFunc.name(musicianName);
        addMusicianFunc.transfer(wasmclient.Transfer.iotas(1n))
        addMusicianFunc.onLedgerRequest(true);         
        let response = await addMusicianFunc.post();
        console.log(response);
        
        
        


        

        /* const addMusicianRequest: IOnLedger = {
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
        */
        return null; 
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