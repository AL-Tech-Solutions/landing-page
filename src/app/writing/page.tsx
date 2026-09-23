import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WritingNoteCard } from "@/components/writing/WritingNoteCard";
import {
	WRITING_HUB_DESCRIPTION,
	WRITING_HUB_SUBTITLE,
	WRITING_HUB_TITLE,
	WRITING_SITE_URL,
} from "@/data/writing";
import { getPublishedNotes, writingHubUrl } from "@/lib/writing";

const PROFILE_IMAGE = `${WRITING_SITE_URL}/images/tm-easy-profile.webp`;
const HUB_URL = writingHubUrl();

export const metadata: Metadata = {
	title: "Writing - Andrii Lytvynenko",
	description: WRITING_HUB_DESCRIPTION,
	robots: { index: true, follow: true },
	alternates: { canonical: HUB_URL },
	openGraph: {
		title: "Writing - Andrii Lytvynenko",
		description: WRITING_HUB_DESCRIPTION,
		url: HUB_URL,
		images: [
			{
				url: PROFILE_IMAGE,
				width: 250,
				height: 250,
				alt: "Andrii Lytvynenko",
			},
		],
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "Writing - Andrii Lytvynenko",
		description: WRITING_HUB_DESCRIPTION,
		images: [PROFILE_IMAGE],
	},
};

export default function WritingHubPage() {
	const notes = getPublishedNotes();

	return (
		<>
			<Navbar />
			<main
				id="main-content"
				className="min-h-screen bg-background pt-24 pb-16"
			>
				<div className="mx-auto flex w-full max-w-[800px] flex-col gap-8 px-4 sm:px-6">
					<header>
						<h1 className="text-[length:var(--font-writing-h1)] font-semibold tracking-tight text-foreground">
							{WRITING_HUB_TITLE}
						</h1>
						<p className="mt-3 text-[length:var(--font-writing-body)] leading-[1.7] text-muted">
							{WRITING_HUB_SUBTITLE}
						</p>
					</header>
					<div className="flex flex-col gap-6">
						{notes.map((note) => (
							<WritingNoteCard key={note.slug} note={note} headingLevel="h2" />
						))}
					</div>
				</div>
			</main>
			<Footer />
		</>
	);
}
