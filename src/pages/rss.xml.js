import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { siteConfig } from '@/config/site';

export async function GET(context) {
	const posts = await getCollection('blog');
	const publishedPosts = posts.filter(post => !post.data.draft);
	
	return rss({
		title: siteConfig.name,
		description: siteConfig.description,
		site: context.site,
		items: publishedPosts.map((post) => ({
			title: post.data.title,
			description: post.data.description,
			pubDate: post.data.publishedAt,
			link: `/blog/${post.id}/`,
		})),
		customData: `<language>zh-TW</language>`,
	});
}
