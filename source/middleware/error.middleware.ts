import express, {Request, Response } from "express";
import HttpException from "../exceptions/HttpException";


function errorMiddleware(error: HttpException, request: Request, response : Response, next: express.NextFunction) {
    const status = error.status || 500;
    const message = error.message || "Something went wrong";
    const additionalInfo = error.additionalInfo;
    response
    .status(status)
    .send({
        status,
        message,
        additionalInfo
    })
} export default errorMiddleware

