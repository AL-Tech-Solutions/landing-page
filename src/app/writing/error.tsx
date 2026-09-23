"use client";

import Link from "next/link";

export default function WritingError({
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	return (
		<main
			id="main-content"
			className="mx-auto flex min-h-screen max-w-[68ch] flex-col justify-center bg-background px-4 py-16"
		>
			<h1 className="text-2xl font-semibold tracking-tight text-foreground">
				Couldn’t load this note
			</h1>
			<p className="mt-3 text-muted">
				Something went wrong while rendering the page. You can try again or
				return to Writing.
			</p>
			<div className="mt-8 flex flex-wrap gap-4">
				<button
					type="button"
					onClick={reset}
					className="inline-flex min-h-[44px] items-center rounded-xl border border-border bg-surface-solid px-4 text-foreground hover:bg-surface-hover"
				>
					Try again
				</button>
				<Link
					href="/writing/"
					className="inline-flex min-h-[44px] items-center text-muted hover:text-foreground"
				>
					Back to Writing
				</Link>
			</div>
		</main>
	);
}
