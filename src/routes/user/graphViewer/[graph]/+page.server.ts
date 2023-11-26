import { getAllDataPointsFromAxes } from "$lib/server/queries/graphs/getDataPoints";
import { fetchReadStatisticsTypes } from "$lib/server/queries/settings/ReadStatistics"
import { fetchDataSet } from "$lib/server/queries/graphs/fetchDataSet";
import type { Actions } from "./$types";

//TODO: fetch recording Interval

export const load = async ({ params }) => {
    return {
        graphName: params.graph,
        readStatisticTypes: await fetchReadStatisticsTypes(),
        recordingInterval: await fetchDataSet(-1) 
    }
}