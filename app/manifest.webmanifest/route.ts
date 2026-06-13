export const dynamic = "force-dynamic";

export async function GET() {
	const baseUrl =
		process.env.NEXT_PUBLIC_API_URL ?? "http://localhost/a-KV/hs/bots/api";
	let name = "Управление объектами глэмпинга";
	try {
		const res = await fetch(`${baseUrl}/settings`, { cache: "no-store" });
		if (res.ok) {
			const data = await res.json();
			if (data?.companyName) name = data.companyName;
		}
	} catch {
		// fallback
	}

	const manifest = {
		name,
		short_name: name,
		description: name,
		start_url: "/",
		display: "standalone",
		background_color: "#f8f4ea",
		theme_color: "#f8f4ea",
		icons: [
			{
				src: "/icon-192.png",
				sizes: "192x192",
				type: "image/png",
				purpose: "any",
			},
			{
				src: "/icon-512.png",
				sizes: "512x512",
				type: "image/png",
				purpose: "any",
			},
		],
	};

	return new Response(JSON.stringify(manifest), {
		headers: {
			"Content-Type": "application/manifest+json",
		},
	});
}
