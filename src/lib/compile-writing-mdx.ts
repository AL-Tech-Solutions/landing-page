import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { writingMdxComponents } from "@/components/writing/mdx-components";

export async function compileWritingMdx(source: string) {
	const trimmed = source.trim();
	if (!trimmed) {
		return null;
	}

	const { content } = await compileMDX({
		source: trimmed,
		options: {
			mdxOptions: {
				remarkPlugins: [remarkGfm],
				rehypePlugins: [rehypeSlug],
			},
		},
		components: writingMdxComponents,
	});

	return content;
}
