export function initPlayInApp() {
    const isAndroid = /Android/i.test(navigator.userAgent);
    if (!isAndroid) {
        return;
    }
    if ((window as any).hardware !== undefined) {
        return;
    }

    const playButtons =
        document.getElementsByClassName("hardware-true");
    for (let i = 0; i < playButtons.length; ++i) {
        const button = playButtons[i];
        button.classList.remove("button-green");
        button.classList.add("button-blue");
        button.innerHTML = "Play in App";
        button.attributes.removeNamedItem("data-bundle");
        button.addEventListener("click", (ev) => {
            window.open("https://play.google.com/store/apps/details?id=zone.dos.app", "_blank");
            ev.stopPropagation();
            ev.preventDefault();
        });
    }
}
