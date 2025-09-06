import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";


export const load: LayoutServerLoad = ({ cookies }) => {
    if (cookies.get("sessionid") === "1") {
        return;
    }
    else {
        redirect(308, "/");
    }
};