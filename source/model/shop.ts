import * as wasmclient from "../wasmclient/index";
import { Buffer } from "../wasmclient/buffer";
import { Decoder } from "../wasmclient";
import { HName } from "../wasp_client";

export class Shop {

    public shopName: string
    public musicianName: string
    public fee: bigint
    public shopOwner: wasmclient.AgentID
    public isRegistered: string
    public shopHName: wasmclient.Hname

    constructor(shopname: string, musicianName: string, fee: bigint, shopOwner: wasmclient.AgentID, isRegistered: string, shopHName: wasmclient.Hname) {
        this.shopName = shopname;
        this.musicianName = musicianName;
        this.fee = fee;
        this.shopOwner = shopOwner;
        this.isRegistered = isRegistered;
        this.shopHName = shopHName;
    }

    static fromBytes(bytes: Buffer): Shop {
        console.log("Buffer lenght");
        console.log(bytes.length);


        let decoder = new ShopDecoder();
        if (bytes.length != 1) {
            return decoder.decodeShop(bytes);
        }
    }

    toJson() {
        return {
            shopName: this.shopName,
            musicianName: this.musicianName,
            fee: this.fee.toString(),
            shopOwner: this.shopOwner,
            isRegistered: this.isRegistered,
            shopHname: this.shopHName
        }
    }
}

export class ShopDecoder extends wasmclient.Decoder {
    decodeShop(bytes: wasmclient.Bytes): Shop {
        let fee = BigInt(bytes[0])

        bytes = bytes.slice(2);
        let first_index = 0;
        let last_index = bytes.findIndex((item) => item <= 31 || item > 90);
        let isRegistered: string = this.toString(bytes.slice(first_index, last_index));

        bytes = bytes.slice(last_index + 1)

        // TODO not working
        last_index = bytes.findIndex((item) => item <= 31 || item > 90);
        let musicianName: string = this.toString(bytes.slice(0, last_index));
        bytes = bytes.slice(last_index)


        last_index = wasmclient.TYPE_SIZES[wasmclient.TYPE_HNAME];
        let shopHname: wasmclient.Hname = this.toHname(bytes.slice(0, last_index))
        bytes = bytes.slice(last_index + 1)

        last_index = bytes.findIndex((item) => item <= 31 || item > 90);
        let shopName: string = this.toString(bytes.slice(0, last_index))
        bytes = bytes.slice(last_index)

        let shopOwner: wasmclient.AgentID = this.toAgentID(bytes);
        bytes = bytes.slice(last_index)








        return new Shop(
            shopName,
            musicianName,
            fee,
            shopOwner,
            isRegistered,
            shopHname
        )

    }
}
