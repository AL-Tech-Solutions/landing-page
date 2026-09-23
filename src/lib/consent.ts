import { stopGoogleAnalytics } from "@/lib/analytics";
import {
	getLocalStorageItem,
	removeLocalStorageItem,
	setLocalStorageItem,
} from "@/lib/safe-storage";

const CONSENT_KEY = "cookie-consent";

export type ConsentStatus = "accepted" | "rejected" | null;

const consentListeners = new Set<() => void>();

export function subscribeToConsent(callback: () => void) {
	consentListeners.add(callback);
	return () => {
		consentListeners.delete(callback);
	};
}

export function getConsentSnapshot(): ConsentStatus {
	const stored = getLocalStorageItem(CONSENT_KEY);
	if (stored === "accepted" || stored === "rejected") return stored;
	return null;
}

export function getConsentServerSnapshot(): ConsentStatus {
	return null;
}

function notifyConsentListeners() {
	consentListeners.forEach((cb) => cb());
}

export function setStoredConsent(value: "accepted" | "rejected") {
	setLocalStorageItem(CONSENT_KEY, value);
	notifyConsentListeners();
}

export function reopenConsent() {
	stopGoogleAnalytics();
	removeLocalStorageItem(CONSENT_KEY);
	notifyConsentListeners();
}
