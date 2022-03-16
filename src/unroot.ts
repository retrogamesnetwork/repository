export function unroot() {
    const els = document.querySelectorAll("a");
    for (const el of els) {
        if (el.href.startsWith("https://dos.zone")) {
            el.href = el.href.substring("https://dos.zone".length);
        } else if (el.href.startsWith("http://dos.zone")) {
            el.href = el.href.substring("http://dos.zone".length);
        }
    }
}
