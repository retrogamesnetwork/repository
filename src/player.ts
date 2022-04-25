import { extractBundleUrl } from "./bundle-url";
import { getLoggedUser, login } from "./auth";
import { hasDataFiles, hasExperimentalApi, hasNetworkingApi } from "./location-options";

export function initPlayer() {
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
