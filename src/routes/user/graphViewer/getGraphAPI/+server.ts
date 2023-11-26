import type { RESTMessage } from "$lib/interfaces/RestMessage";
import { getAllDataPointsFromAxes } from "$lib/server/queries/graphs/getDataPoints";
import { json } from "@sveltejs/kit";

//TODO: make function return RESTMessage with corresponding responses

/**
 * requests the range and axes for a graph from the server using an API GET request
 * @param url the URL passed on, this url should contain the following values:
 *      - @query x: the valueType of the X-Axis
 *      - @query y: the valueType of the Y-Axis
 *      - @query xs: the beginTime of the interval
 *      - @query xe: the EndTime of the interval
 * @returns a JSON object containing the x values and y values
 */
export function GET({url}) {
    const x = String(url.searchParams.get('x'));
    const y = String(url.searchParams.get('y'));
    const xs = String(url.searchParams.get('xs') / 1000);
    const xe = String(url.searchParams.get('xe') / 1000);

    let xPoints: any[] = [];
    let yPoints: any[] = [];
    const xData = {name:x, points: xPoints}
    const yData = {name:y, points: yPoints}

	const rawData:RESTMessage = getAllDataPointsFromAxes(x, y, xs, xe);
    rawData.result.forEach((row:any[]) => {
        xData.points.push(row[0]);
        yData.points.push(row[1]);
    })
    
	return json({x: xData, y: yData});
}