export function parseCANmessages(mqttMsg: any, canSchema: any) {
    const payload: number[] = mqttMsg.payload.event.message.payload
    const canMessages: number[][] = []
    const resultsdict: any = {}

    for (let i = 12; i <= payload.length; i += 12) {
        canMessages.push(payload.slice(i - 12, i))
    }

    // parse bytes to individual can messages
    canMessages.forEach(message => {
        // parse id
        const id: string = "0x" + (message[0] + (message[1] << 8) + (message[2] << 16) + (message[3] << 24)).toString(16).toUpperCase()
        console.log("parsed CAN id:" + id)
        
        // parse message
        let messageStructure: any[] = canSchema[id]
        let startPos = 4
        messageStructure.forEach(valueInfo => {
            let value = 0
            for (let i = 0; i < valueInfo.CANbyteLength; i++) {
                if (valueInfo.Endian)       value += message[startPos + i] << 8*((valueInfo.CANbyteLength - 1) - i)
                else                        value += message[startPos + i] << (8*i)
            }
            console.log(value)
            resultsdict[valueInfo.id] = (value / valueInfo.CANscale) + valueInfo.CANoffset
            console.log(resultsdict[valueInfo.id])
            startPos += valueInfo.CANbyteLength
        })
    });
    return resultsdict
}

