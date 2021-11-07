import { User } from "./auth";
import { base64ToString } from "./base64";

declare const nativeGapi: any;

export function requestLogin() {
    if (typeof nativeGapi === "undefined") {
        return;
    }

    nativeGapi.requestLogin();
}

export async function init(onSuccess: (user: User) => void) {
    if (typeof nativeGapi === "undefined") {
        return;
    }

    (window as any).nativeGapiLogin = function(id: string, email: string, avatarUrl: string, username: string) {
        onSuccess({
            namespace: "dzapi",
            nonce: base64ToString(id),
            avatarUrl: base64ToString(avatarUrl),
            email,
            username: base64ToString(username),
            sso: "",
            sig: "",
            time: Date.now(),
        });
    };
}
