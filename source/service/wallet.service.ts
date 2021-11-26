import { Base58, BasicClient, Faucet, IAllowedManaPledgeResponse, IFaucetRequest, IFaucetRequestContext, IKeyPair, Seed } from "../wasp_client";
import { WaspHelpers } from "../wasp_client_helper";
import { Buffer } from "../wasp_client/buffer"
import { v4 as uuidv4 } from 'uuid';
import ProofOfWork from "../wasp_client/proof_of_work";

export class WalletService {
    private waspHelpers: WaspHelpers;
    private basicClient: BasicClient;

    constructor() {
        this.waspHelpers = new WaspHelpers();
        this.basicClient = new BasicClient({
            GoShimmerAPIUrl: process.env.GOSHIMMERAPI,
            WaspAPIUrl: process.env.WASPAPI,
        })
    }

    public validateSeed(walletString: string): boolean {
        return Seed.isValid(walletString);
    }

    public generateNewSeed(userNameIndex: number): Buffer {
        let newSeed: Buffer = this.waspHelpers.generateSeed(userNameIndex);
        while (!this.validateSeed(Base58.encode(newSeed))) {
            newSeed = this.waspHelpers.generateSeed(userNameIndex + 1)
        }
        return newSeed;
    }

    public generateAddress(newSeed: Buffer, userNameIndex: number): string {
        return Seed.generateAddress(newSeed, userNameIndex);
    }

    public generateKeyPair(newSeed: Buffer, userNameIndex: number): IKeyPair {
        return Seed.generateKeyPair(newSeed, userNameIndex);
    }

    public async requestFaucetFunds(address: string) {
        const manaPledge: IAllowedManaPledgeResponse = await this.basicClient.getAllowedManaPledge();

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
            await this.basicClient.sendFaucetRequest(faucetRequestResult.faucetRequest);
        } catch {
        }

        return faucetRequestResult;


    }

    public async getBalance(address: string, color: string): Promise<bigint> {
        const unspents = await this.basicClient.unspentOutputs({ addresses: [address] });
        const currentUnspent = unspents.unspentOutputs.find((x) => x.address.base58 == address);

        const balance = currentUnspent.outputs
            .filter(
                (o) =>
                    ['ExtendedLockedOutputType', 'SigLockedColoredOutputType'].includes(o.output.type) &&
                    typeof o.output.output.balances[color] != 'undefined',
            )
            .map((uid) => uid.output.output.balances)
            .reduce((balance: bigint, output) => (balance += BigInt(output[color])), BigInt(0));

        return balance;

    }

}