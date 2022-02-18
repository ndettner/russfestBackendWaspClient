import * as wasmclient from "../wasmclient/index";


export class Musician {

    public musicianName: string
    public shopName: string

    constructor(musicianName: string, shopName: string) {
        this.musicianName = musicianName;
        this.shopName = shopName;

    }

    static fromBytes(bytes: wasmclient.Bytes): Musician {
        let decoder = new MusicianDecoder()
        if (bytes.length != 1) {
            return decoder.decodeMusician(bytes);
        }
    }
}

export class MusicianDecoder extends wasmclient.Decoder {
    decodeMusician(bytes: wasmclient.Bytes): Musician {
        bytes = bytes.slice(1);

        let last_index = bytes.findIndex((item) => item <= 31);

        let musicianName: string = this.toString(bytes.slice(0, last_index));


        bytes = bytes.slice(last_index + 1)
        let shopName: string = this.toString(bytes);

        return new Musician(
            musicianName = musicianName.toString(),
            shopName = shopName
        )
    }
}