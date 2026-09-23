import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Footer } from "@/components/layout/Footer";
import { WritingArticle } from "@/components/writing/WritingArticle";
import { WritingArticleBar } from "@/components/writing/WritingArticleBar";
import { WRITING_SITE_URL } from "@/data/writing";
import { compileWritingMdx } from "@/lib/compile-writing-mdx";
import { serializeJsonLd } from "@/lib/json-ld";
import {
	buildWritingToc,
	getNoteBySlug,
	getPublishedNotes,
	writingNotePageSeo,
	writingNoteUrl,
	writingTechArticleJsonLd,
} from "@/lib/writing";

const PROFILE_IMAGE = `${WRITING_SITE_URL}/images/tm-easy-profile.webp`;

export function generateStaticParams() {
	return getPublishedNotes().map((note) => ({ slug: note.slug }));
}

export const dynamicParams = false;

type Props = {
	params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { slug } = await params;
	const note = getNoteBySlug(slug);

	if (!note) {
		return { title: "Not Found" };
	}

	const url = writingNoteUrl(note.slug);
	const seo = writingNotePageSeo(note);

	return {
		title: seo.title,
		description: seo.description,
		robots: { index: true, follow: true },
		alternates: { canonical: url },
		openGraph: {
			title: note.title,
			description: seo.description,
			url,
			type: "article",
			publishedTime: note.date,
			modifiedTime: note.lastVerified,
			authors: ["Andrii Lytvynenko"],
			images: [
				{
					url: PROFILE_IMAGE,
					width: 250,
					height: 250,
					alt: "Andrii Lytvynenko",
				},
			],
		},
		twitter: {
			card: "summary_large_image",
			title: note.title,
			description: seo.description,
			images: [PROFILE_IMAGE],
		},
	};
}

export default async function WritingNotePage({ params }: Props) {
	const { slug } = await params;
	const note = getNoteBySlug(slug);

	if (!note) {
		notFound();
	}

	const toc = buildWritingToc(note);
	const [bodyContent, tldrContent, faqContent] = await Promise.all([
		compileWritingMdx(note.body),
		note.tldr ? compileWritingMdx(note.tldr) : Promise.resolve(null),
		note.faq ? compileWritingMdx(note.faq) : Promise.resolve(null),
	]);

	return (
		<div className="min-h-screen bg-background">
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: serializeJsonLd(writingTechArticleJsonLd(note)),
				}}
			/>
			<WritingArticleBar title={note.title} toc={toc} />
			<main id="main-content">
				<WritingArticle
					note={note}
					toc={toc}
					bodyContent={bodyContent}
					tldrContent={tldrContent}
					faqContent={faqContent}
				/>
			</main>
			<Footer />
		</div>
	);
}
