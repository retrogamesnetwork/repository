export function hasDataFiles() {
    return (window.location.search || "").indexOf("datafiles=true") >= 0;
}

export function hasExperimentalApi() {
    return (window.location.href || "").indexOf("/multiplayer/") >= 0 ||
        (window.location.search || "").indexOf("experimental=1") >= 0;
}

export function hasDirect() {
    return (window.location.search || "").indexOf("direct=1") >= 0;
}

export function hasNoWebGL() {
    return (window.location.search || "").indexOf("nowebgl=1") >= 0;
}

export function hasShared() {
    return (window.location.search || "").indexOf("shared=1") >= 0;
}

export function hasNoShared() {
    return (window.location.search || "").indexOf("noshared=1") >= 0;
}
