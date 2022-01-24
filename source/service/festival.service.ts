import { WalletService } from "./wallet.service";
import { env } from "process";
import { AcceptShopFunc, AddMusicianFunc, BuyMerchFunc, CancelShopRequestFunc, DenyShopFunc, RequestShopLicenceFunc, RussfestService, UpdateDeniedShopRequestFunc } from "../client";
import * as wasmclient from "../wasmclient"
import { SeedKeyPair } from "../controllers/festival.controller";
import { HName } from "../wasp_client";
import * as consts from "../consts";

type ParameterResult = { [key: string]: string };


export class FestivalService {


    private walletService: WalletService;
    private russfestService: RussfestService;
    private waspclient: wasmclient.ServiceClient;

    constructor() {
        this.walletService = new WalletService();
        this.waspclient = new wasmclient.ServiceClient({
            seed: null,
            waspWebSocketUrl: "ws://127.0.0.1:9090",
            waspApiUrl: "159.69.187.49:9090",
            goShimmerApiUrl: env.GOSHIMMERAPI,
            chainId: env.RUSSFEST_CHAIN_ID
        })

        this.russfestService = new RussfestService(this.waspclient)
    }

    async buyMerch(seedKeyPair: SeedKeyPair, shopName: string, musicianName: string, productType: string, price: number) {
        this.waspclient.configuration.seed = seedKeyPair.seed;
        let buyMerchFunc: BuyMerchFunc = this.russfestService.buyMerch()
        buyMerchFunc.sign(seedKeyPair.keyPair)
        buyMerchFunc.musician(musicianName)
        buyMerchFunc.productType(productType)
        buyMerchFunc.shopName(shopName)
        buyMerchFunc.transfer(wasmclient.Transfer.iotas(BigInt(price)))
        buyMerchFunc.onLedgerRequest(false)
        const result = await buyMerchFunc.post();

        return await this.russfestService.waitRequest(result)
    }


    async updateDeniedShopRequest(seedKeyPair: SeedKeyPair, shopName: string, newfee: number, newScAddress: string, shopHname: string) {
        this.waspclient.configuration.seed = seedKeyPair.seed;
        let updateDeniedShopRequestFunc: UpdateDeniedShopRequestFunc = this.russfestService.updateDeniedShopRequest()
        updateDeniedShopRequestFunc.sign(seedKeyPair.keyPair)
        updateDeniedShopRequestFunc.shopName(shopName)

        if (!typeof newfee === undefined) {
            updateDeniedShopRequestFunc.newfee(BigInt(newfee))
        }

        if (!typeof newScAddress === undefined) {
            updateDeniedShopRequestFunc.newSCAdress(newScAddress)
        }

        if (!typeof shopHname === undefined) {
            updateDeniedShopRequestFunc.newHname(parseInt("0x" + shopHname))
        }

        updateDeniedShopRequestFunc.onLedgerRequest(false);
        updateDeniedShopRequestFunc.transfer(wasmclient.Transfer.iotas(1n))
        updateDeniedShopRequestFunc.onLedgerRequest(false)
        let response = await updateDeniedShopRequestFunc.post()

        return await this.russfestService.waitRequest(response)
    }

    async cancelShopRequest(seedKeyPair: SeedKeyPair, shopName: string) {
        this.waspclient.configuration.seed = seedKeyPair.seed;
        let cancelShopRequestFunc: CancelShopRequestFunc = this.russfestService.cancelShopRequest()
        cancelShopRequestFunc.sign(seedKeyPair.keyPair)
        cancelShopRequestFunc.name(shopName)
        cancelShopRequestFunc.transfer(wasmclient.Transfer.iotas(1n))
        cancelShopRequestFunc.onLedgerRequest(false)
        let response = await cancelShopRequestFunc.post();

        return await this.russfestService.waitRequest(response)
    }

    async requestShopLicence(seedKeyPair: SeedKeyPair, shopName: any, fee: bigint, SCAgentID: string, musicianName: any, Hname: number) {
        this.waspclient.configuration.seed = seedKeyPair.seed;
        let requestShopLicenceFunc: RequestShopLicenceFunc = this.russfestService.requestShopLicence();
        requestShopLicenceFunc.sign(seedKeyPair.keyPair)
        requestShopLicenceFunc.fee(fee)
        requestShopLicenceFunc.musicianName(musicianName)
        requestShopLicenceFunc.name(shopName)
        requestShopLicenceFunc.sCAddress(SCAgentID)
        requestShopLicenceFunc.shopHname(Hname)
        requestShopLicenceFunc.transfer(wasmclient.Transfer.iotas(1n))
        requestShopLicenceFunc.onLedgerRequest(false)
        let response = await requestShopLicenceFunc.post()

        return await this.russfestService.waitRequest(response)
    }

    async acceptShop(seedKeyPair: SeedKeyPair, shopName: string) {
        this.waspclient.configuration.seed = seedKeyPair.seed;
        let acceptShopFunc: AcceptShopFunc = this.russfestService.acceptShop();
        acceptShopFunc.sign(seedKeyPair.keyPair)
        acceptShopFunc.shopName(shopName)
        acceptShopFunc.transfer(wasmclient.Transfer.iotas(1n))
        acceptShopFunc.onLedgerRequest(false)
        let response = await acceptShopFunc.post();

        return await this.russfestService.waitRequest(response)
    }

    async denyShop(seedKeyPair: SeedKeyPair, shopName: string) {
        this.waspclient.configuration.seed = seedKeyPair.seed
        let denyShopFunc: DenyShopFunc = this.russfestService.denyShop();
        denyShopFunc.sign(seedKeyPair.keyPair)
        denyShopFunc.shopName(shopName)
        denyShopFunc.transfer(wasmclient.Transfer.iotas(1n))
        denyShopFunc.onLedgerRequest(false)
        let result = await denyShopFunc.post();

        return await this.russfestService.waitRequest(result)

    }



    public async addMusician(seedKeyPair: SeedKeyPair, musicianName: string, address: string, shop: string) {
        console.log(seedKeyPair)
        this.waspclient.configuration.seed = seedKeyPair.seed;

        let addMusicianFunc: AddMusicianFunc = this.russfestService.addMusician();

        addMusicianFunc.sign(seedKeyPair.keyPair);
        addMusicianFunc.name(musicianName);
        addMusicianFunc.transfer(wasmclient.Transfer.iotas(1n))
        addMusicianFunc.onLedgerRequest(false);
        if (!typeof shop === undefined) {
            addMusicianFunc.shop(shop)
        }

        let response = await addMusicianFunc.post();

        await this.russfestService.waitRequest(response)






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