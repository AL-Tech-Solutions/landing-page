/**
 * Truncate Experience/Education HTML for ExpandableDescription.
 * List mode keeps the first N <li> items; plain text strips tags and
 * cuts on a word boundary before wrapping the preview in <p>.
 */

export function truncateListHtml(
	html: string,
	maxBullets: number,
): {
	truncated: string;
	full: string;
	needsExpand: boolean;
} {
	const liMatches = html.match(/<li>[\s\S]*?<\/li>/g);
	if (!liMatches || liMatches.length <= maxBullets) {
		return { truncated: html, full: html, needsExpand: false };
	}
	const truncated = "<ul>" + liMatches.slice(0, maxBullets).join("") + "</ul>";
	return { truncated, full: html, needsExpand: true };
}

export function truncatePlainText(
	html: string,
	maxChars: number,
): {
	truncated: string;
	full: string;
	needsExpand: boolean;
} {
	const stripped = html.replace(/<[^>]*>/g, "").trim();
	if (stripped.length <= maxChars) {
		return { truncated: html, full: html, needsExpand: false };
	}
	const rough = stripped.slice(0, maxChars);
	const lastSpace = rough.lastIndexOf(" ");
	const truncated =
		(lastSpace > 0 ? rough.slice(0, lastSpace) : rough).trim() + "…";
	return {
		truncated: `<p>${truncated}</p>`,
		full: html,
		needsExpand: true,
	};
}

export function getAdditionalListItems(
	html: string,
	maxBullets: number,
): string[] {
	const liMatches = html.match(/<li>[\s\S]*?<\/li>/g);
	if (!liMatches || liMatches.length <= maxBullets) return [];
	return liMatches
		.slice(maxBullets)
		.map((m) => m.replace(/^<li>|<\/li>$/gi, "").trim());
}

export function getAdditionalPlainHtml(
	html: string,
	maxChars: number,
): string | null {
	const stripped = html.replace(/<[^>]*>/g, "").trim();
	if (stripped.length <= maxChars) return null;
	const rough = stripped.slice(0, maxChars);
	const lastSpace = rough.lastIndexOf(" ");
	const splitAt = lastSpace > 0 ? lastSpace : maxChars;
	const additional = stripped.slice(splitAt).trim();
	return additional ? `<p>${additional}</p>` : null;
}
