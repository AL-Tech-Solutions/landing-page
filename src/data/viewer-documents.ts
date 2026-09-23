export interface ViewerDocument {
	src: string;
	title: string;
	downloadName: string;
	pageTitle: string;
	description: string;
}

/**
 * Valid PDF viewer slugs. Unknown params 404. Each src stays same-origin
 * `/pdf/*.pdf` so the iframe cannot be pointed at an arbitrary URL.
 */
export const viewerDocuments = {
	resume: {
		src: "/pdf/resume.pdf",
		title: "Andrii Lytvynenko Resume",
		downloadName: "Andrii_Lytvynenko_Resume.pdf",
		pageTitle: "Resume - Andrii Lytvynenko",
		description:
			"Resume of Andrii Lytvynenko, Senior DevOps & Cloud Engineer. AWS & Kubernetes Certified. Available for B2B contracts.",
	},
	diploma: {
		src: "/pdf/diploma.pdf",
		title: "Diploma",
		downloadName: "diploma.pdf",
		pageTitle: "Diploma - Andrii Lytvynenko",
		description: "Bachelor's degree diploma from Kharkiv Aviation Institute.",
	},
	"diploma-supplement": {
		src: "/pdf/diploma-supplement.pdf",
		title: "Diploma Supplement",
		downloadName: "diploma-supplement.pdf",
		pageTitle: "Diploma Supplement - Andrii Lytvynenko",
		description: "Diploma supplement from Kharkiv Aviation Institute.",
	},
} as const satisfies Record<string, ViewerDocument>;

export type ViewerSlug = keyof typeof viewerDocuments;

export const viewerDocumentSlugs = Object.keys(viewerDocuments) as ViewerSlug[];

export function getViewerDocument(slug: string): ViewerDocument | undefined {
	if (Object.hasOwn(viewerDocuments, slug)) {
		return viewerDocuments[slug as ViewerSlug];
	}
	return undefined;
}

export function viewerStaticParams(): { document: ViewerSlug }[] {
	return viewerDocumentSlugs.map((document) => ({ document }));
}

/** In-app viewer path for a valid PDF src, otherwise undefined. */
export function viewerHrefForPdf(
	src: string,
): `/viewer/${ViewerSlug}` | undefined {
	const slug = viewerDocumentSlugs.find(
		(key) => viewerDocuments[key].src === src,
	);
	return slug ? `/viewer/${slug}` : undefined;
}
