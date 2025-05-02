import { fetchLatestData } from '$lib/server/queries/dashboard/dataFrame.js';
import { fetchReadStatisticsTypes } from '$lib/server/queries/settings/ReadStatistics.js';
/** @type {import('./$types').Actions} */

export async function load() {
    const [dataFrame, dataFrameStructure] = await Promise.all([
        fetchLatestData(),
        fetchReadStatisticsTypes(),
    ]);
    return {
        dataFrame,
        dataFrameStructure
    }   
}
export const actions = {
    submit: async ({request}) => {
        const link = await request.formData
        return {success : true}
    }
}