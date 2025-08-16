import { json } from "@sveltejs/kit";
import { resetDistance } from "../../../../lib/server/queries/dashboard/dataFrame.js";

export async function POST({ request, cookies }) {
    let response:string = "ummm.. Thats akward";
    let result: number = 500;
    try {
        resetDistance();
        response = "All Saves changed sucessfully"
        result = 201;
    }
    catch (error) {
        response = "An error occured";
        result = 400;
    }
    
	return json({response:response, status:result});
}
