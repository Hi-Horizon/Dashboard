import type { UnlistenFn } from "@tauri-apps/api/event";

// DataStream of CANbus messages, from the tauri event API
export interface DataStreamCANbus {
    connect():                      Promise<boolean>;

    /**
     * Listens to an emitted event from the datastream.
     *
     * @param {function} handler - Callback invoked when messages are received,
     *                             takes an array of raw CAN messages as input.
     * @returns {Promise<UnlistenFn>} A promise that resolves to a function
     *                                which, when called, removes the listener.
     */
    listen(handler: (messages: number[][]) => unknown): Promise<UnlistenFn>;

    //
    disconnect():                   Promise<boolean>;
    unlisten: UnlistenFn | null
    //todo define canbus message type
    // convertToCANbusMessageList(): any;
}