import { initSearch } from "./search";
import { initPlayer } from "./player";
import { initAuth } from "./auth";
import { initCode } from "./code";
import { hasDataFiles, isMobile } from "./location-options";
import { unroot } from "./unroot";
import { initPlayInApp } from "./play-in-app";
import { initLiveFrame } from "./live-frame";

function init() {
    initPlatform();
    initDatafilesViewIfNeeded();
    initSearch();
    initPlayer();
    initLiveFrame();
    initAuth();
    initCode();
}

function initPlatform() {
    if (isMobile()) {
        document.getElementById("mobile-catalog-link")?.classList.remove("gone");
    }
    initPlayInApp();

    if ((window as any).hardware === undefined) {
        if (isMobile()) {
            document.getElementById("android-app-link")?.classList.remove("gone");
        } else {
            document.getElementById("desktop-app-link")?.classList.remove("gone");
        }
        document.getElementById("mobile-android-app-link")?.classList.remove("gone");
    }

    if ((window as any).hardware !== undefined ||
        location.host === "localhost" ||
        location.host[0] === "1") {
        unroot();
    }
}

function initDatafilesViewIfNeeded() {
    if (hasDataFiles()) {
        const el = document.getElementById("datafiles") as HTMLDetailsElement | null;
        if (el) {
            el.classList.remove("gone");
        }
    }
}

init();
