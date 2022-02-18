import { WalletService } from "./wallet.service";
import { env } from "process";
import { AcceptShopFunc, AddMusicianFunc, BuyMerchFunc, CancelShopRequestFunc, DenyShopFunc, GetAllOpenShopRequestsResults, GetAllOpenShopRequestsView, GetErrorMessagesViewResults, GetErrorMessagesViewView, GetMusiciansResults, GetMusiciansView, GetMusiciansWithoutShopResults, GetMusiciansWithoutShopView, RequestShopLicenceFunc, RussfestService, SetOwnerFunc, TestViewSingleView, TestViewView, UpdateDeniedShopRequestFunc } from "../client";
import * as wasmclient from "../wasmclient"
import { SeedKeyPair } from "../controllers/festival.controller";
import { getAgentId } from "../wasmclient/crypto";
import { merchShop } from "../model/merchShop";
import { MerchProduct } from "../model/merchProduct";
import { Shop } from "../model/shop";
import { ShopStatistics, StatisticsProduct, StatisticsProductTemplate } from "../model/shopStatistics";
import { Musician } from "../model/musician";


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



    async testSingleString() {
        let singleTestView: TestViewSingleView = this.russfestService.testViewSingle();
        let call = await singleTestView.call()

        return call.singeString()
    }


    async testRequest(shopName: String) {
        let testView: TestViewView = this.russfestService.testView();
        let call = await testView.call();

        call.testString();
        console.log("TEST")
        console.log(call.testString()[0]);


        return call.testString();


    }


    async getShopStatistics(seedKeyPair: SeedKeyPair, shopName: string) {

        try {
            let statistics: ShopStatistics = await this.fakeShopStatistics();
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

    async shopOwnerAddTemplate(seedKeyPair: SeedKeyPair, shopName: string, musician: string, price: bigint, productType: string) {

    }










    async getMerchProducts(shopName: string): Promise<MerchProduct[]> {



        let getSpecifiedProducts = this.russfestService.getSpecificProducts();
        getSpecifiedProducts.shopName(shopName)
        let result = await getSpecifiedProducts.call()



        /* 
        let merchProducts = [];

        merchProducts = this.fakeMerchProducts(shopName);
 */
        return result.products();
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

        try {
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

            let getErrorMessage = await this.getErrorMessage(seedKeyPair, response);
            return getErrorMessage


        } catch (error) {
            console.log(error);
            throw new Error("Update Shop Request not succseful");
        }

    }

    async cancelShopRequest(seedKeyPair: SeedKeyPair, shopName: string) {

        try {
            this.waspclient.configuration.seed = seedKeyPair.seed;
            let cancelShopRequestFunc: CancelShopRequestFunc = this.russfestService.cancelShopRequest()
            cancelShopRequestFunc.sign(seedKeyPair.keyPair)
            cancelShopRequestFunc.name(shopName)
            cancelShopRequestFunc.transfer(wasmclient.Transfer.iotas(1n))
            cancelShopRequestFunc.onLedgerRequest(false)
            let response = await cancelShopRequestFunc.post();

            let getErrorMessage = await this.getErrorMessage(seedKeyPair, response);


            return getErrorMessage

        } catch (error) {
            console.log(error);
            throw new Error("Cancel Shop Request not succseful");
        }

    }

    async requestShopLicence(seedKeyPair: SeedKeyPair, shopName: any, fee: bigint, musicianName: any, hName: number) {

        try {
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

            await this.russfestService.waitRequest(response)

            let getErrorMessage = await this.getErrorMessage(seedKeyPair, response);
            return getErrorMessage;

        } catch (error) {
            throw new Error("Request not successful");

        }

    }


    async acceptShop(seedKeyPair: SeedKeyPair, shopName: string) {
        try {

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
        } catch (error) {
            console.log(error);
            throw new Error("Accet Shop Request not succesful");
        }

    }

    async denyShop(seedKeyPair: SeedKeyPair, shopName: string) {

        try {
            this.waspclient.configuration.seed = seedKeyPair.seed
            let denyShopFunc: DenyShopFunc = this.russfestService.denyShop();
            denyShopFunc.sign(seedKeyPair.keyPair)
            denyShopFunc.shopName(shopName)
            denyShopFunc.transfer(wasmclient.Transfer.iotas(1n))
            denyShopFunc.onLedgerRequest(false)
            let response = await denyShopFunc.post();

            await this.russfestService.waitRequest(response)

            let errorResult = await this.getErrorMessage(seedKeyPair, response)

            return errorResult
        } catch (error) {
            console.log(error);
            throw new Error("Deny Shop Request not Succesfull");

        }


    }






    public async addMusician(seedKeyPair: SeedKeyPair, musicianName: string, shop: string): Promise<string> {
        this.waspclient.configuration.seed = seedKeyPair.seed;

        let addMusicianFunc: AddMusicianFunc = this.russfestService.addMusician();

        addMusicianFunc.sign(seedKeyPair.keyPair);
        addMusicianFunc.name(musicianName);
        addMusicianFunc.transfer(wasmclient.Transfer.iotas(1n))
        addMusicianFunc.onLedgerRequest(false);


        if (!typeof shop === undefined) {
            addMusicianFunc.shop(shop)
        }
        try {

            let response = await addMusicianFunc.post();

            await this.russfestService.waitRequest(response)

            let getErrorMessage = await this.getErrorMessage(seedKeyPair, response);
            return getErrorMessage;

        } catch (error) {
            console.log(error);

            return error

        }

    }

    /////////////////////////////// VIEWS //////////////////////////////////////////

    private async getErrorMessage(seedKeyPair: SeedKeyPair, requestID: string): Promise<string> {
        this.waspclient.configuration.seed = seedKeyPair.seed;

        let getErrorMessage: GetErrorMessagesViewView = this.russfestService.getErrorMessagesView();
        getErrorMessage.requestID(requestID);
        let result: GetErrorMessagesViewResults = await getErrorMessage.call();

        return result.errorMessage();

    }


    public async getAllOpenShops(): Promise<Shop[]> {

        try {
            /* for faking / testing
                this.fakeOpenShop();
            */

            let getAllOpenShopRequest: GetAllOpenShopRequestsView = this.russfestService.getAllOpenShopRequests();
            let result: GetAllOpenShopRequestsResults = await getAllOpenShopRequest.call();
            console.log("TEST");

            let allOpenRequests: Shop[] = result.openShopRequest()

            console.log(allOpenRequests);
            return allOpenRequests
        } catch (error) {
            throw new Error(error);

        }

    }



    public async getMusicians(): Promise<Musician[]> {

        let getMusicianView: GetMusiciansView = this.russfestService.getMusicians();
        let result: GetMusiciansResults = await getMusicianView.call()
        let musicans: Musician[] = result.musicians();

        return musicans
    }

    async getMusiciansWithoutShop(): Promise<Musician[]> {
        let getMusicianWithoutShopView: GetMusiciansWithoutShopView = this.russfestService.getMusiciansWithoutShop();
        let result: GetMusiciansWithoutShopResults = await getMusicianWithoutShopView.call()
        let musicans: Musician[] = result.musiciansWithoutShop()

        return musicans
    }

    async getShopOwnerRequests(seedKeyPair: SeedKeyPair): Promise<[Shop[], Shop[]]> {

        try {
            let getShopOwnerRequestView = this.russfestService.getOpenShopRequest()
            getShopOwnerRequestView.shopOwner(getAgentId(seedKeyPair.keyPair))
            let openRequestResult = await getShopOwnerRequestView.call()
            let openRequests = openRequestResult.openShopRequest()



            let getShopOwnerDeniedRequestView = this.russfestService.getDeniedShopRequests()
            getShopOwnerDeniedRequestView.shopOwner(getAgentId(seedKeyPair.keyPair))
            let deniedRequestResult = await getShopOwnerDeniedRequestView.call()
            let deniedRequest = deniedRequestResult.deniedShopRequests()

            return [openRequests, deniedRequest]
            /* for testing
            let shopRequests = this.fakeShopOwnerRequests();
            */

        } catch (error) {
            console.log(error);

            throw new Error("Get Shop Owner Requests not successful");
        }

    }

    async getMerchShops() {

        try {

            /* for testing 
            let shops = [];
            shops = this.fakeMerchShops();
            */

            let getAllRegisteredShops = this.russfestService.getAllRegisteredShops();
            let registeredShopSResult = await getAllRegisteredShops.call();

            let merchShops = []

            registeredShopSResult.shops().forEach((shop) => merchShops.push(new merchShop(shop.shopName, shop.musicianName)))



            return merchShops


        } catch (error) {
            console.log(error);
            throw new Error("Get Merch Shops not successful");


        }

    }


    async getShopOwnerShops(seedKeyPair: SeedKeyPair) {

        try {
            let getRegisteredShopsFromOwner = this.russfestService.getRegisteredShopsFromOwner()
            getRegisteredShopsFromOwner.shopOwner(getAgentId(seedKeyPair.keyPair))
            let result = await getRegisteredShopsFromOwner.call()

            let shops = []

            result.ownerShops().forEach((shop) => shops.push(shop.toJson()))
            /*  zum testen
                shops = this.fakeMerchShops(); 
            */

            return shops

        } catch (error) {
            console.log(error);
            throw new Error("Get Shop Owner Shops not successful");
        }

    }







    /////////////////////////////////// FAKE/MOCK//////////////////////////////////////////
    public fakeOpenShop(): Shop[] {
        let shopList = [];

        shopList.push(new Shop(
            "Die Ärzte Shop",
            "Die Ärzte",
            25n,
            "TESTOwner",
            "REQUESTING",
            12345
        ).toJson());

        shopList.push(new Shop(
            "Hannes Wader Shop",
            "Hannes Wader",
            25n,
            "TESTOwner",
            "REQUESTING",
            12345).toJson())

        return shopList;

    }


    fakeShopOwnerRequests(): [Shop[], Shop[]] {
        let openRequest = this.fakeOpenShop()
        let deniedRequests: Shop[] = []

        deniedRequests.push(new Shop(
            "SXTN Shop",
            "SXTN",
            33n,
            "TESTOwner",
            "DENIED",
            12345
        ))

        deniedRequests.push(new Shop(
            "SXTN Shop2",
            "SXTN",
            33n,
            "TESTOwner",
            "DENIED",
            12345
        ))

        deniedRequests.push(new Shop(
            "SXTN Shop3",
            "SXTN",
            33n,
            "TESTOwner",
            "DENIED",
            12345
        ))

        return [openRequest, deniedRequests]
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


    async fakeShopStatistics(): Promise<ShopStatistics> {

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



        return new ShopStatistics("ALLIGATOAH SHOP", "ALLIGATOAH", 666, 42, 32, 6, productTemplates, production);
    }


}