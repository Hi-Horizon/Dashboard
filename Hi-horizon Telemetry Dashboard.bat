@echo off
start /b python MQTTlistener\MqttDataHandler.py %*
cd webapp
start /b npm run tauri dev