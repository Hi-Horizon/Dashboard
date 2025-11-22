import List from "./Components/list.svelte"
import ValueBig from "./Components/valueBig.svelte";
import ValueSmall from "./Components/valueSmall.svelte";

export function parseComponentName(componentName: string) {
    switch (componentName) {
        case "list":
            return List
        case "valueBig":
            return ValueBig
        case "valueSmall":
            return ValueSmall          
        default:
            return ValueBig
    }
}