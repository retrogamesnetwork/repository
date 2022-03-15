import { cdnEndPoint, cdnUrl } from "./cdn";

export function extractBundleUrl(el: HTMLElement): string | null {
    if (el.dataset.bundle !== undefined) {
        const bundleUrl = el.dataset.bundle;
        return bundleUrl.startsWith("https://") ? bundleUrl : cdnEndPoint + decodeURIComponent(bundleUrl);
    }

    const href = (el as HTMLAnchorElement).href;
    if (href === undefined) {
        return null;
    }

    const index = href.indexOf("/my/");
    if (index === -1) {
        return null;
    }

    const url = decodeURIComponent(href.substring(index + "/my/".length));
    return url.startsWith("https://") ? cdnUrl(url) : cdnEndPoint + url;
}
