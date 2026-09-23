import { afterEach, describe, expect, it, vi } from "vitest";
import {
	isGoogleAnalyticsCookie,
	loadGoogleAnalytics,
	stopGoogleAnalytics,
} from "@/lib/analytics";

/** Fake GA4 id — never put the production measurement ID in test fixtures. */
const TEST_MEASUREMENT_ID = "G-TEST000000";
const TEST_GA4_COOKIE = `_ga_${TEST_MEASUREMENT_ID.slice(2)}`;
const TEST_GAT_COOKIE = `_gat_gtag_G_${TEST_MEASUREMENT_ID.slice(2)}`;
const GTM_NEEDLE = "googletagmanager.com/gtag/js";

function readGaDisableFlag(win: object): boolean | undefined {
	const key = Object.keys(win).find((name) => name.startsWith("ga-disable-"));
	if (!key) return undefined;
	return Reflect.get(win, key) as boolean | undefined;
}

class FakeScript {
	id = "";
	src = "";
	async = false;
	textContent = "";
	parent: { children: FakeScript[] } | null = null;

	remove() {
		if (!this.parent) return;
		const index = this.parent.children.indexOf(this);
		if (index >= 0) {
			this.parent.children.splice(index, 1);
		}
		this.parent = null;
	}
}

function installBrowser(initialCookies: Record<string, string> = {}) {
	const cookies = new Map(Object.entries(initialCookies));
	const children: FakeScript[] = [];
	const head = {
		children,
		appendChild(el: FakeScript) {
			el.parent = this;
			children.push(el);
			return el;
		},
	};

	const document = {
		head,
		createElement() {
			return new FakeScript();
		},
		querySelector(selector: string) {
			return this.querySelectorAll(selector)[0] ?? null;
		},
		querySelectorAll(selector: string) {
			if (selector.includes(GTM_NEEDLE)) {
				return children.filter((el) => el.src.includes(GTM_NEEDLE));
			}
			return [];
		},
		getElementById(id: string) {
			return children.find((el) => el.id === id) ?? null;
		},
		get cookie() {
			return [...cookies.entries()]
				.map(([name, value]) => `${name}=${value}`)
				.join("; ");
		},
		set cookie(value: string) {
			const [pair, ...attrs] = value.split(";").map((part) => part.trim());
			const eq = pair.indexOf("=");
			const name = eq >= 0 ? pair.slice(0, eq) : pair;
			const cookieValue = eq >= 0 ? pair.slice(eq + 1) : "";
			const expired = attrs.some(
				(attr) =>
					attr.toLowerCase().startsWith("expires=") && attr.includes("1970"),
			);
			if (!name) return;
			if (expired || cookieValue === "") {
				cookies.delete(name);
				return;
			}
			cookies.set(name, cookieValue);
		},
	};

	const gtag = vi.fn();
	const win: {
		location: { hostname: string };
		gtag?: ReturnType<typeof vi.fn>;
	} = {
		location: { hostname: "alytvynenko.net" },
		gtag,
	};

	vi.stubGlobal("window", win);
	vi.stubGlobal("document", document);
	return { win, gtag, children, cookies };
}

afterEach(() => {
	vi.unstubAllGlobals();
});

describe("isGoogleAnalyticsCookie", () => {
	it("matches GA4 and legacy analytics cookies", () => {
		expect(isGoogleAnalyticsCookie("_ga")).toBe(true);
		expect(isGoogleAnalyticsCookie(TEST_GA4_COOKIE)).toBe(true);
		expect(isGoogleAnalyticsCookie("_gid")).toBe(true);
		expect(isGoogleAnalyticsCookie("_gat")).toBe(true);
		expect(isGoogleAnalyticsCookie(TEST_GAT_COOKIE)).toBe(true);
	});

	it("does not match essential site storage keys", () => {
		expect(isGoogleAnalyticsCookie("cookie-consent")).toBe(false);
		expect(isGoogleAnalyticsCookie("theme")).toBe(false);
		expect(isGoogleAnalyticsCookie("reduce-effects")).toBe(false);
	});
});

describe("loadGoogleAnalytics", () => {
	it("is a no-op without a document (SSR)", () => {
		expect(() => loadGoogleAnalytics()).not.toThrow();
	});

	it("enables GA and injects the gtag loader and config once", () => {
		const { win, children } = installBrowser();

		loadGoogleAnalytics();
		loadGoogleAnalytics();

		expect(readGaDisableFlag(win)).toBe(false);
		expect(children).toHaveLength(2);
		expect(children[0].src).toMatch(
			/^https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=G-[A-Z0-9]+$/,
		);
		expect(children[0].async).toBe(true);
		expect(children[1].id).toBe("google-analytics");
		expect(children[1].textContent).toMatch(/gtag\('config', 'G-[A-Z0-9]+'\)/);
	});
});

describe("stopGoogleAnalytics", () => {
	it("is a no-op without a window (SSR)", () => {
		expect(() => stopGoogleAnalytics()).not.toThrow();
	});

	it("disables GA, denies consent, removes scripts, and expires only GA cookies", () => {
		const { win, gtag, children, cookies } = installBrowser({
			_ga: "GA1.1.abc",
			_gid: "GA1.2.def",
			[TEST_GA4_COOKIE]: "session",
			theme: "dark",
			"cookie-consent": "accepted",
		});

		loadGoogleAnalytics();
		expect(children).toHaveLength(2);

		stopGoogleAnalytics();

		expect(readGaDisableFlag(win)).toBe(true);
		expect(gtag).toHaveBeenCalledWith("consent", "update", {
			analytics_storage: "denied",
		});
		expect(typeof win.gtag).toBe("function");
		expect(win.gtag).not.toBe(gtag);
		expect(children).toHaveLength(0);
		expect(cookies.has("_ga")).toBe(false);
		expect(cookies.has("_gid")).toBe(false);
		expect(cookies.has(TEST_GA4_COOKIE)).toBe(false);
		expect(cookies.get("theme")).toBe("dark");
		expect(cookies.get("cookie-consent")).toBe("accepted");
	});

	it("does not throw when document.cookie access is denied", () => {
		const { win, children } = installBrowser();
		Object.defineProperty(document, "cookie", {
			configurable: true,
			get() {
				throw new DOMException(
					"Access is denied for this document.",
					"SecurityError",
				);
			},
			set() {
				throw new DOMException(
					"Access is denied for this document.",
					"SecurityError",
				);
			},
		});

		loadGoogleAnalytics();
		expect(() => stopGoogleAnalytics()).not.toThrow();
		expect(readGaDisableFlag(win)).toBe(true);
		expect(children).toHaveLength(0);
	});

	it("does not throw when gtag is missing, then load can inject again", () => {
		const { win, children } = installBrowser();
		delete (win as { gtag?: unknown }).gtag;

		loadGoogleAnalytics();
		expect(() => stopGoogleAnalytics()).not.toThrow();
		expect(children).toHaveLength(0);

		loadGoogleAnalytics();
		expect(children).toHaveLength(2);
	});
});
