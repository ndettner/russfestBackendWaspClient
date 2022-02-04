import * as wasmclient from "../wasmclient/index";
import { Buffer } from "../wasmclient/buffer";
import { Decoder } from "../wasmclient";

export class Shop {

    public shopName: string
    public musicianName: string
    public fee: bigint
    public shopOwner: wasmclient.AgentID
    public SCAddress: wasmclient.AgentID
    public isRegistered: string
    public shopHName: wasmclient.Hname

    constructor(shopname: string, musicianName: string, fee: bigint, shopOwner: wasmclient.AgentID, SCAddress: wasmclient.AgentID, isRegistered: string, shopHName: wasmclient.Hname) {
        this.shopName = shopname;
        this.musicianName = musicianName;
        this.fee = fee;
        this.shopOwner = shopOwner;
        this.SCAddress = SCAddress;
        this.isRegistered = isRegistered;
        this.shopHName = shopHName;
    }

    static fromBytes(bytes: Buffer): Shop {
        console.log("Buffer lenght");
        console.log(bytes.length);


        let decoder = new ShopDecoder();
        return decoder.decodeShop(bytes);
    }
}

export class ShopDecoder extends wasmclient.Decoder {
    decodeShop(bytes: Buffer): Shop {
        let first_index = 0;
        let last_index = wasmclient.TYPE_SIZES[wasmclient.TYPE_ADDRESS];
        let shopName: string = this.toString(bytes.slice(first_index, last_index));

        first_index = last_index;
        last_index = last_index + wasmclient.TYPE_SIZES[wasmclient.TYPE_ADDRESS];
        let musicianName: string = this.toString(bytes.slice(first_index, last_index));

        first_index = last_index;
        last_index = last_index + wasmclient.TYPE_SIZES[wasmclient.TYPE_INT64];
        let fee: bigint = this.toInt64(bytes.slice(first_index, last_index));

        first_index = last_index;
        last_index = last_index + wasmclient.TYPE_SIZES[wasmclient.TYPE_AGENT_ID]
        let shopOwner: wasmclient.AgentID = this.toAgentID(bytes.slice(first_index, last_index));

        first_index = last_index;
        last_index = last_index + wasmclient.TYPE_SIZES[wasmclient.TYPE_AGENT_ID];
        let ScAddres: wasmclient.AgentID = this.toAgentID(bytes.slice(first_index, last_index));

        first_index = last_index;
        last_index = last_index + wasmclient.TYPE_SIZES[wasmclient.TYPE_STRING];
        let isRegistered: string = this.toString(bytes.slice(first_index, last_index))

        first_index = last_index;
        last_index = last_index + wasmclient.TYPE_SIZES[wasmclient.TYPE_HNAME];
        let shopHname: wasmclient.Hname = this.toHname(bytes.slice(first_index, last_index))

        return new Shop(
            shopName = shopName,
            musicianName = musicianName,
            fee = fee,
            shopOwner = shopOwner,
            ScAddres = ScAddres,
            isRegistered = isRegistered,
            shopHname = shopHname
        )

    }
}
