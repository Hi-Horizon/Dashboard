import { MQTTBROKERURL, MQTTBROKERPORT, MQTTCLIENTID } from '$env/static/private'

export async function load() {
    return {MQTTBROKERURL, MQTTBROKERPORT, MQTTCLIENTID}
}