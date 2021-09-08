import ReactDom from "react-dom";
import React, { useEffect, useState } from "react";
import { Icon, Button, Intent, Spinner } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";

import {
	requestLogin as talksLogin,
	authenticate as talksAuthenticate,
	requestLogout as talksLogout,
} from "./auth-talks";

const userKey = "zone.dos.user.v2";
const userCookie = userKey.replace(/\./g, "_");

export interface User {
	avatarUrl: string,
	email: string,
	nonce: string,
	username: string,
	sso: string,
	sig: string,
	time: number,
}

export function getLoggedUser(): User | null {
	// read cookie first
	for (const next of document.cookie.split("; ")) {
		if (next.startsWith(userCookie + "=")) {
			const cookieValue = next.substr((userCookie + "=").length);
			if (cookieValue.length === 0) {
				return null;
			} else {
				return JSON.parse(atob(cookieValue));
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
		document.cookie = userCookie + "=" + btoa(stringified) + ";path=/;max-age=2592000";
	}
}

function Auth() {
	useEffect(() => {
		talksAuthenticate().then((user) => {
			setLoggedUser(user);
			setUser(user);
			setBusy(false);
		}).catch(() => { /**/ });
	}, []);

	const [busy, setBusy] = useState<boolean>(false);
	const [user, setUser] = useState<User | null>(getLoggedUser());

	async function uiLogin() {
		setBusy(true);
		const user = await login();
		setLoggedUser(user);
		setUser(user);
		setBusy(false);
	}

	if (busy) {
		return <Spinner size={20}></Spinner>
	}

	return user === null ?
		<div>
			<Button minimal={true} icon={IconNames.LOG_IN} intent={Intent.WARNING} onClick={uiLogin}>Log in</Button>
		</div> :
		<div className="auth-logout">
			{user.avatarUrl !== undefined ?
				<img className="avatar" src={user.avatarUrl} alt="" /> :
				<Icon iconSize={16} icon={IconNames.USER} />}
			<Button minimal={true} icon={IconNames.LOG_OUT} onClick={uiLogout}></Button>
		</div>;
}

function uiLogout() {
	talksLogout(getLoggedUser());
	setLoggedUser(null);
	const queryIndex = window.location.href.indexOf("?");
	if (queryIndex > 0) {
		window.location.href = window.location.href.substr(0, queryIndex);
	} else {
		window.location.reload();
	}
}

export async function login(): Promise<User | null> {
	await talksLogin();
	return null;
}

export function initAuth() {
	const domContainer = document.querySelector("#auth");
	if (domContainer !== null) {
		ReactDom.render(<Auth />, domContainer);
	}
}