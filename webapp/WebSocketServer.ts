// import { Server } from 'socket.io';
// import { fetchLatestData } from './src/lib/server/queries/dashboard/dataFrame';

// export const webSocketServer = {
// 	name:'webSocketServer',
// 	configureServer(server:any) {
// 		const io = new Server(server.httpServer);

// 		io.on('connection', (socket) => {
// 			socket.on("newData", (message) => {	
// 				let update = fetchLatestData();
// 				io.emit("dataUpdate", update)
// 			})
// 			//relay to client
// 			socket.on("request_mqtt_credentials", (message) => {
// 				io.emit("request_mqtt_credentials")
// 			})
// 			//relay to mqttlistener
// 			socket.on("mqtt_credentials", (message) => {	
// 				io.emit("mqtt_credentials", message)
// 			})
// 		});
// 	}
// }