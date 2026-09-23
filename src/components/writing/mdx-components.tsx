import type { AnchorHTMLAttributes } from "react";
import type { MDXComponents } from "mdx/types";
import { WritingCodeBlock } from "./WritingCodeBlock";

function WritingLink({
	href,
	children,
	...props
}: AnchorHTMLAttributes<HTMLAnchorElement>) {
	const external = Boolean(href && /^https?:\/\//.test(href));

	return (
		<a
			href={href}
			className="text-accent underline-offset-2 hover:underline"
			{...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
			{...props}
		>
			{children}
		</a>
	);
}

export const writingMdxComponents: MDXComponents = {
	a: WritingLink,
	pre: WritingCodeBlock,
	h2: (props) => (
		<h2
			className="mt-10 scroll-mt-[4.5rem] text-[length:var(--font-writing-h2)] font-semibold tracking-tight text-foreground first:mt-0"
			{...props}
		/>
	),
	h3: (props) => (
		<h3
			className="mt-8 scroll-mt-[4.5rem] text-lg font-semibold tracking-tight text-foreground"
			{...props}
		/>
	),
	p: (props) => <p className="mt-4 text-foreground" {...props} />,
	ul: (props) => (
		<ul className="mt-4 list-disc space-y-2 pl-5 text-foreground" {...props} />
	),
	ol: (props) => (
		<ol
			className="mt-4 list-decimal space-y-2 pl-5 text-foreground"
			{...props}
		/>
	),
	li: (props) => <li className="leading-[1.7]" {...props} />,
	blockquote: (props) => (
		<blockquote
			className="my-6 border-l-2 border-muted pl-4 text-muted"
			{...props}
		/>
	),
	code: ({ className, ...props }) => {
		if (className?.includes("language-")) {
			return <code className={className} {...props} />;
		}
		return (
			<code
				className="rounded-md bg-surface px-1.5 py-0.5 font-mono text-[0.9em] text-foreground"
				{...props}
			/>
		);
	},
	strong: (props) => (
		<strong className="font-semibold text-foreground" {...props} />
	),
};
