import { DosPlayerFactoryType } from "js-dos";
import { getLoggedUser, login } from "./auth";
import { cdnEndPoint, cdnUrl } from "./cdn";
import { dhry2Bundle, Dhry2Decorator as addDhry2Decorator } from "./dhry2";

declare const Dos: DosPlayerFactoryType;

export function initPlayer() {
    const body = document.body;
    const datafiles = (window.location.search || "").indexOf("datafiles=true") >= 0;
    const frame = document.getElementsByClassName("jsdos-frame")[0] as HTMLDivElement;
    const root = document.getElementsByClassName("jsdos-content")[0] as HTMLDivElement;
    const withExperimentalApi = (window.location.href || "").indexOf("/multiplayer/") >= 0;

    if (!frame || !root || datafiles) {
        return;
    }

    const bundles = document.getElementsByClassName("jsdos-bundle");
    if (bundles.length === 0) {
        return;
    }

    const preventListener = (e: Event) => {
        let target: HTMLElement | null = e.target as HTMLElement;
        if (target instanceof HTMLInputElement) {
            return;
        }

        while (target !== null) {
            if (target.classList.contains("not-prevent-key-events")) {
                return;
            }
            target = target.parentElement;
        }
        e.preventDefault();
    };

    // eslint-disable-next-line new-cap
    const dos = Dos(root, {
        hardware: (window as any).hardware,
        withExperimentalApi,
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
            };
        },
        onExit: () => {
            body.classList.remove("disable-selection");
            frame.classList.add("gone");
        },
    });

    for (let i = 0; i < bundles.length; ++i) {
        const el = bundles[i] as HTMLAnchorElement;
        el.addEventListener("click", (ev) => {
            const bundleUrl = extractBundleUrl(el);
            if (bundleUrl === null) {
                return;
            }

            body.classList.add("disable-selection");
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
        });
    }
}

function extractBundleUrl(el: HTMLElement): string | null {
    if (el.dataset.bundle !== undefined) {
        const bundleUrl = el.dataset.bundle;
        return bundleUrl.startsWith("https://") ? bundleUrl : cdnEndPoint + decodeURIComponent(bundleUrl);
    }

    const href = (el as HTMLAnchorElement).href;
    if (href === undefined) {
        return null;
    }

    const index = href.indexOf("/my/");
    if (index === -1) {
        return null;
    }

    const url = decodeURIComponent(href.substring(index + "/my/".length));
    return url.startsWith("https://") ? cdnUrl(url) : cdnEndPoint + url;
}
