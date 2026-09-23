import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	LITE_MODE_STORAGE_KEY,
	detectLowEndDevice,
	getReduceEffectsServerSnapshot,
	getReduceEffectsSnapshot,
	setStoredReduceEffects,
	subscribeToReduceEffects,
} from "@/components/providers/ReduceEffectsProvider";

const unsubscribers: Array<() => void> = [];

function installLocalStorage(initial: Record<string, string> = {}) {
	const store = new Map(Object.entries(initial));
	vi.stubGlobal("localStorage", {
		getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
		setItem: (key: string, value: string) => {
			store.set(key, String(value));
		},
		removeItem: (key: string) => {
			store.delete(key);
		},
		clear: () => {
			store.clear();
		},
	});
	return store;
}

function installDevice(
	options: {
		prefersReducedMotion?: boolean;
		deviceMemory?: number;
		hardwareConcurrency?: number;
		saveData?: boolean;
	} = {},
) {
	const {
		prefersReducedMotion = false,
		deviceMemory,
		hardwareConcurrency,
		saveData,
	} = options;

	vi.stubGlobal("window", {
		matchMedia: (query: string) => ({
			matches:
				query === "(prefers-reduced-motion: reduce)" && prefersReducedMotion,
		}),
	});
	vi.stubGlobal("navigator", {
		deviceMemory,
		hardwareConcurrency,
		connection: saveData === undefined ? undefined : { saveData },
	});
}

beforeEach(() => {
	installLocalStorage();
});

afterEach(() => {
	unsubscribers.splice(0).forEach((unsubscribe) => unsubscribe());
	vi.unstubAllGlobals();
});

describe("detectLowEndDevice", () => {
	it("is false during SSR when window is missing", () => {
		expect(detectLowEndDevice()).toBe(false);
	});

	it("is true when the OS asks for reduced motion, even on a high-end device", () => {
		installDevice({
			prefersReducedMotion: true,
			deviceMemory: 16,
			hardwareConcurrency: 16,
			saveData: false,
		});
		expect(detectLowEndDevice()).toBe(true);
	});

	it("is true at the 4 GB / 4 core thresholds and false just above", () => {
		installDevice({ deviceMemory: 4, hardwareConcurrency: 16 });
		expect(detectLowEndDevice()).toBe(true);

		installDevice({ deviceMemory: 5, hardwareConcurrency: 16 });
		expect(detectLowEndDevice()).toBe(false);

		installDevice({ deviceMemory: 16, hardwareConcurrency: 4 });
		expect(detectLowEndDevice()).toBe(true);

		installDevice({ deviceMemory: 16, hardwareConcurrency: 5 });
		expect(detectLowEndDevice()).toBe(false);
	});

	it("treats Save-Data as low-end and ignores a missing or zero memory/core signal", () => {
		installDevice({ saveData: true, hardwareConcurrency: 16 });
		expect(detectLowEndDevice()).toBe(true);

		installDevice({
			deviceMemory: 0,
			hardwareConcurrency: 0,
			saveData: false,
		});
		expect(detectLowEndDevice()).toBe(false);
	});
});

describe("getReduceEffectsSnapshot", () => {
	it("lets an explicit stored choice override hardware detection", () => {
		installDevice({
			prefersReducedMotion: true,
			deviceMemory: 2,
			hardwareConcurrency: 2,
			saveData: true,
		});
		installLocalStorage({ [LITE_MODE_STORAGE_KEY]: "false" });
		expect(getReduceEffectsSnapshot()).toBe(false);

		installDevice({
			deviceMemory: 16,
			hardwareConcurrency: 16,
			saveData: false,
		});
		installLocalStorage({ [LITE_MODE_STORAGE_KEY]: "true" });
		expect(getReduceEffectsSnapshot()).toBe(true);
	});

	it("falls back to detection when the key is missing, and treats other strings as off", () => {
		installDevice({ deviceMemory: 2, hardwareConcurrency: 16 });
		expect(getReduceEffectsSnapshot()).toBe(true);

		installLocalStorage({ [LITE_MODE_STORAGE_KEY]: "yes" });
		expect(getReduceEffectsSnapshot()).toBe(false);
	});
});

describe("getReduceEffectsServerSnapshot", () => {
	it("is always false so SSR never auto-enables Lite Mode", () => {
		expect(getReduceEffectsServerSnapshot()).toBe(false);
		installLocalStorage({ [LITE_MODE_STORAGE_KEY]: "true" });
		expect(getReduceEffectsServerSnapshot()).toBe(false);
	});
});

describe("setStoredReduceEffects", () => {
	it("persists the boolean as a string and notifies subscribers", () => {
		const store = installLocalStorage();
		const listener = vi.fn();
		unsubscribers.push(subscribeToReduceEffects(listener));

		setStoredReduceEffects(true);
		expect(store.get(LITE_MODE_STORAGE_KEY)).toBe("true");
		expect(getReduceEffectsSnapshot()).toBe(true);
		expect(listener).toHaveBeenCalledTimes(1);

		setStoredReduceEffects(false);
		expect(store.get(LITE_MODE_STORAGE_KEY)).toBe("false");
		expect(getReduceEffectsSnapshot()).toBe(false);
		expect(listener).toHaveBeenCalledTimes(2);
	});

	it("does not notify after unsubscribe", () => {
		installLocalStorage();
		const listener = vi.fn();
		const unsubscribe = subscribeToReduceEffects(listener);
		unsubscribe();

		setStoredReduceEffects(true);
		expect(listener).not.toHaveBeenCalled();
	});
});
