"use client";

import {
	createContext,
	useCallback,
	useContext,
	useSyncExternalStore,
} from "react";
import { getLocalStorageItem, setLocalStorageItem } from "@/lib/safe-storage";

const LITE_MODE_STORAGE_KEY = "reduce-effects";

function detectLowEndDevice(): boolean {
	if (typeof window === "undefined") return false;

	const prefersReducedMotion = window.matchMedia(
		"(prefers-reduced-motion: reduce)",
	).matches;
	if (prefersReducedMotion) return true;

	const deviceMemory = (navigator as Navigator & { deviceMemory?: number })
		.deviceMemory;
	if (deviceMemory && deviceMemory <= 4) return true;

	const hardwareConcurrency = navigator.hardwareConcurrency;
	if (hardwareConcurrency && hardwareConcurrency <= 4) return true;

	const connection = (
		navigator as Navigator & { connection?: { saveData?: boolean } }
	).connection;
	if (connection?.saveData) return true;

	return false;
}

const reduceEffectsListeners = new Set<() => void>();

function subscribeToReduceEffects(callback: () => void) {
	reduceEffectsListeners.add(callback);
	return () => {
		reduceEffectsListeners.delete(callback);
	};
}

function getReduceEffectsSnapshot(): boolean {
	const stored = getLocalStorageItem(LITE_MODE_STORAGE_KEY);
	if (stored !== null) return stored === "true";
	return detectLowEndDevice();
}

function getReduceEffectsServerSnapshot(): boolean {
	return false;
}

function setStoredReduceEffects(value: boolean) {
	setLocalStorageItem(LITE_MODE_STORAGE_KEY, String(value));
	reduceEffectsListeners.forEach((cb) => cb());
}

interface ReduceEffectsContextValue {
	reduceEffects: boolean;
	setReduceEffects: (value: boolean) => void;
}

const ReduceEffectsContext = createContext<ReduceEffectsContextValue | null>(
	null,
);

export function ReduceEffectsProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const reduceEffects = useSyncExternalStore(
		subscribeToReduceEffects,
		getReduceEffectsSnapshot,
		getReduceEffectsServerSnapshot,
	);

	const setReduceEffects = useCallback((value: boolean) => {
		setStoredReduceEffects(value);
	}, []);

	const value: ReduceEffectsContextValue = {
		reduceEffects,
		setReduceEffects,
	};

	return (
		<ReduceEffectsContext.Provider value={value}>
			{children}
		</ReduceEffectsContext.Provider>
	);
}

export function useReduceEffects(): ReduceEffectsContextValue {
	const context = useContext(ReduceEffectsContext);
	if (!context) {
		throw new Error(
			"useReduceEffects must be used within ReduceEffectsProvider",
		);
	}
	return context;
}
