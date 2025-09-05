import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import path from "path"

import { webSocketServer } from "./WebSocketServer"
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
	plugins: [
		tailwindcss(), 
		sveltekit(), 
		webSocketServer],
	resolve: {
		alias: {
		  '@mqtt': path.resolve(__dirname, './node_modules/mqtt/bin/'),
		},
	  },
	server: {
		port: 5173,
		strictPort: true
	}
});

