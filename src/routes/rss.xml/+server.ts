import { getAllPosts } from "$lib/server/posts";
import { site } from "$lib/config";

export const prerender = true;

function escapeXml(value: string): string {
  return value.replace(
    /[<>&'"]/g,
    (c) =>
      ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        "'": "&apos;",
        '"': "&quot;",
      })[c]!,
  );
}

export async function GET() {
  const posts = await getAllPosts();

  const items = posts
    .map(
      (p) => `		<item>
			<title>${escapeXml(p.title)}</title>
			<link>${site.url}/posts/${p.slug}</link>
			<guid>${site.url}/posts/${p.slug}</guid>
			<category>${escapeXml(p.category)}</category>
			<pubDate>${new Date(`${p.date}T00:00:00Z`).toUTCString()}</pubDate>
			<description>${escapeXml(p.excerpt)}</description>
		</item>`,
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
	<channel>
		<title>${escapeXml(site.title)}</title>
		<link>${site.url}</link>
		<atom:link href="${site.url}/rss.xml" rel="self" type="application/rss+xml" />
		<description>${escapeXml(site.description)}</description>
		<language>en</language>
${items}
	</channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
