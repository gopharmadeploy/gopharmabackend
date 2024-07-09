import {
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Socket, Server } from 'socket.io';

@WebSocketGateway({
    cors: {
        origin: 'http://localhost:3001', // URL de tu frontend
        methods: ['GET', 'POST'],
        credentials: true,
    },
})
export class SocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;
    private logger: Logger = new Logger('SocketGateway');

    afterInit(server: Server) {
        this.logger.log('Init');
        console.log('INICIÓ EL SERVERRRR');
    }

    handleConnection(client: Socket, ...args: any[]) {
        this.logger.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('message')
    handleMessage(client: Socket, payload: string): string {
        this.logger.log('Received message:', payload);
        return 'Hello from NestJS';
    }
}
