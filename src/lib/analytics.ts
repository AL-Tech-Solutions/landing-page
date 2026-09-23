const GA_MEASUREMENT_ID = "G-LKHDQT8Z81";

const GA_DISABLE_KEY = `ga-disable-${GA_MEASUREMENT_ID}`;

type AnalyticsWindow = Window & {
	dataLayer?: unknown[];
	gtag?: (...args: unknown[]) => void;
};

function getAnalyticsWindow(): AnalyticsWindow | null {
	if (typeof window === "undefined") return null;
	return window;
}

export function isGoogleAnalyticsCookie(name: string): boolean {
	return (
		name === "_ga" ||
		name.startsWith("_ga_") ||
		name === "_gid" ||
		name.startsWith("_gat")
	);
}

function enableGoogleAnalytics(): void {
	const win = getAnalyticsWindow();
	if (!win) return;
	Object.assign(win, { [GA_DISABLE_KEY]: false });
}

export function loadGoogleAnalytics(): void {
	if (typeof document === "undefined") return;
	enableGoogleAnalytics();

	if (!document.querySelector('script[src*="googletagmanager.com/gtag/js"]')) {
		const gtagScript = document.createElement("script");
		gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
		gtagScript.async = true;
		document.head.appendChild(gtagScript);
	}

	if (!document.getElementById("google-analytics")) {
		const configScript = document.createElement("script");
		configScript.id = "google-analytics";
		configScript.textContent = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_MEASUREMENT_ID}');
`;
		document.head.appendChild(configScript);
	}
}

export function stopGoogleAnalytics(): void {
	const win = getAnalyticsWindow();
	if (!win) return;

	Object.assign(win, { [GA_DISABLE_KEY]: true });

	if (typeof win.gtag === "function") {
		win.gtag("consent", "update", { analytics_storage: "denied" });
	}

	win.gtag = () => {};

	document
		.querySelectorAll('script[src*="googletagmanager.com/gtag/js"]')
		.forEach((el) => el.remove());
	document.getElementById("google-analytics")?.remove();

	try {
		const hostname = win.location.hostname;
		const expired = "Thu, 01 Jan 1970 00:00:00 GMT";
		document.cookie.split(";").forEach((entry) => {
			const name = entry.split("=")[0]?.trim();
			if (!name || !isGoogleAnalyticsCookie(name)) return;
			document.cookie = `${name}=; expires=${expired}; path=/`;
			document.cookie = `${name}=; expires=${expired}; path=/; domain=${hostname}`;
			document.cookie = `${name}=; expires=${expired}; path=/; domain=.${hostname}`;
		});
	} catch (err) {
		console.error("Failed to expire analytics cookies:", err);
	}
}
