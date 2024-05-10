import { fetchLatestData } from '$lib/server/queries/dashboard/dataFrame.js';
import { fetchReadStatisticsTypes } from '$lib/server/queries/settings/ReadStatistics.js';
/** @type {import('./$types').Actions} */

export async function load() {
    return {
        dataFrame: fetchLatestData(),
        dataFrameStructure: fetchReadStatisticsTypes()
    }   
}
export const actions = {
    submit: async ({request}) => {
        const link = await request.formData
        return {success : true}
    }
}