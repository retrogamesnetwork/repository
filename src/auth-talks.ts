import { GET_OBJECT } from "./xhr";
import { parseQuery } from "./parse-query";
import { User } from "./auth";
import { base64ToString, stringToBase64 } from "./base64";

const endpointBase = "https://cwhaas1l6g.execute-api.eu-central-1.amazonaws.com/dev";

export const ssoUrl = endpointBase + "/sso/url";
export const ssoLogin = endpointBase + "/sso/login";
export const ssoLogout = endpointBase + "/sso/logout";

export async function requestLogin() {
	try {
		const backUrl = window.location.href;
		const response = await GET_OBJECT(ssoUrl + "?url=" + backUrl);
		const url = response.url;
		window.open(url, "_self");
	} catch (e) {
		console.error(e);
	}
}

export function requestLogout(user: User | null): void {
	if (user !== null) {
		GET_OBJECT(ssoLogout + "?sso=" + user.sso + "&sig=" + user.sig)
			.catch(console.error);
	}
}

export function init(onSuccess: (user: User) => void) {
	const queryParams = parseQuery(window.location.search) || {};

	const sso = queryParams.sso;
	const sig = queryParams.sig;

	if (sso && sig) {
		const payload = parseQuery(base64ToString(sso));
		validateUser({
			avatarUrl: payload.avatar_url,
			email: payload.email,
			username: payload.username,
			nonce: payload.nonce,
			sso,
			sig,
			time: Date.now(),
		} as User)
			.then((user) => {
				if (user !== null) {
					user.namespace = "doszone";
					onSuccess(user)
				}
			})
			.catch(console.error);
	}
}

async function validateUser(user: User): Promise<User | null> {
	try {
		return (await GET_OBJECT(ssoLogin + "?sso=" + user.sso +
			"&sig=" + user.sig + "&ua=" + stringToBase64(window.navigator.userAgent))).user;
	} catch (e) {
		console.error(e);
		return null;
	}
}