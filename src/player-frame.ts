import { ClientId, DosPlayerFactoryType } from "js-dos";
import { dhry2Bundle, Dhry2Decorator as addDhry2Decorator } from "./dhry2";
import {
    hasDirect, hasExperimentalApi,
    hasNoShared, hasNoWebGL, hasShared,
    hasAnonymous,
    hasExit,
    hasNetworkingApi,
} from "./location-options";

declare const Dos: DosPlayerFactoryType;
declare const emulators: any;
declare const liveCapture: (canvas: HTMLCanvasElement) => void;
const legacyBundleUrlPattern = "dos.zone/en/player/";

export function initPlayer() {
    const root = document.getElementsByClassName("jsdos-content")[0] as HTMLDivElement;

    if (!root) {
        return;
    }

    const withExperimentalApi = hasExperimentalApi();
    const withNetworkingApi = hasNetworkingApi();
    const emulatorFunction = hasDirect() ? "dosboxDirect" : "dosboxWorker";
    const noWebGL = hasNoWebGL();
    let anonymous = hasAnonymous();

    if (hasShared()) {
        emulators.wdosboxJs = "wdosbox.shared.js";
    }

    if (hasNoShared()) {
        emulators.wdosboxJs = "wdosbox.js";
    }

    let bundleUrl = new URLSearchParams(window.location.search).get("bundleUrl");
    if (bundleUrl === null) {
        console.warn("bundle url is not set in", window.location.search);
        const href = window.location.href || "";
        const legacyIndex = href.indexOf(legacyBundleUrlPattern);
        if (legacyIndex >= 0) {
            anonymous = true;
            bundleUrl = decodeURIComponent(href.substring(legacyIndex + legacyBundleUrlPattern.length).split("?")[0]);
            console.warn("found legacy bundle url", bundleUrl);
        }
    }

    if (bundleUrl === null) {
        console.error("bundle url is not specified, exiting...");
        document.getElementsByClassName("page404")[0]?.classList.remove("gone");
        setTimeout(() => location.replace("/"), 3000);
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

    const hardware = (window as any).hardware;
    const preventUnload = hardware?.preventUnload !== false;

    // eslint-disable-next-line new-cap
    const dos = Dos(root, {
        hardware,
        noWebGL,
        emulatorFunction,
        withExperimentalApi,
        withNetworkingApi,
        preventUnload,
        windowOpen: (url: string, target?: string) => {
            const proxy = (window as any).proxy;
            if (target === "_blank" && typeof proxy === "object" && typeof proxy.windowOpen === "function") {
                proxy.windowOpen(url, target);
            } else {
                window.open(url, target);
            }
        },
        // @caiiiycuk: TODO move auth inside jsdos
        // clientId: (gesture: boolean) => {
        //     return new Promise<ClientId | null>((resolve) => {
        //         if (anonymous) {
        //             resolve(null);
        //             return;
        //         }

        //         const onId = (e: any) => {
        //             if (e.data.message !== "dz-client-id-response") {
        //                 return;
        //             }
        //             const { namespace, id } = e.data;
        //             if (!namespace || !id) {
        //                 resolve(null);
        //             } else {
        //                 resolve({
        //                     namespace,
        //                     id,
        //                 });
        //             }
        //             window.removeEventListener("message", onId);
        //         };
        //         window.addEventListener("message", onId);
        //         window.parent.postMessage({ message: "dz-client-id", gesture }, "*");
        //     });
        // },
        onExit: hasExit() ? () => {
            window.removeEventListener("keydown", preventListener, { capture: true });
            window.removeEventListener("message", onServerMessage);
            window.parent.postMessage({ message: "dz-player-exit" }, "*");
        } : undefined,
    });

    if (typeof hardware !== "undefined" && typeof hardware.onVolumeChanged === "function") {
        dos.registerOnVolumeChanged((v) => {
            hardware.onVolumeChanged(v);
        });
        hardware.onVolumeChanged(dos.volume);
    }

    (window as any).dos = dos;

    liveCapture(dos.layers.canvas);

    window.addEventListener("message", onServerMessage);
    window.addEventListener("keydown", preventListener, { capture: true });

    setTimeout(async () => {
        const isDhry2Bundle = (bundleUrl as string).indexOf(dhry2Bundle) >= 0;
        const ci = await dos.run(bundleUrl as string);
        if (isDhry2Bundle) {
            addDhry2Decorator(dos, ci);
        }
    }, 100);
}

initPlayer();
