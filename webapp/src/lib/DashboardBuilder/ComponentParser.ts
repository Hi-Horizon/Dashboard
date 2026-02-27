import BatteryCellGraph from "../Components/batteryCellGraph.svelte";
import Map from "../Components/map.svelte";
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
        case "batteryCellGraph":
            return BatteryCellGraph
        case "map":
            return Map   
        default:
            return ValueBig
    }
}