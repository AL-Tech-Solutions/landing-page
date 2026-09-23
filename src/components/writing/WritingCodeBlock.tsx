"use client";

import { Children, isValidElement, type ReactNode } from "react";
import { WritingCopyButton } from "./WritingCopyButton";

interface WritingCodeBlockProps {
	children?: ReactNode;
	className?: string;
}

function extractLanguage(children: ReactNode): string | undefined {
	const child = Children.toArray(children)[0];
	if (!isValidElement(child)) {
		return undefined;
	}
	const className = (child.props as { className?: string }).className;
	const match = className?.match(/language-([a-zA-Z0-9_+-]+)/);
	return match?.[1];
}

export function WritingCodeBlock({
	children,
	className = "",
}: WritingCodeBlockProps) {
	const language = extractLanguage(children);
	const text = codeTextFromChildren(children);

	return (
		<div className="not-prose my-6 overflow-hidden rounded-xl border border-border bg-surface-solid">
			<div className="flex h-11 items-center justify-between gap-3 border-b border-border px-3">
				<span className="font-mono text-xs tracking-wide text-muted">
					{language ?? "code"}
				</span>
				<WritingCopyButton text={text} />
			</div>
			<pre
				tabIndex={0}
				className={`overflow-x-auto p-4 font-mono text-sm leading-relaxed text-foreground ${className}`}
			>
				{children}
			</pre>
		</div>
	);
}

function codeTextFromChildren(children: ReactNode): string {
	const child = Children.toArray(children)[0];
	if (typeof child === "string") {
		return child;
	}
	if (!isValidElement(child)) {
		return collectText(children);
	}
	const nested = (child.props as { children?: ReactNode }).children;
	return collectText(nested ?? child);
}

function collectText(node: ReactNode): string {
	return Children.toArray(node)
		.map((child) => {
			if (typeof child === "string" || typeof child === "number") {
				return String(child);
			}
			if (isValidElement(child)) {
				return collectText((child.props as { children?: ReactNode }).children);
			}
			return "";
		})
		.join("");
}
