import { initSearch } from "./search";
import { initPlayer } from "./player";
import { initAuth } from "./auth";

function init() {
    initDatafilesViewIfNeeded();
    initSearch();
    initPlayer();
    initAuth();
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
