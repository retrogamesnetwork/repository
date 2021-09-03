import { DosPlayerFactoryType } from "js-dos";
import { cdnUrl } from "./cdn";

declare const Dos: DosPlayerFactoryType;

export function initPlayer() {
	const frame = document.getElementsByClassName("jsdos-frame")[0] as HTMLDivElement;
	const root = document.getElementsByClassName("jsdos-content")[0] as HTMLDivElement;
	const close = document.getElementsByClassName("jsdos-close")[0] as HTMLDivElement;

	if (!frame || !root || !close) {
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
			setTimeout(() => {
				// TODO: use saves from dos.zone
				dos.run(bundleUrl);
			}, 100);


			window.addEventListener("keydown", preventListener, { capture: true });
			ev.stopPropagation();
			ev.preventDefault();
		}, {
			capture: true,
		})
	}

	close.addEventListener("click", async (ev) => {
		ev.stopPropagation();
		ev.preventDefault();

		await dos.layers.save();
		await dos.stop();
		frame.classList.add("gone");
		window.removeEventListener("keydown", preventListener, { capture: true });
	}, { capture: true });


	function onBeforeUnload(event: BeforeUnloadEvent) {
		if (frame.classList.contains("gone")) {
			return;
		}

		const message = "Please close player to save progress";

		setTimeout(() => {
			if (dos !== null) {
				dos.layers.notyf.error(message);
			}
		}, 16);

		event.preventDefault();
		event.returnValue = message;
	}

	window.addEventListener("beforeunload", onBeforeUnload);
}