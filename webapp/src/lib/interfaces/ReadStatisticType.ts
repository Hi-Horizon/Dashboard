//todo name change
export interface ReadStatisticType {
    id:number;
    name:string;
    abbreviation:string;
    quantity:string;
    unit:string;
    display:number;
    CANid:number;
    CANmsgPosition:number;
    CANByteLength:number;
    endianness:number;
    Scale:number;
    Offset:number;
}