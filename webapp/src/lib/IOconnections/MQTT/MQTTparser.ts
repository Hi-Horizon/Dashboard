import { createModel } from "js-crc"

const crc16 = createModel({
  width: 16,
  poly: 0xBAAD,
  init: 0x0,
  refin: false,
  refout: false,
  xorout: 0x0
});

export function parseCANmessages(mqttMsg: any, canSchema: any) {
    const payload: number[] = mqttMsg.payload.event.message.payload
    const canMessages: number[][] = []
    const resultsdict: any = {}

    for (let i = 14; i <= payload.length; i += 14) {
        canMessages.push(payload.slice(i - 14, i))
    }

    // parse bytes to individual can messages
    canMessages.forEach(message => {
        // calculate crc
        if (Number(crc16(message)) !== 0) {
            console.warn("crc checksum failed!")
            return //stop parsing since message is invalid
        }
        // parse id
        const id: number = message[3] + (message[2] << 8) + (message[1] << 16) + (message[0] << 24)
        // parse message
        let messageStructure: any[] = canSchema[id]
        let startPos = 4
        messageStructure.forEach(valueInfo => {
            let value = 0
            for (let i = 0; i < valueInfo.CANbyteLength; i++) {
                if (valueInfo.Endian)       value += message[startPos + i] << 8*((valueInfo.CANbyteLength - 1) - i)
                else                        value += message[startPos + i] << (8*i)
            }
            resultsdict[valueInfo.id] = (value / valueInfo.CANscale) + valueInfo.CANoffset
            startPos += valueInfo.CANbyteLength
        })
    });
    return resultsdict
}

