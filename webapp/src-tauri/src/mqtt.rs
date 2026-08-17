use tauri::{AppHandle, Emitter, State};
use rumqttc::{AsyncClient, MqttOptions, Transport, QoS, Event, Packet};
use std::sync::{Arc, Mutex};
use std::sync::atomic::{AtomicBool, Ordering};

//state to track the MQTT connection and thread
pub struct MqttState {
    pub handle: Mutex<Option<tauri::async_runtime::JoinHandle<()>>>,
    pub stop_flag: Mutex<Option<Arc<AtomicBool>>>,
}

#[derive(serde::Deserialize, Clone)]
pub struct MqttCredentials {
    username: Option<String>,
    password: Option<String>,
}

#[tauri::command]
pub async fn connect_mqtt(
    app: tauri::AppHandle,
    state: State<'_, MqttState>,
    creds: MqttCredentials,
) -> Result<(), String> {
    let mut handle_guard = state.handle.lock().map_err(|e| e.to_string())?;
    if let Some(handle) = handle_guard.take() {
        handle.abort();
    }

    //spawn a new thread to run the MQTT loop
    let handle = tauri::async_runtime::spawn(run_mqtt_loop(app, creds));
    *handle_guard = Some(handle);
    // *state.stop_flag.lock().map_err(|e| e.to_string())? = Some(stop);

    Ok(())
}

#[tauri::command]
pub async fn disconnect_mqtt(
    app: tauri::AppHandle,
    state: State<'_, MqttState>
) -> Result<(), String> {
    let mut handle_guard = state.handle.lock().map_err(|e| e.to_string())?;
    if let Some(handle) = handle_guard.take() {
        handle.abort();
    }
    app.emit("mqtt-status", "disconnected").ok();
    Ok(())
}

#[derive(serde::Serialize, Clone)]
struct MqttMessage {
    topic: String,
    payload: Vec<u8>,
}

pub async fn run_mqtt_loop(
    app: tauri::AppHandle, 
    creds: MqttCredentials
) {
    // TODO: HARDCODED MQTT OPTIONS FOR NOW, WILL BE REPLACED WITH USER INPUT LATER
    let mut opts = MqttOptions::new("dashboard", std::env::var("MQTTBROKERURL").unwrap_or_else(|_| "localhost".into()), std::env::var("MQTTBROKERPORT").unwrap_or_else(|_| "1883".into()).parse::<u16>().unwrap_or(1883));
    opts.set_transport(Transport::tls_with_default_config());
    // set credentials if provided
    if let (Some(u), Some(p)) = (&creds.username, &creds.password) {
        opts.set_credentials(u, p);
    }

    let (client, mut eventloop) = AsyncClient::new(opts, 4096);
    // subcribe to necessary topics
    client.subscribe("data", QoS::AtMostOnce).await.unwrap();
    app.emit("mqtt-status", "connected").ok();

    loop {
        match eventloop.poll().await{
            Ok(Event::Incoming(Packet::Publish(p))) => {
                let msg = MqttMessage {
                    topic: p.topic.clone(),
                    payload: p.payload.to_vec(), // Bytes -> Vec<u8>
                };
                app.emit("mqtt-data", msg).ok();
            }
            Err(e) => {
                app.emit("mqtt-status", format!("{:?}", e)).ok();
                break;
            }
            _ => {}
        }
    }
}