import { WalletService } from "./wallet.service";
import { env } from "process";
import { AcceptShopFunc, AddMusicianFunc, BuyMerchFunc, CancelShopRequestFunc, DenyShopFunc, GetErrorMessagesViewResults, GetErrorMessagesViewView, RequestShopLicenceFunc, RussfestService, SetOwnerFunc, UpdateDeniedShopRequestFunc } from "../client";
import * as wasmclient from "../wasmclient"
import { SeedKeyPair } from "../controllers/festival.controller";
import { HName } from "../wasp_client";
import * as consts from "../consts";
import { getAgentId } from "../wasmclient/crypto";
import { merchShop } from "../model/merchShop";
import { MerchProduct } from "../model/merchProduct";
import { Shop } from "../model/shop";
import { ShopStatistics, StatisticsProduct, StatisticsProductTemplate } from "../model/shopStatistics";

type ParameterResult = { [key: string]: string };


export class FestivalService {

    async getShopStatistics(seedKeyPair: SeedKeyPair, shopName: String) {

        try {
            let statistics: ShopStatistics = this.fakeShopStatistics();
            return statistics;
        } catch (e) {
            throw e;
        }

        /*  Should return a shop statistic with:
            -shopName 
            -statistics
            -- earnings
            -- produced products
            -- sold products
    
            -- active product templates
            -- production
            --- 1
            --- 2
            --- ...
            --- n
            */

    }


    fakeShopStatistics(): ShopStatistics {

        let productTemplates = []

        productTemplates.push(new StatisticsProductTemplate("ALLIGATOAH SHOP", "Alligatoah", 25, "SHIRT"))
        productTemplates.push(new StatisticsProductTemplate("ALLIGATOAH SHOP", "Alligatoah", 10, "CAP"))
        productTemplates.push(new StatisticsProductTemplate("ALLIGATOAH SHOP", "Alligatoah", 33, "VINYL"))

        let production = []
        production.push(new StatisticsProduct(1n, "SHIRT", "Alligatoah", 25, 20220211n, 0, "ALLIGATOAH SHOP"))
        production.push(new StatisticsProduct(2n, "CAP", "Alligatoah", 10, 20220212n, 2, "ALLIGATOAH SHOP"))
        production.push(new StatisticsProduct(3n, "SHIRT", "Alligatoah", 25, 20220213n, 1, "ALLIGATOAH SHOP"))
        production.push(new StatisticsProduct(4n, "CAP", "Alligatoah", 10, 20220214n, 2, "ALLIGATOAH SHOP"))
        production.push(new StatisticsProduct(5n, "VINYL", "Alligatoah", 33, 20220215n, 3, "ALLIGATOAH SHOP"))
        production.push(new StatisticsProduct(6n, "SHIRT", "Alligatoah", 25, 20220216n, 4, "ALLIGATOAH SHOP"))



        return new ShopStatistics("ALLIGATOAH SHOP", 666, 42, 32, productTemplates, production);
    }





    async getShopOwnerShops(seedKeyPair: SeedKeyPair) {
        console.log(getAgentId(seedKeyPair.keyPair));

        let shops = [];


        shops = this.fakeMerchShops();

        return shops;
    }


    async getShopOwnerRequests(seedKeyPair: SeedKeyPair) {
        console.log(getAgentId(seedKeyPair.keyPair));
        let openRequest = await this.fakeOpenShop();

        let deniedRequests = [];

        deniedRequests.push(new Shop(
            "SXTN Shop",
            "SXTN",
            33n,
            "TESTOwner",
            "TestSCADDRESS",
            "DENIED",
            12345
        ).toJson());

        return [openRequest, deniedRequests];
    }



    async getMerchProducts(shopName: string) {
        let merchProducts = [];

        merchProducts = this.fakeMerchProducts(shopName);

        return merchProducts;
    }



    private fakeMerchProducts(shopname: string) {

        let fakeProducts = []
        fakeProducts.push(new MerchProduct(
            "Alligatoah Shop",
            "Alligatoah",
            25,
            3,
            "SHIRT"
        ));

        fakeProducts.push(new MerchProduct(
            "Alligatoah Shop",
            "Alligatoah",
            33,
            0,
            "VINYL"
        ))

        fakeProducts.push(new MerchProduct(
            "Alligatoah Shop",
            "Alligatoah",
            10,
            1,
            "CAP"
        ))

        fakeProducts.push(new MerchProduct(
            "KIZ Shop",
            "KIZ",
            50,
            7,
            "HOODIE"
        ))

        let merchProducts = fakeProducts.filter((product: MerchProduct) => {
            return product.shopName === shopname;
        })



        return merchProducts;
    };

    async getMerchShops() {
        let shops = [];

        shops = this.fakeMerchShops();

        return shops


    }

    private fakeMerchShops() {
        let shops = [];

        let alligatoah = new merchShop("Alligatoah Shop", "Alligatoah")
        let kiz = new merchShop("KIZ Shop", "KIZ")
        let sia = new merchShop("SIA Shop", "SIA")

        shops.push(alligatoah.toJSON())
        shops.push(kiz.toJSON())
        shops.push(sia.toJSON())

        return shops;
    }




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


    async setOwner(seedKeyPair: SeedKeyPair) {
        this.waspclient.configuration.seed = seedKeyPair.seed;
        let setOwnerFunc: SetOwnerFunc = this.russfestService.setOwner()
        setOwnerFunc.sign(seedKeyPair.keyPair)
        setOwnerFunc.newOwner(getAgentId(seedKeyPair.keyPair))
        setOwnerFunc.onLedgerRequest(false)
        setOwnerFunc.transfer(wasmclient.Transfer.iotas(1n))
        const result = await setOwnerFunc.post();


        return await this.russfestService.waitRequest(result);

    }

    async sentIOTAtoChain(seedKeyPair: SeedKeyPair) {
        this.waspclient.configuration.seed = seedKeyPair.seed;
        const agentID: wasmclient.AgentID = getAgentId(seedKeyPair.keyPair);

        let result = await this.waspclient.goShimmerClient.depositIOTAToAccountInChain(seedKeyPair.keyPair, agentID, 2n)
        return result
    }

    async buyMerch(seedKeyPair: SeedKeyPair, shopName: string, musicianName: string, productType: string, price: number): Promise<string> {
        this.waspclient.configuration.seed = seedKeyPair.seed;
        let buyMerchFunc: BuyMerchFunc = this.russfestService.buyMerch()
        buyMerchFunc.sign(seedKeyPair.keyPair)
        buyMerchFunc.musician(musicianName)
        buyMerchFunc.productType(productType)
        buyMerchFunc.shopName(shopName)
        buyMerchFunc.transfer(wasmclient.Transfer.iotas(BigInt(price)))
        buyMerchFunc.onLedgerRequest(false)
        const result = await buyMerchFunc.post();

        this.russfestService.waitRequest(result)

        let errorMessage = await this.getErrorMessage(seedKeyPair, result);

        return errorMessage;
    }


    async updateDeniedShopRequest(seedKeyPair: SeedKeyPair, shopName: string, newfee: number, shopHname: string) {
        this.waspclient.configuration.seed = seedKeyPair.seed;
        let updateDeniedShopRequestFunc: UpdateDeniedShopRequestFunc = this.russfestService.updateDeniedShopRequest()
        updateDeniedShopRequestFunc.sign(seedKeyPair.keyPair)
        updateDeniedShopRequestFunc.shopName(shopName)

        if (!typeof newfee === undefined) {
            updateDeniedShopRequestFunc.newfee(BigInt(newfee))
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

    async requestShopLicence(seedKeyPair: SeedKeyPair, shopName: any, fee: bigint, musicianName: any, hName: number) {
        this.waspclient.configuration.seed = seedKeyPair.seed;
        let requestShopLicenceFunc: RequestShopLicenceFunc = this.russfestService.requestShopLicence();
        requestShopLicenceFunc.sign(seedKeyPair.keyPair)
        requestShopLicenceFunc.fee(fee)
        requestShopLicenceFunc.musicianName(musicianName)
        requestShopLicenceFunc.name(shopName)
        requestShopLicenceFunc.shopHname(hName)
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

        await this.russfestService.waitRequest(response)

        let errorResult = await this.getErrorMessage(seedKeyPair, response)

        return errorResult;

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






    public async addMusician(seedKeyPair: SeedKeyPair, musicianName: string, shop: string): Promise<string> {
        this.waspclient.configuration.seed = seedKeyPair.seed;

        let addMusicianFunc: AddMusicianFunc = this.russfestService.addMusician();

        addMusicianFunc.sign(seedKeyPair.keyPair);
        addMusicianFunc.name(musicianName);
        addMusicianFunc.transfer(wasmclient.Transfer.iotas(1n))
        addMusicianFunc.onLedgerRequest(false);

        // TODO try catch block

        if (!typeof shop === undefined) {
            addMusicianFunc.shop(shop)
        }

        let response = await addMusicianFunc.post();

        await this.russfestService.waitRequest(response)

        let getErrorMessage = await this.getErrorMessage(seedKeyPair, response);







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
        return getErrorMessage;
    }

    /////////////////////////////// VIEWS //////////////////////////////////////////

    private async getErrorMessage(seedKeyPair: SeedKeyPair, requestID: string): Promise<string> {
        this.waspclient.configuration.seed = seedKeyPair.seed;

        let getErrorMessage: GetErrorMessagesViewView = this.russfestService.getErrorMessagesView();
        getErrorMessage.requestID(requestID);
        let result: GetErrorMessagesViewResults = await getErrorMessage.call();

        return result.errorMessage();

    }


    public async getAllOpenShops() {

        this.fakeOpenShop();

        /*   let getAllOpenShopRequest: GetAllOpenShopRequestsView = this.russfestService.getAllOpenShopRequests();
          let result: GetAllOpenShopRequestsResults = await getAllOpenShopRequest.call();
     
          // TODO testen 
          // Eigentlich sollte das ein Array sein???
          console.log(result.openShopRequest()); */
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

        return;
    }

    public async fakeOpenShop(): Promise<Shop[]> {
        let shopList = [];

        shopList.push(new Shop(
            "Die Ärzte Shop",
            "Die Ärzte",
            25n,
            "TESTOwner",
            "TestSCADDRESS",
            "REQUESTING",
            12345
        ).toJson());

        shopList.push(new Shop(
            "Hannes Wader Shop",
            "Hannes Wader",
            25n,
            "TESTOwner",
            "TestSCADDRESS",
            "REQUESTING",
            12345).toJson())

        return shopList;

    }
}


