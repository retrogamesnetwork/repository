import { DosPlayerFactoryType } from "js-dos";
import { getLoggedUser, login } from "./auth";
import { cdnUrl } from "./cdn";
import { dhry2Bundle, Dhry2Decorator as addDhry2Decorator} from "./dhry2";

declare const Dos: DosPlayerFactoryType;

export function initPlayer() {
	const frame = document.getElementsByClassName("jsdos-frame")[0] as HTMLDivElement;
	const root = document.getElementsByClassName("jsdos-content")[0] as HTMLDivElement;

	if (!frame || !root) {
		return;
	}

	const bundles = document.getElementsByClassName("jsdos-bundle");
	if (bundles.length === 0) {
		return;
	}

	const preventListener = (e: Event) => {
		let target: HTMLElement | null = e.target as HTMLElement;
		while (target !== null) {
			if (target.classList.contains("not-prevent-key-events")) {
				return;
			}
			target = target.parentElement;
		}
		e.preventDefault();
	};

	const dos = Dos(root, {
		hardware: (window as any).hardware,
		clientId: async (gesture: boolean) => {
			let user = getLoggedUser();
			if (user === null && gesture) {
				user = await login();
			}

			if (user === null) {
				return null;
			}

			return {
				namespace: user.namespace || "doszone",
				id: user.email,
			}
		},
        onExit: () => {
			frame.classList.add("gone");
        },
	});

	for (let i = 0; i < bundles.length; ++i) {
		const el = bundles[i] as HTMLAnchorElement;
		el.addEventListener("click", (ev) => {
			const index = el.href.indexOf("/rep/my/");
			if (index === -1) {
				return;
			}

			const url = decodeURIComponent(el.href.substr(index + "/rep/my/".length));
			const bundleUrl = cdnUrl(url);
			if (!bundleUrl) {
				return;
			}

			frame.classList.remove("gone");
			setTimeout(async () => {
				const isDhry2Bundle = bundleUrl.indexOf(dhry2Bundle) >= 0;
				const ci = await dos.run(bundleUrl);
				if (isDhry2Bundle) {
					addDhry2Decorator(dos, ci);
				}
			}, 100);


			window.addEventListener("keydown", preventListener, { capture: true });
			ev.stopPropagation();
			ev.preventDefault();
		}, {
			capture: true,
		})
	}

}