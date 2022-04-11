import { hasLive, isMobile } from "./location-options";

let linkPrefixSet: boolean = false;
let gameNameSet: boolean = false;

export function initLiveFrame() {
    const isMultiplayerPage = location.href.indexOf("/multiplayer/") >= 0;
    if ((isMobile() && !hasLive()) && !isMultiplayerPage) {
        return;
    }

    const frame = document.getElementsByClassName("live-frame")[0] as HTMLIFrameElement;
    const chat = document.getElementsByClassName("chat")[0] as HTMLDivElement;
    const maximizeChat = document.getElementsByClassName("chat-maxi")[0] as HTMLDivElement;
    const minimizeChat = document.getElementsByClassName("chat-mini")[0] as HTMLDivElement;
    const jsdos = document.getElementsByClassName("jsdos-iframe")[0] as HTMLIFrameElement;

    let networkToken: string | null = null;
    let roomName: string | null = null;

    function updateRoomName() {
        if (networkToken === null || networkToken === roomName) {
            return;
        }

        if (frame.contentWindow === null) {
            return;
        }

        roomName = networkToken;
        frame.contentWindow.postMessage({
            message: "live-set-room",
            room: "net/" + roomName,
            label: "Join chat",
        }, "*");
    }

    chat.classList.remove("gone");

    chat.addEventListener("click", (e) => {
        if (maximizeChat.classList.contains("gone")) {
            maximizeChat.classList.remove("gone");
            minimizeChat.classList.add("gone");
            frame.classList.add("gone");
        } else {
            maximizeChat.classList.add("gone");
            minimizeChat.classList.remove("gone");
            frame.classList.remove("gone");

            const linkIntervalId = setInterval(() => {
                if (frame.contentWindow === null) {
                    return;
                }

                if (linkPrefixSet === false) {
                    frame.contentWindow.postMessage({
                        message: "live-link-prefix",
                        liveLinkPrefix: "https://dos.zone/stream/",
                    }, "*");
                    linkPrefixSet = true;
                }

                if (gameNameSet === false) {
                    // eslint-disable-next-line
                    const title = (document.querySelector("meta[name='twitter:title']") as HTMLMetaElement | null)?.content || "";
                    const game = title.substring(0, title.indexOf("|") - 1);
                    // eslint-disable-next-line
                    const image = (document.querySelector("meta[name='twitter:image']") as HTMLMetaElement | null)?.content || "";

                    frame.contentWindow.postMessage({
                        message: "live-set-game",
                        game: JSON.stringify({
                            game,
                            image,
                        }),
                    }, "*");
                    gameNameSet = true;
                }

                updateRoomName();
                clearInterval(linkIntervalId);
            }, 1000);
        }

        e.preventDefault();
        e.stopPropagation();
    });

    window.addEventListener("message", (e) => {
        if (e.data.message === "live-capture-canvas" ||
            e.data.message === "live-capture-stop") {
            jsdos.contentWindow?.postMessage(e.data, "*");
        }

        if (e.data.message === "jsdos-network-token") {
            networkToken = e.data.token;
            updateRoomName();
        }
    });

    if (isMultiplayerPage) {
        setInterval(() => {
            jsdos.contentWindow?.postMessage({ message: "jsdos-get-network-token" }, "*");
        }, 1000);
    }

    setTimeout(() => {
        chat.classList.remove("from-yellow-400", "via-red-500", "to-pink-500");
        chat.classList.add("from-gray-400", "via-gray-500", "to-gray-600");
    }, 5000);
}
