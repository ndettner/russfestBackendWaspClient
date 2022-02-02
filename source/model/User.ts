
export class User {
    public username: string;

    public password: string;

    public role: string;

    public walletID: string;

    public skipWallet: boolean;

    constructor(username: string, password: string, role: string, walletId: string, skipWallet: boolean) {
        this.username = username;
        this.password = password;
        this.role = role;
        this.walletID = walletId;
        this.skipWallet = skipWallet;
    }

    toJSON() {
        return {
            username: this.username,
            password: this.password,
            role: this.role,
            walletId: this.walletID,
            skipWallet: this.walletID,
        }
    }

    static fromJSON(json: any) {
        return new User(
            json.username,
            json.password,
            json.role,
            json.walletID,
            json.skipWallet)
    }


}

