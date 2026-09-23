"use client";

import { useCallback, useState } from "react";

async function copyText(text: string): Promise<boolean> {
	try {
		if (navigator.clipboard?.writeText) {
			await navigator.clipboard.writeText(text);
			return true;
		}
	} catch (error) {
		console.error("Clipboard API copy failed", error);
	}

	try {
		const textarea = document.createElement("textarea");
		textarea.value = text;
		textarea.setAttribute("readonly", "");
		textarea.style.position = "fixed";
		textarea.style.left = "-9999px";
		document.body.appendChild(textarea);
		textarea.select();
		const ok = document.execCommand("copy");
		document.body.removeChild(textarea);
		return ok;
	} catch (error) {
		console.error("Fallback copy failed", error);
		return false;
	}
}

interface WritingCopyButtonProps {
	text: string;
	ariaLabel?: string;
}

export function WritingCopyButton({
	text,
	ariaLabel = "Copy code",
}: WritingCopyButtonProps) {
	const [copied, setCopied] = useState(false);

	const onCopy = useCallback(async () => {
		if (!text) {
			return;
		}
		const ok = await copyText(text);
		if (!ok) {
			return;
		}
		setCopied(true);
		window.setTimeout(() => setCopied(false), 2000);
	}, [text]);

	return (
		<button
			type="button"
			onClick={onCopy}
			className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-sm text-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
			aria-label={copied ? "Copied" : ariaLabel}
		>
			{copied ? "Copied" : "Copy"}
		</button>
	);
}
