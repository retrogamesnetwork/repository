import ReactDom from "react-dom";
import React, { useEffect, useState } from "react";
import { Icon, Button, Intent, Spinner } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";

import {
    init as talksInit,
    requestLogin as talksLogin,
    requestLogout as talksLogout,
} from "./auth-talks";

import {
    init as gapiInit,
    requestLogout as gapiLogout,
} from "./auth-gapi";

import {
    init as nativeGapiInit,
    requestLogin as nativeGapiLogin,
} from "./auth-native-gapi";

import { base64ToString, stringToBase64 } from "./base64";

declare const nativeGapi: any;

const useCookie = false;
const userKey = "zone.dos.user.v2";
const userCookie = userKey.replace(/\./g, "_");

export interface User {
    namespace: "doszone" | "dzapi",
    avatarUrl: string,
    email: string,
    nonce: string,
    username: string,
    sso: string,
    sig: string,
    time: number,
}

export function getLoggedUser(): User | null {
    if (useCookie) {
        // read cookie first
        for (const next of document.cookie.split("; ")) {
            if (next.startsWith(userCookie + "=")) {
                const cookieValue = next.substr((userCookie + "=").length);
                if (cookieValue.length > 0) {
                    return JSON.parse(base64ToString(cookieValue));
                }
            }
        }
    }

    // give chance to ls
    try {
        const cachedValue = localStorage.getItem(userKey);
        return cachedValue === null || cachedValue === undefined ? null : JSON.parse(cachedValue);
    } catch (e) {
        return null;
    }
}

export function setLoggedUser(user: User | null) {
    if (user === null) {
        localStorage.removeItem(userKey);
        document.cookie = userCookie + "=;path=/";
    } else {
        const stringified = JSON.stringify(user);
        try {
            localStorage.setItem(userKey, stringified);
        } catch (e) {
            // do nothing
        }
        document.cookie = userCookie + "=" + stringToBase64(stringified) + ";path=/;max-age=2592000";
    }
}


const loginFrame = document.querySelector(".jsdos-login-frame") as HTMLDivElement;
const loginGapiButton = document.querySelector(".jsdos-login-gapi") as HTMLDivElement;
const loginNativeGapiButton = document.querySelector(".jsdos-login-native-gapi") as HTMLDivElement;
const loginTalksButton = document.querySelector(".jsdos-login-talks") as HTMLDivElement;
const loginCloseButton = document.querySelector(".jsdos-login-close") as HTMLDivElement;

loginTalksButton.addEventListener("click", () => {
    talksLogin();
    loginTalksButton.classList.add("bp3-disabled");
});
loginCloseButton.addEventListener("click", hideLoginFrame);

if (typeof nativeGapi === "undefined") {
    loginNativeGapiButton.classList.add("gone");
} else {
    loginGapiButton.classList.add("gone");
    loginNativeGapiButton.classList.add("bp3-intent-primary");
    loginNativeGapiButton.addEventListener("click", nativeGapiLogin);
}

function showLoginFrame() {
    loginFrame.classList.remove("gone");
    loginTalksButton.classList.remove("bp3-disabled");
}

function hideLoginFrame() {
    loginFrame.classList.add("gone");
}

function Auth() {
    useEffect(() => {
        loginCloseButton.addEventListener("click", () => setBusy(false));
    }, []);

    useEffect(() => {
        if (getLoggedUser() !== null) {
            return;
        }

        const onUserLogin = (user: User) => {
            setLoggedUser(user);
            setUser(user);
            setBusy(false);
            hideLoginFrame();
        };

        nativeGapiInit(onUserLogin);
        gapiInit(onUserLogin);
        talksInit(onUserLogin);
    }, []);

    const [busy, setBusy] = useState<boolean>(false);
    const [user, setUser] = useState<User | null>(getLoggedUser());

    if (busy) {
        return <Spinner size={20}></Spinner>;
    }

    return user === null ?
        <div>
            <Button minimal={true} icon={IconNames.LOG_IN} intent={Intent.WARNING} onClick={() => {
                setBusy(true);
                showLoginFrame();
            }}>Log in</Button>
        </div> :
        <div className="auth-logout">
            {user.avatarUrl !== undefined ?
                <img className="avatar" src={user.avatarUrl} alt="" /> :
                <Icon iconSize={16} icon={IconNames.USER} />}
            <Button minimal={true} icon={IconNames.LOG_OUT} onClick={uiLogout}></Button>
        </div>;
}

async function uiLogout() {
    const loggedUser = getLoggedUser();

    setLoggedUser(null);

    setTimeout(() => {
        const queryIndex = window.location.href.indexOf("?");
        if (queryIndex > 0) {
            window.location.href = window.location.href.substr(0, queryIndex);
        } else {
            window.location.reload();
        }
    }, 1000);

    try {
        if (typeof nativeGapi === "undefined") {
            gapiLogout(loggedUser);
        }
    } catch (e) {
        // ignore
    }

    try {
        await talksLogout(loggedUser);
    } catch (e) {
        // ignore
    }
}

export function login(): Promise<User | null> {
    return new Promise<User | null>((resolve) => {
        loginFrame.classList.remove("gone");
        const testInterval = setInterval(() => {
            if (loginFrame.classList.contains("gone")) {
                resolve(getLoggedUser());
                clearInterval(testInterval);
            }
        }, 100);
    });
}

export function initAuth() {
    const domContainer = document.querySelector("#auth");
    if (domContainer !== null) {
        ReactDom.render(<Auth />, domContainer);
    }
}
