import type { ReactNode } from "react";
import Link from "next/link";
import type { WritingNote, WritingTocItem } from "@/data/writing";
import {
	WRITING_SECTION_IDS,
	WRITING_SECTION_LABELS,
	WRITING_TYPE_LABELS,
} from "@/data/writing";
import { formatWritingDate } from "@/lib/writing";
import { WritingAssistantsAside } from "./WritingAssistantsAside";
import { WritingDeps } from "./WritingDeps";
import { WritingPrompts } from "./WritingPrompts";
import { WritingToc } from "./WritingToc";

interface WritingArticleProps {
	note: WritingNote;
	toc: WritingTocItem[];
	bodyContent: ReactNode;
	tldrContent: ReactNode;
	faqContent: ReactNode;
}

export function WritingArticle({
	note,
	toc,
	bodyContent,
	tldrContent,
	faqContent,
}: WritingArticleProps) {
	const showRelated =
		note.relatedExperience.length > 0 || Boolean(note.sourceRepo);

	return (
		<div className="mx-auto grid max-w-6xl grid-cols-1 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start lg:gap-x-16">
			<header className="min-w-0">
				<div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
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
				<h1 className="mt-4 text-[length:var(--font-writing-h1)] font-semibold tracking-tight text-foreground">
					{note.title}
				</h1>
				<p className="mt-4 max-w-[68ch] text-[length:var(--font-writing-body)] leading-[1.7] text-muted">
					{note.summary}
				</p>
				{note.sourceRepo && (
					<p className="mt-3 text-sm text-muted">
						<a
							href={note.sourceRepo}
							target="_blank"
							rel="noopener noreferrer"
							className="hover:text-foreground"
						>
							Source repository
						</a>
					</p>
				)}
			</header>

			<div className="mt-8 hidden min-w-0 lg:sticky lg:top-[4.5rem] lg:mt-0 lg:block lg:col-start-2 lg:row-start-1 lg:row-span-2">
				<WritingToc items={toc} id={WRITING_SECTION_IDS.onThisPage} />
				{note.deps.length > 0 && (
					<div className="mt-8 border-t border-border pt-4">
						<p className="text-xs font-medium uppercase tracking-wide text-muted">
							{WRITING_SECTION_LABELS.dependencies}
						</p>
						<WritingDeps deps={note.deps} compact />
					</div>
				)}
			</div>

			<article className="writing-prose mt-10 min-w-0 max-w-[68ch] lg:col-start-1 lg:mt-10">
				<aside
					className="my-6 border-l-2 border-muted pl-4"
					aria-label="AI summary"
				>
					<p className="text-xs font-medium uppercase tracking-wide text-muted">
						Summary
					</p>
					{note.aiSummary.length === 1 ? (
						<p className="mt-2 text-[length:var(--font-writing-body)] leading-[1.7] text-foreground">
							{note.aiSummary[0]}
						</p>
					) : (
						<ul className="mt-2 list-disc space-y-2 pl-5 text-[length:var(--font-writing-body)] leading-[1.7] text-foreground">
							{note.aiSummary.map((item) => (
								<li key={item}>{item}</li>
							))}
						</ul>
					)}
					{note.aiAudience && (
						<p className="mt-3 text-sm leading-[1.7] text-muted">
							{note.aiAudience}
						</p>
					)}
				</aside>

				{note.prerequisites.length > 0 && (
					<section className="mt-10">
						<h2
							id={WRITING_SECTION_IDS.prerequisites}
							className="scroll-mt-[4.5rem] text-[length:var(--font-writing-h2)] font-semibold tracking-tight text-foreground"
						>
							{WRITING_SECTION_LABELS.prerequisites}
						</h2>
						<ul className="mt-4 list-disc space-y-2 pl-5">
							{note.prerequisites.map((item) => (
								<li key={item}>{item}</li>
							))}
						</ul>
					</section>
				)}

				{note.deps.length > 0 && (
					<section className="mt-10">
						<h2
							id={WRITING_SECTION_IDS.dependencies}
							className="scroll-mt-[4.5rem] text-[length:var(--font-writing-h2)] font-semibold tracking-tight text-foreground"
						>
							{WRITING_SECTION_LABELS.dependencies}
						</h2>
						<WritingDeps deps={note.deps} />
					</section>
				)}

				<div className="mt-10">{bodyContent}</div>

				{note.prompts.length > 0 && (
					<section className="mt-10">
						<h2
							id={WRITING_SECTION_IDS.prompts}
							className="scroll-mt-[4.5rem] text-[length:var(--font-writing-h2)] font-semibold tracking-tight text-foreground"
						>
							{WRITING_SECTION_LABELS.prompts}
						</h2>
						<WritingPrompts prompts={note.prompts} />
					</section>
				)}

				{note.verify.length > 0 && (
					<section className="mt-10">
						<h2
							id={WRITING_SECTION_IDS.verify}
							className="scroll-mt-[4.5rem] text-[length:var(--font-writing-h2)] font-semibold tracking-tight text-foreground"
						>
							{WRITING_SECTION_LABELS.verify}
						</h2>
						<ol className="mt-4 list-decimal space-y-2 pl-5">
							{note.verify.map((item) => (
								<li key={item}>{item}</li>
							))}
						</ol>
					</section>
				)}

				{note.cleanup.length > 0 && (
					<section className="mt-10">
						<h2
							id={WRITING_SECTION_IDS.cleanup}
							className="scroll-mt-[4.5rem] text-[length:var(--font-writing-h2)] font-semibold tracking-tight text-foreground"
						>
							{WRITING_SECTION_LABELS.cleanup}
						</h2>
						<ol className="mt-4 list-decimal space-y-2 pl-5">
							{note.cleanup.map((item) => (
								<li key={item}>{item}</li>
							))}
						</ol>
					</section>
				)}

				{note.securityNotes.length > 0 && (
					<section className="mt-10">
						<h2
							id={WRITING_SECTION_IDS.security}
							className="scroll-mt-[4.5rem] text-[length:var(--font-writing-h2)] font-semibold tracking-tight text-foreground"
						>
							{WRITING_SECTION_LABELS.security}
						</h2>
						<ul className="mt-4 list-disc space-y-2 pl-5">
							{note.securityNotes.map((item) => (
								<li key={item}>{item}</li>
							))}
						</ul>
					</section>
				)}

				{showRelated && (
					<section className="mt-10">
						<h2
							id={WRITING_SECTION_IDS.related}
							className="scroll-mt-[4.5rem] text-[length:var(--font-writing-h2)] font-semibold tracking-tight text-foreground"
						>
							{WRITING_SECTION_LABELS.related}
						</h2>
						<ul className="mt-4 list-disc space-y-2 pl-5">
							{note.relatedExperience.map((item) => (
								<li key={item.id}>
									<Link
										href="/#experience"
										className="text-accent hover:underline"
									>
										{item.title}
									</Link>
									<span className="text-muted"> · {item.company}</span>
								</li>
							))}
							{note.sourceRepo && (
								<li>
									<a
										href={note.sourceRepo}
										target="_blank"
										rel="noopener noreferrer"
										className="text-accent hover:underline"
									>
										Source repository
									</a>
								</li>
							)}
						</ul>
					</section>
				)}

				{tldrContent && (
					<section className="mt-10">
						<h2
							id={WRITING_SECTION_IDS.tldr}
							className="scroll-mt-[4.5rem] text-[length:var(--font-writing-h2)] font-semibold tracking-tight text-foreground"
						>
							{WRITING_SECTION_LABELS.tldr}
						</h2>
						<div className="mt-4">{tldrContent}</div>
					</section>
				)}

				{faqContent && (
					<section className="mt-10">
						<h2
							id={WRITING_SECTION_IDS.faq}
							className="scroll-mt-[4.5rem] text-[length:var(--font-writing-h2)] font-semibold tracking-tight text-foreground"
						>
							{WRITING_SECTION_LABELS.faq}
						</h2>
						<div className="mt-4">{faqContent}</div>
					</section>
				)}

				<WritingAssistantsAside
					headingId={WRITING_SECTION_IDS.assistants}
					className="mt-12"
				/>
			</article>
		</div>
	);
}
