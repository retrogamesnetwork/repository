import { User } from "./auth";

declare const gapi: any;

export async function init(onSuccess: (user: User) => void) {
	gapi.signin2.render("googleLogin", {
		onsuccess: (googleData: any) => {
			const profile = googleData.getBasicProfile();
			const user: User = {
				namespace: "dzapi",
				nonce: profile.getId(),
				avatarUrl: profile.getImageUrl(),
				email: profile.getEmail(),
				username: profile.getName(),
				sso: "",
				sig: "",
				time: Date.now(),
			};
			onSuccess(user);
		},
		onerror: (err: any) => {
			console.error('Google signIn2.render button err: ' + err)
		}
	})
}

export async function requestLogout(): Promise<void> {
	try {
		gapi.auth2.getAuthInstance().signOut();
	} catch (e) {
		console.error("gapi logout error:", e);
	}
}
