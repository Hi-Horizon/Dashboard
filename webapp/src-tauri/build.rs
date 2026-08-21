fn main() {
    dotenvy::dotenv().ok();
    for var in ["MQTT_HOST", "MQTT_PORT"] {
        if let Ok(value) = std::env::var(var) {
            println!("cargo:rustc-env={var}={value}");
        }
    }

    tauri_build::build()
}
