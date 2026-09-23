import Link from "next/link";
import { LiteModeToggle } from "@/components/ui/LiteModeToggle";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import type { WritingTocItem } from "@/data/writing";
import { WritingOnThisPageMenu } from "./WritingToc";

interface WritingArticleBarProps {
	title: string;
	toc: WritingTocItem[];
}

export function WritingArticleBar({ title, toc }: WritingArticleBarProps) {
	return (
		<header className="sticky top-0 z-40 border-b border-border bg-background">
			<div className="mx-auto flex h-[52px] max-w-6xl items-center gap-3 px-4 sm:px-6">
				<Link
					href="/writing/"
					aria-label="Back to Writing"
					className="inline-flex min-h-[44px] shrink-0 items-center text-sm text-muted hover:text-foreground"
				>
					<span aria-hidden>← </span>Writing
				</Link>
				<p
					className="hidden min-w-0 flex-1 truncate text-sm text-foreground sm:block"
					aria-hidden="true"
					title={title}
				>
					{title}
				</p>
				<div className="ml-auto flex items-center">
					<WritingOnThisPageMenu items={toc} />
					<LiteModeToggle />
					<ThemeToggle />
				</div>
			</div>
		</header>
	);
}
