"use client";

import { WRITING_PROMPT_DISCLAIMER, type WritingPrompt } from "@/data/writing";
import { WritingCopyButton } from "./WritingCopyButton";

export function WritingPrompts({ prompts }: { prompts: WritingPrompt[] }) {
	if (prompts.length === 0) {
		return null;
	}

	return (
		<div className="mt-4">
			<p className="text-sm leading-[1.7] text-muted">
				{WRITING_PROMPT_DISCLAIMER}
			</p>
			<div className="mt-4 space-y-3">
				{prompts.map((prompt) => (
					<details
						key={prompt.title}
						className="overflow-hidden rounded-xl border border-border bg-surface-solid"
					>
						<summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-foreground min-h-[44px] flex items-center [&::-webkit-details-marker]:hidden">
							{prompt.title}
						</summary>
						<div className="border-t border-border">
							<div className="flex h-11 items-center justify-between gap-3 border-b border-border px-3">
								<span className="font-mono text-xs tracking-wide text-muted">
									prompt
								</span>
								<WritingCopyButton text={prompt.body} />
							</div>
							<pre
								tabIndex={0}
								className="overflow-x-auto p-4 font-mono text-sm leading-relaxed text-foreground whitespace-pre-wrap"
							>
								{prompt.body}
							</pre>
						</div>
					</details>
				))}
			</div>
		</div>
	);
}
