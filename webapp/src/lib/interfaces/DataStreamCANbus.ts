import type { UnlistenFn } from "@tauri-apps/api/event";

// DataStream of CANbus messages, from the tauri event API
export interface DataStreamCANbus {
    connect():                      Promise<boolean>;
    listen(handler: (messages: any) => unknown): Promise<UnlistenFn>;
    disconnect():                   Promise<boolean>;
    unlisten: UnlistenFn | null
    //todo define canbus message type
    // convertToCANbusMessageList(): any;
}