import { extractBundleUrl } from "./bundle-url";
import { getLoggedUser, login } from "./auth";
import { hasDataFiles, hasExperimentalApi, hasNetworkingApi, isMobile, isHardware } from "./location-options";
import { DosFn } from "./v8/types";
import { cdnUrl } from "./cdn";

declare const Dos: DosFn;

export function initPlayer() {
    const v8Element = document.querySelector<HTMLDivElement>(".jsdos-v8-window");
    const v7Element = document.querySelector<HTMLDivElement>(".jsdos-v7-window");

    if (v8Element !== null && v7Element !== null && !isMobile() && !isHardware()) {
        v7Element.style.display = "none";
        v8Element.style.display = "block";
        return initV8Player();
    }

    const body = document.body;
    const datafiles = hasDataFiles();
    const root = document.getElementsByClassName("jsdos-root")[0] as HTMLDivElement;
    const iframe = document.getElementsByClassName("jsdos-iframe")[0] as HTMLIFrameElement;

    if (!root || !iframe || datafiles) {
        return;
    }

    (window as any).serverMessage = (message: string) => {
        iframe.contentWindow?.postMessage({
            message: "dz-server-message",
            payload: message,
        }, "*");
    };

    const el = iframe as any;
    if (!el.requestFullscreen &&
        !el.webkitRequestFullscreen &&
        !el.mozRequestFullScreen &&
        !el.msRequestFullscreen &&
        !el.webkitEnterFullscreen) {
        el.classList.add("jsdos-frame-fullscreen");
    }

    const bundles = document.getElementsByClassName("jsdos-bundle");
    if (bundles.length === 0) {
        return;
    }

    const clientIdListener = async (e: any) => {
        if (e.data.message !== "dz-client-id") {
            return;
        }
        const gesture = e.data.gesture;

        let user = getLoggedUser();
        if (user === null && gesture) {
            user = await login();
        }

        if (user === null) {
            iframe.contentWindow?.postMessage({
                message: "dz-client-id-response",
            }, "*");
        } else {
            iframe.contentWindow?.postMessage({
                message: "dz-client-id-response",
                namespace: user.namespace || "doszone",
                id: user.email,
            }, "*");
        }
    };

    const exitListener = (e: any) => {
        if (e.data.message !== "dz-player-exit") {
            return;
        }

        window.removeEventListener("message", clientIdListener);
        window.removeEventListener("message", exitListener);

        body.classList.remove("disable-selection");
        body.classList.remove("overflow-hidden");
        root.classList.add("gone");
    };

    for (let i = 0; i < bundles.length; ++i) {
        const el = bundles[i] as HTMLElement;
        el.addEventListener("click", (ev) => {
            const bundleUrl = extractBundleUrl(el);
            if (bundleUrl === null) {
                return;
            }

            body.classList.add("disable-selection");
            body.classList.add("overflow-hidden");
            root.classList.remove("gone");

            iframe.src = "/player/?bundleUrl=" + encodeURIComponent(bundleUrl) +
                "&exit=1" +
                ((window.location.search || "").length > 0 ?
                    "&" + window.location.search.substring(1) : "") +
                (hasExperimentalApi() ? "&experimental=1" : "") +
                (hasNetworkingApi() ? "&networking=1" : "");
            iframe.focus();


            ev.stopPropagation();
            ev.preventDefault();


            window.addEventListener("message", clientIdListener);
            window.addEventListener("message", exitListener);
        }, {
            capture: true,
        });
    }
}

function initV8Player() {
    const searchParams = new URLSearchParams(location.search);
    const root = document.querySelector<HTMLDivElement>(".jsdos-v8")!;

    const css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = "https://v8.js-dos.com/latest/js-dos.css";
    document.head.append(css);

    const js = document.createElement("script");
    js.src = "https://v8.js-dos.com/latest/js-dos.js";
    js.onload = () => {
        /* eslint-disable-next-line new-cap */
        Dos(root, {
            url: "https://cdn.dos.zone/" + root.getAttribute("data-url"),
            theme: "light",
            onEvent: (event) => {
                if (event === "emu-ready") {
                    root.parentElement!.style.height = "80vh";
                }
            },
            room: searchParams.get("room") ?? undefined,
            server: (searchParams.get("server") as any) ?? undefined,
        });
    };
    document.body.append(js);
}
