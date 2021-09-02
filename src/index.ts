import { initSearch } from "./search";
import { initPlayer } from "./player";

function init() {
	initDatafilesViewIfNeeded();
	initSearch();
	initPlayer();
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