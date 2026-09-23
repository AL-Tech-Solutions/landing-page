import type { WritingNoteMeta } from "@/data/writing";
import { WRITING_TYPE_LABELS } from "@/data/writing";
import { formatWritingDate, writingArticlePath } from "@/lib/writing";
import Link from "next/link";

interface WritingNoteCardProps {
	note: WritingNoteMeta;
	headingLevel: "h2" | "h3";
}

export function WritingNoteCard({ note, headingLevel }: WritingNoteCardProps) {
	const Heading = headingLevel;
	const articleHref = writingArticlePath(note.slug);

	return (
		<article className="rounded-2xl border border-border bg-surface-solid p-6">
			<div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
				<span className="rounded-full border border-border px-2.5 py-0.5 text-xs tracking-wide">
					{WRITING_TYPE_LABELS[note.type]}
				</span>
				<time dateTime={note.date}>{formatWritingDate(note.date)}</time>
				<span>
					verified{" "}
					<time dateTime={note.lastVerified}>
						{formatWritingDate(note.lastVerified)}
					</time>
				</span>
			</div>
			<Heading className="text-xl font-semibold tracking-tight text-foreground">
				<Link
					href={articleHref}
					className="hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
				>
					{note.title}
				</Link>
			</Heading>
			<p className="mt-2 text-[length:var(--font-writing-body)] leading-[1.7] text-muted">
				{note.summary}
			</p>
		</article>
	);
}
