import { Socket } from "socket.io";
import jwt from 'jsonwebtoken';

export interface CustomSocket extends Socket {
    decoded?: any;
}

export default (socket: CustomSocket, next: (err?: any) => void) => {
    if (socket.handshake.query && socket.handshake.query.token) {
        jwt.verify(
            socket.handshake.query.token as string,
            process.env.JWT_SECRET!,
            (err, decoded) => {
                if (err) return next(new Error('Authentication error'));
                socket.decoded = decoded as string;
                next();
            }
        );

    } else {
        next(new Error('Authentication error'));
    }
}