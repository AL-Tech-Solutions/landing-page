import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import GithubSlugger from "github-slugger";
import { experiences } from "@/data/experiences";
import { person } from "@/lib/json-ld";
import {
	DEP_GROUP_ORDER,
	type DepGroup,
	type WritingDep,
	type WritingNote,
	type WritingNoteMeta,
	type WritingNoteType,
	type WritingPrompt,
	type WritingRelatedExperience,
	type WritingTocItem,
	WRITING_AI_INSTRUCTION,
	WRITING_NOTE_TYPES,
	WRITING_SECTION_IDS,
	WRITING_SECTION_LABELS,
	WRITING_SITE_URL,
} from "@/data/writing";

const WRITING_CONTENT_DIR = path.join(process.cwd(), "content", "writing");

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const WRITING_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown, field: string, slug: string): string {
	if (typeof value !== "string" || value.trim() === "") {
		throw new Error(`Note "${slug}" is missing string frontmatter "${field}"`);
	}
	return value.trim();
}

function asOptionalString(value: unknown): string | undefined {
	if (value === undefined || value === null || value === "") {
		return undefined;
	}
	if (typeof value !== "string") {
		throw new Error("Optional frontmatter field must be a string when set");
	}
	const trimmed = value.trim();
	return trimmed === "" ? undefined : trimmed;
}

function toIsoDate(value: unknown, field: string, slug: string): string {
	if (value instanceof Date && !Number.isNaN(value.getTime())) {
		return value.toISOString().slice(0, 10);
	}
	if (typeof value === "string") {
		const iso = value.slice(0, 10);
		if (ISO_DATE.test(iso)) {
			return iso;
		}
	}
	throw new Error(
		`Note "${slug}" frontmatter "${field}" must be an ISO date (YYYY-MM-DD)`,
	);
}

function asStringList(value: unknown, field: string, slug: string): string[] {
	if (value === undefined || value === null) {
		return [];
	}
	if (typeof value === "string") {
		const trimmed = value.trim();
		return trimmed === "" ? [] : [trimmed];
	}
	if (!Array.isArray(value)) {
		throw new Error(`Note "${slug}" frontmatter "${field}" must be a list`);
	}
	return value.map((item, index) => {
		if (typeof item !== "string" || item.trim() === "") {
			throw new Error(
				`Note "${slug}" frontmatter "${field}[${index}]" must be a non-empty string`,
			);
		}
		return item.trim();
	});
}

function parseAiSummary(value: unknown, slug: string): string[] {
	if (typeof value === "string") {
		const trimmed = value.trim();
		if (trimmed === "") {
			throw new Error(`Note "${slug}" aiSummary must not be empty`);
		}
		const wordCount = trimmed.split(/\s+/).length;
		if (wordCount > 80) {
			throw new Error(
				`Note "${slug}" aiSummary prose must be 80 words or fewer (got ${wordCount})`,
			);
		}
		return [trimmed];
	}
	const bullets = asStringList(value, "aiSummary", slug);
	if (bullets.length < 2 || bullets.length > 4) {
		throw new Error(
			`Note "${slug}" aiSummary must be 2–4 bullets or ≤80 words of prose`,
		);
	}
	return bullets;
}

function parseNoteType(value: unknown, slug: string): WritingNoteType {
	if (
		typeof value !== "string" ||
		!WRITING_NOTE_TYPES.includes(value as WritingNoteType)
	) {
		throw new Error(
			`Note "${slug}" type must be one of ${WRITING_NOTE_TYPES.join(", ")}`,
		);
	}
	return value as WritingNoteType;
}

function parseNameVersion(
	item: unknown,
	slug: string,
	index: string,
): { name: string; version: string } {
	if (!isRecord(item)) {
		throw new Error(`Note "${slug}" deps ${index} must be an object`);
	}
	return {
		name: asString(item.name, `deps.${index}.name`, slug),
		version: asString(item.version, `deps.${index}.version`, slug),
	};
}

function parseDeps(value: unknown, slug: string): WritingDep[] {
	if (value === undefined || value === null) {
		return [];
	}

	if (Array.isArray(value)) {
		return value.map((item, index) => {
			if (!isRecord(item)) {
				throw new Error(`Note "${slug}" deps[${index}] must be an object`);
			}
			const groupRaw = asString(item.group, `deps[${index}].group`, slug);
			const group = normalizeDepGroup(groupRaw, slug);
			const parsed = parseNameVersion(item, slug, `[${index}]`);
			return { group, ...parsed };
		});
	}

	if (!isRecord(value)) {
		throw new Error(`Note "${slug}" deps must be a list or grouped object`);
	}

	const deps: WritingDep[] = [];
	for (const group of DEP_GROUP_ORDER) {
		const items = value[group] ?? value[altGroupKey(group)];
		if (items === undefined) {
			continue;
		}
		if (!Array.isArray(items)) {
			throw new Error(`Note "${slug}" deps.${group} must be a list`);
		}
		for (const [index, item] of items.entries()) {
			const parsed = parseNameVersion(item, slug, `${group}[${index}]`);
			deps.push({ group, ...parsed });
		}
	}
	return deps;
}

function altGroupKey(group: DepGroup): string {
	if (group === "devCi") {
		return "dev_ci";
	}
	return group;
}

function normalizeDepGroup(value: string, slug: string): DepGroup {
	const normalized = value
		.replace(/[·•]/g, "")
		.replace(/[-_\s]/g, "")
		.toLowerCase();
	if (normalized === "runtime") return "runtime";
	if (normalized === "devci" || normalized === "dev") return "devCi";
	if (normalized === "cloud") return "cloud";
	throw new Error(
		`Note "${slug}" dep group "${value}" must be runtime, devCi, or cloud`,
	);
}

function parsePrompts(value: unknown, slug: string): WritingPrompt[] {
	if (value === undefined || value === null) {
		return [];
	}
	if (!Array.isArray(value)) {
		throw new Error(`Note "${slug}" prompts must be a list`);
	}
	return value.map((item, index) => {
		if (!isRecord(item)) {
			throw new Error(`Note "${slug}" prompts[${index}] must be an object`);
		}
		return {
			title: asString(item.title, `prompts[${index}].title`, slug),
			body: asString(item.body, `prompts[${index}].body`, slug),
		};
	});
}

function normalizeAiInstruction(value: string): string {
	return value.replace(/\s+/g, " ").trim();
}

function parseAiInstruction(value: unknown, slug: string): string {
	const raw = asString(value, "aiInstruction", slug);
	if (
		normalizeAiInstruction(raw) !==
		normalizeAiInstruction(WRITING_AI_INSTRUCTION)
	) {
		throw new Error(
			`Note "${slug}" aiInstruction must match the lawyer-locked Writing instruction`,
		);
	}
	return WRITING_AI_INSTRUCTION;
}

export function resolveRelatedExperience(
	refs: string[],
	slug: string,
): WritingRelatedExperience[] {
	return refs.map((ref) => {
		const exp = experiences.find(
			(item) =>
				item.id === ref ||
				item.position === ref ||
				`${item.position} at ${item.company}` === ref,
		);
		if (!exp) {
			throw new Error(
				`Note "${slug}" relatedExperience "${ref}" is not on the Experience source of truth`,
			);
		}
		return {
			id: exp.id,
			title: exp.position,
			company: exp.company,
		};
	});
}

const TLDR_HEADING = /^##\s+TL;DR\s*$/m;
const FAQ_HEADING = /^##\s+FAQ\s*$/m;

export function splitWritingBody(body: string): {
	body: string;
	tldr: string | null;
	faq: string | null;
} {
	const trimmed = body.replace(/^\uFEFF/, "").trim();
	const faqSplit = trimmed.split(FAQ_HEADING);
	let withoutFaq = trimmed;
	let faq: string | null = null;
	if (faqSplit.length > 1) {
		faq = faqSplit.slice(1).join("").trim() || null;
		withoutFaq = faqSplit[0].trim();
	}

	const tldrSplit = withoutFaq.split(TLDR_HEADING);
	let main = withoutFaq;
	let tldr: string | null = null;
	if (tldrSplit.length > 1) {
		tldr = tldrSplit.slice(1).join("").trim() || null;
		main = tldrSplit[0].trim();
	}

	return { body: main, tldr, faq };
}

function parseNoteFrontmatter(
	data: unknown,
	slug: string,
): Omit<WritingNoteMeta, "slug" | "relatedExperience"> & {
	relatedExperienceRefs: string[];
} {
	if (!isRecord(data)) {
		throw new Error(`Note "${slug}" frontmatter must be a mapping`);
	}

	return {
		title: asString(data.title, "title", slug),
		summary: asString(data.summary, "summary", slug),
		date: toIsoDate(data.date, "date", slug),
		lastVerified: toIsoDate(
			data.last_verified ?? data.lastVerified,
			"last_verified",
			slug,
		),
		type: parseNoteType(data.type, slug),
		aiSummary: parseAiSummary(data.aiSummary, slug),
		aiAudience: asOptionalString(data.aiAudience),
		aiInstruction: parseAiInstruction(data.aiInstruction, slug),
		deps: parseDeps(data.deps, slug),
		prerequisites: asStringList(data.prerequisites, "prerequisites", slug),
		prompts: parsePrompts(data.prompts, slug),
		verify: asStringList(data.verify, "verify", slug),
		cleanup: asStringList(data.cleanup, "cleanup", slug),
		securityNotes: asStringList(
			data.securityNotes ?? data.security_notes,
			"securityNotes",
			slug,
		),
		sourceRepo: asOptionalString(data.sourceRepo ?? data.source_repo),
		relatedExperienceRefs: asStringList(
			data.relatedExperience ?? data.related_experience,
			"relatedExperience",
			slug,
		),
		draft: Boolean(data.draft),
	};
}

function assertWritingSlug(slug: string): string {
	if (!WRITING_SLUG_PATTERN.test(slug)) {
		throw new Error(
			`Invalid Writing slug "${slug}" (use lowercase kebab-case)`,
		);
	}
	return slug;
}

export function writingArticlePath(slug: string): string {
	return `/writing/${assertWritingSlug(slug)}/`;
}

export function parseWritingNoteFile(
	filename: string,
	raw: string,
): WritingNote {
	const slug = assertWritingSlug(filename.replace(/\.mdx$/, ""));

	const parsed = matter(raw);
	const meta = parseNoteFrontmatter(parsed.data, slug);
	const split = splitWritingBody(parsed.content);

	return {
		slug,
		title: meta.title,
		summary: meta.summary,
		date: meta.date,
		lastVerified: meta.lastVerified,
		type: meta.type,
		aiSummary: meta.aiSummary,
		aiAudience: meta.aiAudience,
		aiInstruction: meta.aiInstruction,
		deps: meta.deps,
		prerequisites: meta.prerequisites,
		prompts: meta.prompts,
		verify: meta.verify,
		cleanup: meta.cleanup,
		securityNotes: meta.securityNotes,
		sourceRepo: meta.sourceRepo,
		relatedExperience: resolveRelatedExperience(
			meta.relatedExperienceRefs,
			slug,
		),
		draft: meta.draft,
		body: split.body,
		tldr: split.tldr,
		faq: split.faq,
	};
}

export function loadAllNotes(
	contentDir: string = WRITING_CONTENT_DIR,
): WritingNote[] {
	if (!fs.existsSync(contentDir)) {
		return [];
	}

	const files = fs
		.readdirSync(contentDir)
		.filter((file) => file.endsWith(".mdx"))
		.sort((a, b) => a.localeCompare(b));

	return files.map((file) => {
		const raw = fs.readFileSync(path.join(contentDir, file), "utf8");
		return parseWritingNoteFile(file, raw);
	});
}

export function getPublishedNotes(
	contentDir: string = WRITING_CONTENT_DIR,
): WritingNote[] {
	return loadAllNotes(contentDir)
		.filter((note) => !note.draft)
		.sort((a, b) => {
			if (a.date === b.date) {
				return a.title.localeCompare(b.title);
			}
			return a.date < b.date ? 1 : -1;
		});
}

export function getNoteBySlug(
	slug: string,
	contentDir: string = WRITING_CONTENT_DIR,
): WritingNote | undefined {
	return getPublishedNotes(contentDir).find((note) => note.slug === slug);
}

export function formatWritingDate(iso: string): string {
	const [year, month, day] = iso.split("-").map(Number);
	const date = new Date(Date.UTC(year, month - 1, day));
	return new Intl.DateTimeFormat("en-GB", {
		day: "numeric",
		month: "short",
		year: "numeric",
		timeZone: "UTC",
	}).format(date);
}

function collectMdxHeadings(markdown: string): WritingTocItem[] {
	const slugger = new GithubSlugger();
	const items: WritingTocItem[] = [];
	let inFence = false;

	for (const line of markdown.split("\n")) {
		if (line.startsWith("```")) {
			inFence = !inFence;
			continue;
		}
		if (inFence) {
			continue;
		}
		const match = /^(#{2,3})\s+(.+?)\s*$/.exec(line);
		if (!match) {
			continue;
		}
		const label = match[2].trim();
		items.push({ id: slugger.slug(label), label });
	}

	return items;
}

export function buildWritingToc(note: WritingNote): WritingTocItem[] {
	const items: WritingTocItem[] = [];

	if (note.prerequisites.length > 0) {
		items.push({
			id: WRITING_SECTION_IDS.prerequisites,
			label: WRITING_SECTION_LABELS.prerequisites,
		});
	}
	if (note.deps.length > 0) {
		items.push({
			id: WRITING_SECTION_IDS.dependencies,
			label: WRITING_SECTION_LABELS.dependencies,
		});
	}

	items.push(...collectMdxHeadings(note.body));
	if (note.prompts.length > 0) {
		items.push({
			id: WRITING_SECTION_IDS.prompts,
			label: WRITING_SECTION_LABELS.prompts,
		});
	}
	if (note.verify.length > 0) {
		items.push({
			id: WRITING_SECTION_IDS.verify,
			label: WRITING_SECTION_LABELS.verify,
		});
	}
	if (note.cleanup.length > 0) {
		items.push({
			id: WRITING_SECTION_IDS.cleanup,
			label: WRITING_SECTION_LABELS.cleanup,
		});
	}
	if (note.securityNotes.length > 0) {
		items.push({
			id: WRITING_SECTION_IDS.security,
			label: WRITING_SECTION_LABELS.security,
		});
	}
	if (note.relatedExperience.length > 0 || note.sourceRepo) {
		items.push({
			id: WRITING_SECTION_IDS.related,
			label: WRITING_SECTION_LABELS.related,
		});
	}
	if (note.tldr) {
		items.push({
			id: WRITING_SECTION_IDS.tldr,
			label: WRITING_SECTION_LABELS.tldr,
		});
	}
	if (note.faq) {
		items.push({
			id: WRITING_SECTION_IDS.faq,
			label: WRITING_SECTION_LABELS.faq,
		});
		items.push(...collectMdxHeadings(note.faq));
	}
	items.push({
		id: WRITING_SECTION_IDS.assistants,
		label: WRITING_SECTION_LABELS.assistants,
	});

	return items;
}

export function writingNoteUrl(slug: string): string {
	return `${WRITING_SITE_URL}/writing/${slug}/`;
}

/** Title + description for meta/OG only. Never include aiInstruction. */
export function writingNotePageSeo(
	note: Pick<WritingNoteMeta, "title" | "summary">,
): { title: string; description: string } {
	return {
		title: `${note.title} - Andrii Lytvynenko`,
		description: note.summary,
	};
}

export function writingHubUrl(): string {
	return `${WRITING_SITE_URL}/writing/`;
}

export function writingTechArticleJsonLd(note: WritingNoteMeta) {
	const url = writingNoteUrl(note.slug);
	const personId = `${WRITING_SITE_URL}/`;

	return {
		"@context": "https://schema.org",
		"@graph": [
			{
				...person,
				"@id": personId,
			},
			{
				"@type": "TechArticle",
				"@id": url,
				headline: note.title,
				description: note.summary,
				datePublished: note.date,
				dateModified: note.lastVerified,
				url,
				mainEntityOfPage: url,
				author: { "@id": personId },
				keywords: note.type,
				articleSection: note.type,
			},
		],
	};
}

export function renderLlmsTxt(
	notes: WritingNoteMeta[] = getPublishedNotes(),
): string {
	const lines = [
		"# Writing — Andrii Lytvynenko",
		"",
		`Academic and lab notes: ${writingHubUrl()}`,
		"",
		"## Notes",
		"",
	];

	for (const note of notes) {
		lines.push(
			`- [${note.title}](${writingNoteUrl(note.slug)}): ${note.summary}`,
		);
	}

	lines.push("");
	return lines.join("\n");
}

export function writingSitemapEntries(
	notes: WritingNoteMeta[] = getPublishedNotes(),
): { loc: string; lastmod: string }[] {
	const hubLastmod = notes.reduce(
		(latest, note) => (note.lastVerified > latest ? note.lastVerified : latest),
		"2026-09-10",
	);

	return [
		{ loc: writingHubUrl(), lastmod: hubLastmod },
		...notes.map((note) => ({
			loc: writingNoteUrl(note.slug),
			lastmod: note.lastVerified,
		})),
	];
}
