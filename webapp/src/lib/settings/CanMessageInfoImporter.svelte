<script lang="ts">
    import Button from "../Components/button.svelte";
    import { db } from "$lib/IOconnections/DBO/databaseObject";
    import { addReadStatisticsType } from "./ReadStatistics";

    let fileInput: any

    async function importDataDescriptions(e: any) {
        try {
            let configFile = e.target.files[0];
            let reader = new FileReader();

            reader.readAsText(configFile);
            reader.onload = e => {
                // parse CSV
                let rawConfig: any = e.target.result.split('\r\n').map((x: string)=>{return x.split(',')})
                console.log(rawConfig)
                processConfig(rawConfig)
            };
            alert("import succesful!")
        } catch (error: any) {
            alert ("Error: String is not a valid JSON-object: \n" + error.message + "\n\n Please fix the error and try again.")
            return
        }
    }

    // iterates through csv data and creates datadescription rows to upsert
    async function processConfig(rawConfig: any) {
        let bytes
        let datadescription: any = {}
        let current_canid = 0x0
        for (let row = 1; row < rawConfig.length; row++) {
           if (rawConfig[row][1] !== "") {
                datadescription.CANid = parseInt(rawConfig[row][1], 16)
                datadescription.CANmsgPosition = 0
           }
           datadescription.CANmsgPosition++
           datadescription.name  = rawConfig[row][2]
           // todo, add types
           datadescription.CANByteLength = parseInt(rawConfig[row][4])
           if (rawConfig[row][5] == 'Little') datadescription.endianness = 0
           else datadescription.endianness = 1
           datadescription.Scale    = Number(rawConfig[row][6])
           datadescription.Offset   = Number(rawConfig[row][7])
           // todo, add offset

           await addReadStatisticsType(db, datadescription)
        }
    }
</script>

<div>
    <!-- file uploader -->
     <input
        bind:this={fileInput}
        type="file"
        id="fileElem"
        multiple
        accept="CSV"
        style="display:none"
        on:change={(e)=>importDataDescriptions(e)}
    />
    <Button onclick={()=>fileInput.click()}>Import CANbus Structure</Button>
</div>