export class MerchProduct {
    public shopName: string;
    public musician: string;
    public price: number;
    public stock: number;
    public productType: string;

    constructor(shopname: string, musician: string, price: number, stock: number, productType: string) {
        this.shopName = shopname;
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
}