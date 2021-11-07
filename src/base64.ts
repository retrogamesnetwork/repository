import * as base64 from "base64-js";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export function stringToBase64(input: string): string {
    return base64.fromByteArray(encoder.encode(input));
}

export function base64ToString(input: string): string {
    return decoder.decode(base64.toByteArray(input));
}
