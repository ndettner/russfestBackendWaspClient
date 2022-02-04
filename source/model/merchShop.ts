export class merchShop {
    public shopName: string;
    public musician: string;

    constructor(shopName: string, musician: string) {
        this.shopName = shopName;
        this.musician = musician;
    }

    toJSON() {
        return {
            shopName: this.shopName,
            musician: this.musician
        }
    }
}