import BatteryCellGraph from "./Components/batteryCellGraph.svelte";
import Map from "./Components/map.svelte";
import List from "./Components/list.svelte"
import ValueBig from "./Components/valueBig.svelte";
import ValueSmall from "./Components/valueSmall.svelte";
import TimeSince from "./Components/timeSince.svelte";
import RouteMap from "./Components/RouteMap.svelte";

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
        case "routeMap":
            return RouteMap  
        case "timeSince":
            return TimeSince  
        default:
            return ValueBig
    }
}