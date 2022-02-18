import internal from "stream";


export class ShopStatistics {
    public shopName: string;
    public musician: string
    public earnings: number;
    public producedProducts: number;
    public soldProducts: number;
    public maxProductionSteps: number;

    public productTemplates: StatisticsProductTemplate[];
    public production: Map<number, StatisticsProduct[]>;

    constructor(shopName: string, musician: string, earnings: number, producedProducts: number, soldProducts: number, maxProductionSteps: number, productTemplates: StatisticsProductTemplate[], production: StatisticsProduct[]) {
        this.shopName = shopName;
        this.musician = musician;
        this.earnings = earnings;
        this.producedProducts = producedProducts;
        this.soldProducts = soldProducts;
        this.maxProductionSteps = maxProductionSteps;
        this.productTemplates = productTemplates;
        this.production = new Map();
        for (let product of production) {
            let productionStep = product.productionStep;
            let productionStepArray = this.production.get(productionStep);
            if (productionStepArray === undefined) {
                productionStepArray = [];
            }
            productionStepArray.push(product);

            this.production.set(productionStep, productionStepArray)
        }




    }

    toJson() {

        let productionsJson = {};
        this.production.forEach((value, key) => {
            productionsJson[key] = value;
        });


        let _json = {
            shopName: this.shopName,
            musician: this.musician,
            earnings: this.earnings,
            producedProducts: this.producedProducts,
            maxProductionSteps: this.maxProductionSteps,
            soldProducts: this.soldProducts,
            productTemplates: this.productTemplates,
            production: productionsJson,
        }

        return _json;
    }

}

export class StatisticsProductTemplate {
    public shopName: string;
    public musician: string;
    public price: number;
    public productType: string;

    constructor(shopname: string, musician: string, price: number, productType: string) {
        this.shopName = shopname;
        this.musician = musician;
        this.price = price;
        this.productType = productType;
    }

    toJson() {
        return {
            shopName: this.shopName,
            musician: this.musician,
            price: this.price,
            productType: this.productType
        }
    }
}

export class StatisticsProduct {
    public id: string;
    public productType: string;
    public musician: string;
    public price: number;
    public timestamp: string;
    public productionStep: number;
    public shopName: string;

    constructor(id: bigint, productType: string, musician: string, price: number, timestamp: bigint, productionStep: number, shopname: string,) {
        this.id = id.toString();
        this.productType = productType;
        this.musician = musician;
        this.price = price;
        this.timestamp = timestamp.toString();
        this.productionStep = productionStep;
        this.shopName = shopname;

    }

    toJson() {
        return {
            id: this.id,
            productType: this.productType,
            musician: this.musician,
            price: this.price,
            timestamp: this.timestamp,
            productionStep: this.productionStep,
            shopName: this.shopName,
        }
    }

}