// // // src/notifications/notifications.gateway.ts
// // import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
// // import { Server } from 'socket.io';

// // @WebSocketGateway({
// //   cors: {
// //     origin: '*',
// //   },
// // })
// // export class NotificationGateway {
// //   @WebSocketServer()
// //   server: Server;

// //   // Method to emit notification to all connected clients
// //   notifyAllClients(message: string) {
// //     this.server.emit('receiveNotification', { message });
// //   }

// //   // Optional: emit to a specific socket ID or room
// //   notifyUser(userId: string, message: string) {
// //     this.server.to(userId).emit('receiveNotification', { message });
// //   }
// // }




// // notification.gateway.ts
// import {
//   WebSocketGateway,
//   WebSocketServer,
//   OnGatewayConnection,
//   OnGatewayDisconnect,
//   ConnectedSocket,
//   MessageBody,
//   SubscribeMessage,
// } from '@nestjs/websockets';
// import { Server, Socket } from 'socket.io';

// @WebSocketGateway({
//   cors: { origin: '*' },
// })
// export class NotificationGateway
//   implements OnGatewayConnection, OnGatewayDisconnect {
//   @WebSocketServer()
//   server: Server;

//   private users = new Map<string, string>(); // userId -> socketId

//   handleConnection(client: Socket) {
//     console.log('Socket connected:', client.id);
//   }

//   handleDisconnect(client: Socket) {
//     // Remove user on disconnect 
//     for (const [userId, socketId] of this.users.entries()) {
//       if (socketId === client.id) {
//         this.users.delete(userId);
//         break;
//       }
//     }
//     console.log('Socket disconnected:', client.id);
//   }

//   // Client will emit this with their userId after connecting
//   @SubscribeMessage('registerUser')
//   handleRegisterUser(
//     @ConnectedSocket() client: Socket,
//     @MessageBody() userId: string,
//   ) {
//     this.users.set(userId, client.id);
//     console.log(`Registered user ${userId} with socket ${client.id}`);
//   }

//   // Send a message to a specific user
//   notifyUser(userId: string, title: string, message: string) {
//     const socketId = this.users.get(userId);
//     if (socketId) {
//       this.server.to(socketId).emit('receiveNotification', { title, message });
//     } else {
//       console.warn(`User ${userId} not connected`);
//     }
//   }
// }




// notification.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // Store mappings in both directions for efficient lookups
  private users = new Map<string, string>(); // userId -> socketId
  private sockets = new Map<string, string>(); // socketId -> userId

  handleConnection(client: Socket) {
    console.log('Socket connected:', client.id);
  }

  handleDisconnect(client: Socket) {
    // Get the userId from the socket map and then remove both entries
    const userId = this.sockets.get(client.id);
    if (userId) {
      this.users.delete(userId);
      this.sockets.delete(client.id);
      console.log(`User ${userId} disconnected. Stale mapping removed.`);
    }
    console.log('Socket disconnected:', client.id);
  }

  // Client will emit this with their userId after connecting
  @SubscribeMessage('registerUser')
  handleRegisterUser(
    @ConnectedSocket() client: Socket,
    @MessageBody() userId: string,
  ) {
    // Check if the user is already connected with a different socket and disconnect the old one
    const oldSocketId = this.users.get(userId);
    if (oldSocketId && oldSocketId !== client.id) {
      this.server.sockets.sockets.get(oldSocketId)?.disconnect();
    }
    
    // Set new mappings
    this.users.set(userId, client.id);
    this.sockets.set(client.id, userId);

    console.log(`Registered user ${userId} with socket ${client.id}`);
  }

  // Send a message to a specific user
  notifyUser(userId: string, title: string, message: string) {
    const socketId = this.users.get(userId);
    if (socketId) {
      this.server.to(socketId).emit('receiveNotification', { title, message });
    } else {
      console.warn(`User ${userId} not connected or stale socket. Notifying failed.`);
    }
  }
}