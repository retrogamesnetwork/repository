import { extractBundleUrl } from "./bundle-url";
import { hasExperimentalApi } from "./location-options";

export function initCode() {
    const code = document.getElementsByClassName("jsdos-code")[0] as HTMLDivElement;
    const pre = document.getElementsByClassName("jsdos-code-pre")[0] as HTMLIFrameElement;
    const close = document.getElementsByClassName("jsdos-code-close")[0] as HTMLIFrameElement;

    if (!code || !pre || !close) {
        return;
    }

    close.addEventListener("click", (ev) => {
        code.classList.add("gone");
        ev.stopPropagation();
        ev.preventDefault();
    }, {
        capture: true,
    });

    const buttons = document.getElementsByClassName("jsdos-code-button");
    if (buttons.length === 0) {
        return;
    }

    for (let i = 0; i < buttons.length; ++i) {
        const el = buttons[i] as HTMLElement;
        el.addEventListener("click", (ev) => {
            const bundleUrl = extractBundleUrl(el);
            if (bundleUrl === null) {
                return;
            }

            const src = "https://dos.zone/player/?bundleUrl=" + encodeURIComponent(bundleUrl) +
                "?anonymous=1" +
                 (hasExperimentalApi() ? "&experimental=1" : "");

            pre.innerText = `
<iframe
    width="680"
    height="400"
    frameborder="0"
    src="${src}"
    allowfullscreen>
</iframe>           
<!--
  Message 'dz-player-exit' will be fired when js-dos is exited:
  
    window.addEventListener("message", (e) => {
        if (e.data.message === "dz-player-exit") {
            // ...
        }
    });
--> 
`;
            code.classList.remove("gone");

            ev.stopPropagation();
            ev.preventDefault();
        }, {
            capture: true,
        });
    }
}
