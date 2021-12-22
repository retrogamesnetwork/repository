import { initSearch } from "./search";
import { initPlayer } from "./player";
import { initAuth } from "./auth";

function init() {
    initPlatform();
    initDatafilesViewIfNeeded();
    initSearch();
    initPlayer();
    initAuth();
}

function initPlatform() {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
        document.getElementById("mobile-catalog-link")?.classList.remove("gone");
    } else {
        document.getElementById("catalog-link")?.classList.remove("gone");
    }

    if ((window as any).hardware === undefined) {
        document.getElementById("android-app-link")?.classList.remove("gone");
    }
}

function initDatafilesViewIfNeeded() {
    if ((window.location.search || "").indexOf("datafiles=true") >= 0) {
        const el = document.getElementById("datafiles") as HTMLDetailsElement | null;
        if (el) {
            el.open = true;
        }
    }
}

init();
