import { getDataTableWithRange } from "$lib/server/queries/graphs/getDataPoints";
import { json } from "@sveltejs/kit";

//TODO: make it return a RESTMessage JSON object
//TODO: make it so that a range can be specified for the download

/**
 * requests a table with specified range of data points from the server using an API GET request, 
 * then converts this to Base64 format.
 * @param url the URL passed on, this url should contain the following values:
 *      - @query xs: the beginTime of the interval (not implemented yet)
 *      - @query xe: the EndTime of the interval   (not implemented yet)
 * @returns a JSON object containing the table in Base64 format
 */
export function GET() {
    let table: any[][] = getDataTableWithRange();
    let rawString:string = '';
    for (const row of table) {
        rawString += (row.join(',') + '\n');
    }
    var b64str = btoa(rawString);
    var src = 'data:text/csv;base64,' + b64str;
    return json({table: src})
}