import { Server } from 'socket.io';
import { fetchLatestData } from './src/lib/server/queries/dashboard/dataFrame';

export const webSocketServer = {
	name:'webSocketServer',
	configureServer(server:any) {
		const io = new Server(server.httpServer);

		setInterval(()=>{
			let update = fetchLatestData();
			io.emit("dataUpdate", update)
		}, 1000);

		io.on('connection', (socket) => {			
			socket.on("settingsUpdate", (arg) => {
				io.emit("settingsUpdate");
			});
		});
	}
}