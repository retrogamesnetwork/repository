import { ClientId, DosPlayerFactoryType } from "js-dos";
import { dhry2Bundle, Dhry2Decorator as addDhry2Decorator } from "./dhry2";
import {
    hasDirect, hasExperimentalApi,
    hasNoShared, hasNoWebGL, hasShared,
} from "./location-options";

declare const Dos: DosPlayerFactoryType;
declare const emulators: any;

export function initPlayer() {
    const root = document.getElementsByClassName("jsdos-content")[0] as HTMLDivElement;

    if (!root) {
        return;
    }

    const withExperimentalApi = hasExperimentalApi();
    const emulatorFunction = hasDirect() ? "dosboxDirect" : "dosboxWorker";
    const noWebGL = hasNoWebGL();

    if (hasShared()) {
        emulators.wdosboxJs = "wdosbox.shared.js";
    }

    if (hasNoShared()) {
        emulators.wdosboxJs = "wdosbox.js";
    }

    const bundleUrl = new URLSearchParams(window.location.search).get("bundleUrl");
    if (bundleUrl === null) {
        console.error("bundle url is not set!", window.location.search);
        return;
    }

    const onServerMessage = (e: any) => {
        if (e.data.message !== "dz-server-message") {
            return;
        }

        (window as any).serverMessage(e.data.payload);
    };

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
        noWebGL,
        emulatorFunction,
        withExperimentalApi,
        clientId: (gesture: boolean) => {
            return new Promise<ClientId | null>((resolve) => {
                const onId = (e: any) => {
                    if (e.data.message !== "dz-client-id-response") {
                        return;
                    }
                    const { namespace, id } = e.data;
                    if (!namespace || !id) {
                        resolve(null);
                    } else {
                        resolve({
                            namespace,
                            id,
                        });
                    }
                    window.removeEventListener("message", onId);
                };
                window.addEventListener("message", onId);
                window.parent.postMessage({ message: "dz-client-id", gesture }, "*");
            });
        },
        onExit: () => {
            window.removeEventListener("keydown", preventListener, { capture: true });
            window.removeEventListener("message", onServerMessage);
            window.parent.postMessage({ message: "dz-player-exit" }, "*");
        },
    });

    window.addEventListener("message", onServerMessage);
    window.addEventListener("keydown", preventListener, { capture: true });

    setTimeout(async () => {
        const isDhry2Bundle = bundleUrl.indexOf(dhry2Bundle) >= 0;
        const ci = await dos.run(bundleUrl);
        if (isDhry2Bundle) {
            addDhry2Decorator(dos, ci);
        }
    }, 100);
}

function installWindowOpenProxy() {
    const wo = window.open;
    (window as any).open = function(url: string, target: string) {
        if (target === "_blank") {
            (window as any).proxy.windowOpen(url, target);
        } else {
            wo(url, target);
        }
    };
}

installWindowOpenProxy();
initPlayer();
