import { Seed } from "./wasp_client"
import { Buffer } from "./wasp_client/buffer"
import { aleaRNGFactory } from "number-generator";
export class WaspHelpers {


    constructor() {
    }
    // will produce a pseudo-random 32Uint array and returns a Buffer.

    public generateSeed(seed: number): Buffer {

        const array = new Uint32Array(Seed.SEED_SIZE);
        const numberGenerator = aleaRNGFactory(seed);

        for (let index = 0; index < array.length; index++) {
            array[index] = numberGenerator.uInt32();
        }

        return Buffer.from(array);
    }


}