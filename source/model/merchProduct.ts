import * as wasmclient from "../wasmclient/index";
import { MusicianDecoder } from "./musician";


export class MerchProduct {
    public shopName: string;
    public musician: string;
    public price: number;
    public stock: number;
    public productType: string;

    constructor(shopName: string, musician: string, price: number, stock: number, productType: string) {
        this.shopName = shopName;
        this.musician = musician;
        this.price = price;
        this.stock = stock;
        this.productType = productType;
    }

    toJson() {
        return {
            shopName: this.shopName,
            musician: this.musician,
            price: this.price,
            stock: this.stock,
            productType: this.productType
        }
    }

    static fromBytes(bytes: wasmclient.Bytes): MerchProduct {
        let decoder = new ProductDecoder()
        if (bytes.length != 1) {
            return decoder.decodeProduct(bytes);

        }
    }



}

export class ProductDecoder extends wasmclient.Decoder {
    decodeProduct(bytes: wasmclient.Bytes): MerchProduct {

        let last_index = bytes.findIndex((item) => item == 0);

        let productType: string = this.toString(bytes.slice(1, last_index))

        bytes = bytes.slice(last_index + 1)
        last_index = bytes.findIndex((item) => item == 0);

        let musician: string = this.toString(bytes.slice(0, last_index))

        bytes = bytes.slice(last_index + 1)
        last_index = bytes.findIndex((item) => item == 0)

        let shopName: string = this.toString(bytes.slice(0, last_index))
        bytes = bytes.slice(last_index + 1)


        let first_index = 0;
        last_index = wasmclient.TYPE_SIZES[wasmclient.TYPE_INT64]
        let price: number = Number(this.toUint64(bytes.slice(first_index, last_index)))

        first_index = last_index
        let stock: number = Number(this.toUint64(bytes.slice(first_index)))

        return new MerchProduct(shopName = shopName, musician = musician,
            price = price,
            stock = stock,
            productType = productType)
    }
}