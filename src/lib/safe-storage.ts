/**
 * localStorage wrappers that never throw.
 * Chrome/Firefox "Block all cookies" denies DOM storage: even reading
 * `window.localStorage` throws SecurityError. useSyncExternalStore snapshots
 * run during render, so an unguarded getItem white-screens the app.
 */
function getLocalStorage(): Storage | null {
	try {
		return globalThis.localStorage;
	} catch {
		return null;
	}
}

export function getLocalStorageItem(key: string): string | null {
	try {
		return getLocalStorage()?.getItem(key) ?? null;
	} catch {
		return null;
	}
}

export function setLocalStorageItem(key: string, value: string): boolean {
	try {
		const storage = getLocalStorage();
		if (!storage) return false;
		storage.setItem(key, value);
		return true;
	} catch (err) {
		console.error("Failed to persist localStorage key:", key, err);
		return false;
	}
}

export function removeLocalStorageItem(key: string): boolean {
	try {
		const storage = getLocalStorage();
		if (!storage) return false;
		storage.removeItem(key);
		return true;
	} catch (err) {
		console.error("Failed to remove localStorage key:", key, err);
		return false;
	}
}
