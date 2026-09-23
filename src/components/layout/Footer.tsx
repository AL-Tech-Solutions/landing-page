import Link from "next/link";
import { CookieSettingsButton } from "@/components/ui/CookieSettingsButton";
import { profile } from "@/data/profile";
import { socialIconPaths } from "@/lib/iconPaths";

export function Footer() {
	return (
		<footer className="border-t border-border bg-surface py-12">
			<div className="mx-auto max-w-6xl px-4 sm:px-6">
				<div className="mb-8 flex flex-wrap justify-center gap-6">
					{profile.trustBadges.map((badge) => (
						<span
							key={badge.title}
							className="flex items-center gap-2 text-sm text-muted"
							title={badge.title}
						>
							<svg
								className="h-4 w-4 text-accent"
								fill="currentColor"
								viewBox="0 0 24 24"
								aria-hidden
							>
								{badge.icon === "shield" && (
									<path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
								)}
								{badge.icon === "briefcase" && (
									<path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z" />
								)}
								{badge.icon === "map-marker" && (
									<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
								)}
							</svg>
							{badge.title}
						</span>
					))}
				</div>
				<p className="mb-4 text-center text-sm text-muted">
					Copyright &copy; 2022-2026 Andrii Lytvynenko
				</p>
				<p className="mb-8 text-center text-sm text-muted">
					<Link
						href="/privacy-policy"
						className="inline-flex min-h-[44px] items-center hover:text-foreground"
					>
						Privacy Policy
					</Link>
					{" · "}
					<Link
						href="/cookie-policy"
						className="inline-flex min-h-[44px] items-center hover:text-foreground"
					>
						Cookie Policy
					</Link>
					{" · "}
					<CookieSettingsButton />
					{" · "}
					<Link
						href="/writing/"
						className="inline-flex min-h-[44px] items-center hover:text-foreground"
					>
						Writing
					</Link>
					{" · "}
					<a
						href="/writing/llms.txt"
						className="inline-flex min-h-[44px] items-center hover:text-foreground focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
					>
						For assistants
					</a>
				</p>
				<ul className="flex justify-center gap-6">
					<li>
						<a
							href={`mailto:${profile.email}`}
							className="flex min-h-[44px] min-w-[44px] items-center justify-center text-muted transition-colors hover:text-foreground"
							aria-label="Send email"
						>
							<svg
								className="h-6 w-6"
								fill="currentColor"
								viewBox="0 0 24 24"
								aria-hidden
							>
								<path d={socialIconPaths.email} />
							</svg>
						</a>
					</li>
					{profile.footerSocialLinks.map((link) => (
						<li key={link.name}>
							<a
								href={link.url}
								target="_blank"
								rel="noopener noreferrer"
								className="flex min-h-[44px] min-w-[44px] items-center justify-center text-muted transition-colors hover:text-foreground"
								aria-label={`Visit ${link.name} profile`}
							>
								<svg
									className="h-6 w-6"
									fill="currentColor"
									viewBox="0 0 24 24"
									aria-hidden
								>
									<path d={socialIconPaths[link.icon] || ""} />
								</svg>
							</a>
						</li>
					))}
				</ul>
			</div>
		</footer>
	);
}
