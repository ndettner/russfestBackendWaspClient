class HttpException extends Error {
    status: number;
    message: string;
    additionalInfo: any;

    constructor(status: number, message: string, additionalInfo: any) {
        super(message);
        this.status = status;
        this.message = message;
        this.additionalInfo = additionalInfo;
    }
}
export default HttpException;
