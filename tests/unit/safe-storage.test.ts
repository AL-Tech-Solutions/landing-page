import { afterEach, describe, expect, it, vi } from "vitest";
import {
	getLocalStorageItem,
	removeLocalStorageItem,
	setLocalStorageItem,
} from "@/lib/safe-storage";

function installStorage(store: Map<string, string>) {
	vi.stubGlobal("localStorage", {
		getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
		setItem: (key: string, value: string) => {
			store.set(key, String(value));
		},
		removeItem: (key: string) => {
			store.delete(key);
		},
	});
}

afterEach(() => {
	vi.unstubAllGlobals();
	vi.restoreAllMocks();
});

describe("safe-storage", () => {
	it("reads, writes, and removes when storage works", () => {
		const store = new Map<string, string>();
		installStorage(store);

		expect(getLocalStorageItem("theme")).toBeNull();
		expect(setLocalStorageItem("theme", "dark")).toBe(true);
		expect(getLocalStorageItem("theme")).toBe("dark");
		expect(removeLocalStorageItem("theme")).toBe(true);
		expect(getLocalStorageItem("theme")).toBeNull();
	});

	it("returns null and does not throw when accessing localStorage throws", () => {
		const denied = new DOMException(
			"Failed to read the 'localStorage' property from 'Window': Access is denied for this document.",
			"SecurityError",
		);
		vi.stubGlobal("localStorage", {
			get getItem() {
				throw denied;
			},
			get setItem() {
				throw denied;
			},
			get removeItem() {
				throw denied;
			},
		});
		Object.defineProperty(globalThis, "localStorage", {
			configurable: true,
			get() {
				throw denied;
			},
		});

		expect(getLocalStorageItem("cookie-consent")).toBeNull();
		expect(setLocalStorageItem("cookie-consent", "accepted")).toBe(false);
		expect(removeLocalStorageItem("cookie-consent")).toBe(false);
	});

	it("returns null when getItem itself throws", () => {
		vi.stubGlobal("localStorage", {
			getItem: () => {
				throw new DOMException("The operation is insecure.", "SecurityError");
			},
			setItem: () => {
				throw new DOMException("The operation is insecure.", "SecurityError");
			},
			removeItem: () => {
				throw new DOMException("The operation is insecure.", "SecurityError");
			},
		});

		expect(getLocalStorageItem("reduce-effects")).toBeNull();
		expect(setLocalStorageItem("reduce-effects", "true")).toBe(false);
		expect(removeLocalStorageItem("reduce-effects")).toBe(false);
	});
});
