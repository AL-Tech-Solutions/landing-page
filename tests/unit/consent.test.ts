import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { stopGoogleAnalytics } = vi.hoisted(() => ({
	stopGoogleAnalytics: vi.fn(),
}));

vi.mock("@/lib/analytics", () => ({
	stopGoogleAnalytics,
}));

import {
	getConsentServerSnapshot,
	getConsentSnapshot,
	reopenConsent,
	setStoredConsent,
	subscribeToConsent,
} from "@/lib/consent";

function installLocalStorage() {
	const store = new Map<string, string>();
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

const unsubscribers: Array<() => void> = [];

beforeEach(() => {
	installLocalStorage();
	stopGoogleAnalytics.mockReset();
});

afterEach(() => {
	unsubscribers.splice(0).forEach((unsubscribe) => unsubscribe());
	vi.unstubAllGlobals();
});

describe("getConsentSnapshot", () => {
	it("returns accepted or rejected only", () => {
		localStorage.setItem("cookie-consent", "accepted");
		expect(getConsentSnapshot()).toBe("accepted");

		localStorage.setItem("cookie-consent", "rejected");
		expect(getConsentSnapshot()).toBe("rejected");
	});

	it("treats missing and invalid values as no choice", () => {
		expect(getConsentSnapshot()).toBeNull();

		for (const invalid of ["", "true", "yes", "Accepted", "1", "denied"]) {
			localStorage.setItem("cookie-consent", invalid);
			expect(getConsentSnapshot()).toBeNull();
		}
	});
});

describe("getConsentServerSnapshot", () => {
	it("is always null so SSR never treats analytics as accepted", () => {
		expect(getConsentServerSnapshot()).toBeNull();
		localStorage.setItem("cookie-consent", "accepted");
		expect(getConsentServerSnapshot()).toBeNull();
	});
});

describe("setStoredConsent", () => {
	it("persists the choice and notifies subscribers", () => {
		const listener = vi.fn();
		unsubscribers.push(subscribeToConsent(listener));

		setStoredConsent("accepted");
		expect(localStorage.getItem("cookie-consent")).toBe("accepted");
		expect(getConsentSnapshot()).toBe("accepted");
		expect(listener).toHaveBeenCalledTimes(1);
		expect(stopGoogleAnalytics).not.toHaveBeenCalled();

		setStoredConsent("rejected");
		expect(localStorage.getItem("cookie-consent")).toBe("rejected");
		expect(listener).toHaveBeenCalledTimes(2);
	});

	it("does not notify after unsubscribe", () => {
		const listener = vi.fn();
		const unsubscribe = subscribeToConsent(listener);
		unsubscribe();

		setStoredConsent("accepted");
		expect(listener).not.toHaveBeenCalled();
	});
});

describe("denied DOM storage", () => {
	it("treats blocked localStorage as no choice and still notifies", () => {
		const denied = () => {
			throw new DOMException("The operation is insecure.", "SecurityError");
		};
		vi.stubGlobal("localStorage", {
			getItem: denied,
			setItem: denied,
			removeItem: denied,
		});

		const listener = vi.fn();
		unsubscribers.push(subscribeToConsent(listener));

		expect(getConsentSnapshot()).toBeNull();
		expect(() => setStoredConsent("accepted")).not.toThrow();
		expect(listener).toHaveBeenCalledTimes(1);
		expect(getConsentSnapshot()).toBeNull();

		listener.mockClear();
		expect(() => reopenConsent()).not.toThrow();
		expect(stopGoogleAnalytics).toHaveBeenCalledTimes(1);
		expect(listener).toHaveBeenCalledTimes(1);
	});
});

describe("reopenConsent", () => {
	it("unloads GA, clears the stored choice, and notifies", () => {
		const listener = vi.fn();
		unsubscribers.push(subscribeToConsent(listener));
		setStoredConsent("accepted");
		listener.mockClear();
		stopGoogleAnalytics.mockClear();

		reopenConsent();

		expect(stopGoogleAnalytics).toHaveBeenCalledTimes(1);
		expect(localStorage.getItem("cookie-consent")).toBeNull();
		expect(getConsentSnapshot()).toBeNull();
		expect(listener).toHaveBeenCalledTimes(1);
	});
});
