import { sessionExists } from "$lib/server/authentication/session";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { validateLogin } from "$lib/server/authentication/login";
import type { Actions } from "./user/$types";

export const load: PageServerLoad  = ({cookies}) => {
    if (cookies.get("sessionid") === "1") {
        redirect(308, "user/dashboard");
    }
};

export const actions = {
	login: async ({ cookies, request }) => {
        const data = await request.formData();
        const username = data.get('username');
        const password = data.get('password');
        if(validateLogin(username, password) === false) {
            redirect(303, "/");
        }
        else {
            cookies.set("sessionid", "1", {path:"/"});
            redirect(303, "/user/dashboard");
        };
    },
    logout: async ({ cookies, request }) => {
        cookies.delete("sessionid", {path:"/"});
        redirect(303, "/");
    },
} satisfies Actions;