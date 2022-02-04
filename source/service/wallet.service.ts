import { Base58, BasicClient, BasicWallet, CallViewResponse, Faucet, IAllowedManaPledgeResponse, IExtendedResponse, IFaucetRequest, IFaucetRequestContext, IKeyPair, IOnLedger, IResponse, ISendTransactionResponse, ITransaction, OnLedger, Seed, Transaction } from "../wasp_client";
import { WaspHelpers } from "../wasp_client_helper";
import { Buffer } from "../wasp_client/buffer"
import ProofOfWork from "../wasp_client/proof_of_work";
import { env } from "process";
import { IFaucetResponse } from "../wasmclient/goshimmer/faucet/faucet_models";

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
            return await this.basicClient.sendFaucetRequest(faucetRequestResult.faucetRequest);

        } catch {
        }



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

    public async sendOnLedgerRequest(keyPair: IKeyPair,
        address: string,
        chainId: string,
        payload: IOnLedger,
        transfer: bigint = 1n,
    ): Promise<ISendTransactionResponse> {
        if (transfer <= 0) {
            transfer = 1n;
        }

        const wallet = new BasicWallet(this.basicClient);

        const unspents = await wallet.getUnspentOutputs(address)
        const consumedOutputs = wallet.determineOutputsToConsume(unspents, transfer);
        const { inputs, consumedFunds } = wallet.buildInputs(consumedOutputs);
        const outputs = wallet.buildOutputs(address, chainId, transfer, consumedFunds);

        const tx: ITransaction = {
            version: 0,
            timestamp: BigInt(Date.now()) * 1000000n,
            aManaPledge: Base58.encode(Buffer.alloc(32)),
            cManaPledge: Base58.encode(Buffer.alloc(32)),
            inputs: inputs,
            outputs: outputs,
            chainId: chainId,
            payload: OnLedger.ToBuffer(payload),
            unlockBlocks: [],
        };


        tx.unlockBlocks = wallet.unlockBlocks(tx, keyPair, address, consumedOutputs, inputs);

        const result = Transaction.bytes(tx);


        const response = await this.basicClient.sendTransaction({
            txn_bytes: result.toString('base64'),
        });

        return response;
    }



    public async callView(chainId: string, contractHName: string, entryPoint: string): Promise<CallViewResponse> {
        const response = this.basicClient.callView(chainId, contractHName, entryPoint)
        return response;
    }


}