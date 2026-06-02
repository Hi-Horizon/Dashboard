<script lang="ts">
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";
    import { canSchema, datadescription, liveData } from "./ConnectionStores";
    import { db } from "../lib/IOconnections/DBO/databaseObject";

    //fetch initial values for canSchema and DataDescription
    onMount(async () => {
        $datadescription = await db.select('SELECT * FROM DataDescription');

        //fill the tagToIdDict
        const tagToIdDict: any = {};
        $datadescription.map((x) => {
            tagToIdDict[x.tag] = x.id
        })
        //fill the canschema values
        $canSchema = Object.groupBy($datadescription, ({ CANid }) => CANid)
        // sort on CAN position
        Object.keys($canSchema).forEach(key => {
            $canSchema[key] = $canSchema[key].sort((a: any, b: any) => a.CANmsgPosition - b.CANmsgPosition)
        });

        // fetch time of last update
        const lastMsgTime: any[] = await db.select('SELECT max(UnixTime) as UnixTime FROM Data')
        liveData.update((xs: any) => {
            xs["UnixTime"] = lastMsgTime[0].UnixTime
            return xs
        })
    })

    goto("./dashboard")
</script>