import List from "./Components/list.svelte"
import ValueBig from "./Components/valueBig.svelte";
import ValueSmall from "../../routes/connected/dashboard/valueSmall.svelte";

export function parseComponentName(componentName: string) {
    switch (componentName) {
        case "list":
            return List
        case "valueBig":
            return ValueBig
        case "valueBig":
            return ValueSmall          
        default:
            return ValueBig
    }
}