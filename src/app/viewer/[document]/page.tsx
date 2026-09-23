import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PdfViewer } from "@/components/ui/PdfViewer";
import { getViewerDocument, viewerStaticParams } from "@/data/viewer-documents";

const SITE_URL = "https://alytvynenko.net";
const PROFILE_IMAGE = `${SITE_URL}/images/tm-easy-profile.webp`;

export function generateStaticParams() {
	return viewerStaticParams();
}

type Props = {
	params: Promise<{ document: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { document } = await params;
	const config = getViewerDocument(document);

	if (!config) {
		return { title: "Not Found" };
	}

	return {
		title: config.pageTitle,
		description: config.description,
		robots: { index: false, follow: true },
		openGraph: {
			title: `${config.pageTitle} | Senior DevOps & Cloud Engineer`,
			description: config.description,
			url: `${SITE_URL}/viewer/${document}/`,
			images: [
				{
					url: PROFILE_IMAGE,
					width: 250,
					height: 250,
					alt: "Andrii Lytvynenko",
				},
			],
			type: "profile",
		},
		twitter: {
			card: "summary_large_image",
			title: config.pageTitle,
			description: config.description,
			images: [PROFILE_IMAGE],
		},
	};
}

export default async function ViewerPage({ params }: Props) {
	const { document } = await params;
	const config = getViewerDocument(document);

	if (!config) {
		notFound();
	}

	return (
		<>
			<Navbar />
			<main id="main-content" className="min-h-screen pt-24 pb-12">
				<div className="mx-auto max-w-5xl px-4 sm:px-6">
					<div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<Link
							href="/"
							className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 font-medium text-white transition-colors hover:bg-accent-dark"
						>
							<svg
								className="h-4 w-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M10 19l-7-7m0 0l7-7m-7 7h18"
								/>
							</svg>
							Back to Home
						</Link>
						<a
							href={config.src}
							target="_blank"
							rel="noopener noreferrer"
							download={config.downloadName}
							className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-5 py-2.5 font-medium text-foreground transition-colors hover:bg-surface-hover backdrop-blur-[20px]"
						>
							<svg
								className="h-4 w-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
								/>
							</svg>
							Download PDF
						</a>
					</div>

					<div className="rounded-2xl border border-border bg-surface p-4 backdrop-blur-[20px] md:p-6">
						<PdfViewer src={config.src} title={config.title} />
					</div>
				</div>
			</main>
			<Footer />
		</>
	);
}
