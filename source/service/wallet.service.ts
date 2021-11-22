import { Base58, BasicClient, Faucet, IAllowedManaPledgeResponse, IFaucetRequest, IFaucetRequestContext, IKeyPair, Seed } from "../wasp_client";
import { WaspHelpers } from "../wasp_client_helper";
import { Buffer } from "../wasp_client/buffer"
import * as config from "../config.dev";
import { v4 as uuidv4 } from 'uuid';
import ProofOfWork from "../wasp_client/proof_of_work";

export class WalletService {
    private waspHelpers: WaspHelpers;
    private basicClient: BasicClient;

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

    public async requestFaucetFunds(address: string) {
        // getManaPledge this.waspHelpers.
        const manaPledge: IAllowedManaPledgeResponse = await this.waspHelpers.getAllowedManaPledge()

        const allowedManagePledge = manaPledge.accessMana.allowed[0];
        const consenseusManaPledge = manaPledge.consensusMana.allowed[0];

        const body: IFaucetRequest = {
            accessManaPledgeID: allowedManagePledge,
            consensusManaPledgeID: consenseusManaPledge,
            address: address,
            nonce: -1
        };

        const powBuffer = Faucet.ToBuffer(body);

        const faucetRequestResult: IFaucetRequestContext = {
            poWBuffer: powBuffer,
            faucetRequest: body,
        };

        faucetRequestResult.faucetRequest.nonce = ProofOfWork.calculateProofOfWork(12, faucetRequestResult.poWBuffer)

        try {
            await this.waspHelpers.sendFaucetRequest(faucetRequestResult.faucetRequest);
        } catch {
        }

        return faucetRequestResult;


    }

}