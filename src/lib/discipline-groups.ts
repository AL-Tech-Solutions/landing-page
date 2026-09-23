import {
	getCanonicalForDiscipline,
	getCategoryForDiscipline,
	SKILL_CATEGORIES,
} from "@/data/skillIcons";
import { parseDisciplineListItems } from "@/lib/discipline-segments";

/**
 * Accordion id slug. Strips punctuation (including &) so titles like
 * "Technologies & Skills" cannot produce invalid or colliding ids.
 */
export function slugifyAccordionTitle(title: string): string {
	return title
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "");
}

/**
 * Parse raw discipline strings, alias-dedupe within each category, and keep
 * SKILL_CATEGORIES order with "other" last. Chip labels use the canonical
 * alias target when one exists.
 */
export function groupDisciplinesForDisplay(rawItems: string[]): {
	parsedItems: string[];
	groupedByCategory: Record<string, string[]>;
	orderedCategoryIds: string[];
} {
	const parsedItems = parseDisciplineListItems(rawItems);
	const groupedByCategory: Record<string, string[]> = {};
	const seen: Record<string, Set<string>> = {};

	for (const item of parsedItems) {
		const cat = getCategoryForDiscipline(item);
		const canonical = getCanonicalForDiscipline(item);
		if (!groupedByCategory[cat]) groupedByCategory[cat] = [];
		if (!seen[cat]) seen[cat] = new Set();
		if (seen[cat].has(canonical)) continue;
		seen[cat].add(canonical);
		groupedByCategory[cat].push(canonical !== item ? canonical : item);
	}

	const orderedCategoryIds = SKILL_CATEGORIES.filter(
		(c) => groupedByCategory[c.id]?.length,
	).map((c) => c.id);

	const otherIdx = orderedCategoryIds.indexOf("other");
	if (otherIdx >= 0 && otherIdx < orderedCategoryIds.length - 1) {
		orderedCategoryIds.splice(otherIdx, 1);
		orderedCategoryIds.push("other");
	}

	return { parsedItems, groupedByCategory, orderedCategoryIds };
}
