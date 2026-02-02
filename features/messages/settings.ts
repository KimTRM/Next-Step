"use client";

export type MsgSettings = {
    muted: string[];
    pinned: string[];
    blocked: string[];
};

const KEY = "messages:settings:v1";

function defaultSettings(): MsgSettings {
    return { muted: [], pinned: [], blocked: [] };
}

export function getSettings(): MsgSettings {
    if (typeof window === "undefined") return defaultSettings();
    try {
        const raw = localStorage.getItem(KEY);
        if (!raw) return defaultSettings();
        return JSON.parse(raw) as MsgSettings;
    } catch (e) {
        return defaultSettings();
    }
}

export function saveSettings(s: MsgSettings) {
    if (typeof window === "undefined") return;
    try {
        localStorage.setItem(KEY, JSON.stringify(s));
        // notify other parts of the app
        window.dispatchEvent(new Event("messages:settings:changed"));
    } catch (e) {
        // ignore
    }
}

export function addMuted(id: string) {
    const s = getSettings();
    if (!s.muted.includes(id)) s.muted.push(id);
    saveSettings(s);
}

export function removeMuted(id: string) {
    const s = getSettings();
    s.muted = s.muted.filter((x) => x !== id);
    saveSettings(s);
}

export function addPinned(id: string) {
    const s = getSettings();
    if (!s.pinned.includes(id)) s.pinned.push(id);
    saveSettings(s);
}

export function removePinned(id: string) {
    const s = getSettings();
    s.pinned = s.pinned.filter((x) => x !== id);
    saveSettings(s);
}

export function addBlocked(id: string) {
    const s = getSettings();
    if (!s.blocked.includes(id)) s.blocked.push(id);
    saveSettings(s);
}

export function removeBlocked(id: string) {
    const s = getSettings();
    s.blocked = s.blocked.filter((x) => x !== id);
    saveSettings(s);
}

export function isMuted(id: string) {
    return getSettings().muted.includes(id);
}

export function isPinned(id: string) {
    return getSettings().pinned.includes(id);
}

export function isBlocked(id: string) {
    return getSettings().blocked.includes(id);
}
