// parse message from a canid and its payload, to defined values according to the provided canSchema
export function parseCANmessage(canId: any, payload: any, canSchema: any) {
    const resultsdict: any = {}
    let messageStructure: any[] = canSchema[canId]
    let startPos = 0
    messageStructure.forEach(valueInfo => {
        let value = 0
        for (let i = 0; i < valueInfo.CANbyteLength; i++) {
            if (valueInfo.Endian)       value += payload[startPos + i] << 8*((valueInfo.CANbyteLength - 1) - i)
            else                        value += payload[startPos + i] << (8*i)
        }
        resultsdict[valueInfo.id] = (value / valueInfo.CANscale) + valueInfo.CANoffset
        startPos += valueInfo.CANbyteLength
    })
    return resultsdict
}