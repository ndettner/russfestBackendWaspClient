import { Base58, BasicClient, Faucet, IAllowedManaPledgeResponse, IFaucetRequest, IFaucetRequestContext, IKeyPair, Seed } from "../wasp_client";
import { WaspHelpers } from "../wasp_client_helper";
import { Buffer } from "../wasp_client/buffer"
import * as config from "../config.dev";

export class WalletService {
    private waspHelpers: WaspHelpers;
    private basicClient: BasicClient

    constructor() {
        this.waspHelpers = new WaspHelpers();
        this.basicClient = new BasicClient({
            GoShimmerAPIUrl: config.goshimmerApiUrl,
            WaspAPIUrl: config.waspApiUrl,
        });
    }



    public validateWallet(walletString: string): boolean {
        return Seed.isValid(walletString);
    }

    public generateNewSeed(userNameIndex: number): Buffer {
        const newSeed: Buffer = this.waspHelpers.generateSeed(userNameIndex);
        if (this.validateWallet(Base58.encode(newSeed))) {


            //const faucetRequestResult = walletService.getFaucetRequest(get(address))
            // faucetRequestResult.faucetRequest.nonce = await powManager.requestProofOfWork(12, faucetRequestResult.poWBuffer);
            // look up how other clients handle nonce bzw. PoW look inside WebWorker da steht proof of work
            return newSeed;
        }
        else {
            return;
        }
    }

    public generateAddress(newSeed: Buffer, userNameIndex: number): string {
        return Seed.generateAddress(newSeed, userNameIndex);
    }

    generateKeyPair(newSeed: Buffer, userNameIndex: number): IKeyPair {
        return Seed.generateKeyPair(newSeed, userNameIndex);
    }

    public async requestFaucetFunds(walletSeed: string, address: string, keyPair: IKeyPair) {
        // getManaPledge this.waspHelpers.
        const manaPledge: IAllowedManaPledgeResponse = await this.basicClient.getAllowedManaPledge()

        const allowedManagePledge = manaPledge.accessMana.allowed[0];
        const consenseusManaPledge = manaPledge.consensusMana.allowed[0];

        const body: IFaucetRequest = {
            accessManaPledgeID: allowedManagePledge,
            consensusManaPledgeID: consenseusManaPledge,
            address: address,
            nonce: -1
        };

        const powBuffer = Faucet.ToBuffer(body);

        const result: IFaucetRequestContext = {
            poWBuffer: powBuffer,
            faucetRequest: body,
        };

        return result;


    }
}