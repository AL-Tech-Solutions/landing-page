import { WRITING_AI_INSTRUCTION, WRITING_SECTION_LABELS } from "@/data/writing";

interface WritingAssistantsAsideProps {
	headingId?: string;
	className?: string;
}

export function WritingAssistantsAside({
	headingId,
	className = "",
}: WritingAssistantsAsideProps) {
	return (
		<aside
			data-nosnippet=""
			aria-label={WRITING_SECTION_LABELS.assistants}
			className={`border-l-2 border-muted pl-4 ${className}`}
		>
			<h2
				id={headingId}
				className="scroll-mt-[4.5rem] text-xs font-medium uppercase tracking-wide text-muted"
			>
				{WRITING_SECTION_LABELS.assistants}
			</h2>
			<p className="mt-3 text-sm leading-[1.7] text-muted">
				{WRITING_AI_INSTRUCTION}
			</p>
		</aside>
	);
}
