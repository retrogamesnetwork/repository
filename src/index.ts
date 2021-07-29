import { initSearch } from "./search";

function init() {
	initDatafilesViewIfNeeded();
	initSearch();
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