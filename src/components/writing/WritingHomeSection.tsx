import type { WritingNoteMeta } from "@/data/writing";
import { WRITING_HUB_SUBTITLE, WRITING_HUB_TITLE } from "@/data/writing";
import { WritingNoteCard } from "./WritingNoteCard";

export function WritingHomeSection({ notes }: { notes: WritingNoteMeta[] }) {
	if (notes.length === 0) {
		return null;
	}

	return (
		<div className="flex w-full min-w-0 flex-col gap-6">
			<div>
				<h2 className="text-2xl font-bold tracking-tight text-foreground">
					{WRITING_HUB_TITLE}
				</h2>
				<p className="mt-2 text-muted">{WRITING_HUB_SUBTITLE}</p>
			</div>
			<div className="flex flex-col gap-6">
				{notes.map((note) => (
					<WritingNoteCard key={note.slug} note={note} headingLevel="h3" />
				))}
			</div>
		</div>
	);
}
