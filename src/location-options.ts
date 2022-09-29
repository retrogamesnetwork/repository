const href = window.location.href || "";
const host = window.location.host || "";
const search = window.location.search || "";
const mobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

export function hasDataFiles() {
    return search.indexOf("datafiles=true") >= 0;
}

export function hasExperimentalApi() {
    return search.indexOf("experimental=1") >= 0;
}

export function hasNetworkingApi() {
    // @caiiiycuk: TODO reenable this
    return (href.indexOf("/multiplayer/") >= 0 ||
        search.indexOf("networking=1") >= 0) && false;
}

export function hasDirect() {
    return search.indexOf("direct=1") >= 0;
}

export function hasNoWebGL() {
    return search.indexOf("nowebgl=1") >= 0;
}

export function hasShared() {
    return search.indexOf("shared=1") >= 0 ||
        host.startsWith("shd.");
}

export function hasNoShared() {
    return search.indexOf("noshared=1") >= 0;
}

export function hasAnonymous() {
    return search.indexOf("anonymous=1") >= 0;
}

export function hasExit() {
    return search.indexOf("exit=1") >= 0;
}

export function hasLive() {
    return search.indexOf("live=1") >= 0;
}

export function isMobile() {
    return mobile;
}

