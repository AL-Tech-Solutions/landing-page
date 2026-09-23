import type { WritingTocItem } from "@/data/writing";

interface WritingTocProps {
	items: WritingTocItem[];
	id?: string;
	className?: string;
}

export function WritingToc({ items, id, className = "" }: WritingTocProps) {
	return (
		<nav id={id} aria-label="On this page" className={className}>
			<h2 className="text-xs font-medium uppercase tracking-wide text-muted">
				On this page
			</h2>
			<ol className="mt-3 space-y-2">
				{items.map((item) => (
					<li key={item.id}>
						<a
							href={`#${item.id}`}
							className="inline-flex min-h-[44px] items-center text-sm text-muted hover:text-foreground"
						>
							{item.label}
						</a>
					</li>
				))}
			</ol>
		</nav>
	);
}

export function WritingOnThisPageMenu({ items }: { items: WritingTocItem[] }) {
	return (
		<details className="relative">
			<summary className="flex min-h-[44px] cursor-pointer list-none items-center text-sm text-muted hover:text-foreground [&::-webkit-details-marker]:hidden">
				On this page
			</summary>
			<ol className="absolute right-0 z-50 mt-1 w-64 rounded-xl border border-border bg-background p-3 shadow-none">
				{items.map((item) => (
					<li key={item.id}>
						<a
							href={`#${item.id}`}
							className="flex min-h-[44px] items-center px-2 text-sm text-muted hover:text-foreground"
						>
							{item.label}
						</a>
					</li>
				))}
			</ol>
		</details>
	);
}
