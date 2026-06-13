import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Nunito } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/auth/AppShell";
import BottomNav from "@/components/layout/BottomNav";
import DesktopSidebar from "@/components/layout/DesktopSidebar";
import { AuthProvider } from "@/lib/auth-context";
import { SettingsProvider } from "@/lib/settings-context";

const nunito = Nunito({
	variable: "--font-nunito",
	subsets: ["latin", "cyrillic"],
	weight: ["400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
	variable: "--font-jetbrains-mono",
	subsets: ["latin", "cyrillic"],
});

export async function generateMetadata(): Promise<Metadata> {
	const baseUrl =
		process.env.NEXT_PUBLIC_API_URL ?? "http://localhost/a-KV/hs/bots/api";
	let title = "Управление объектами глэмпинга";
	try {
		const res = await fetch(`${baseUrl}/settings`, { cache: "no-store" });
		if (res.ok) {
			const data = await res.json();
			if (data?.companyName) title = data.companyName;
		}
	} catch {
		// fallback to default title
	}
	return {
		title,
		description: title,
		manifest: "/manifest.webmanifest",
		icons: [
			{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
			{ url: "/icon-192.png", sizes: "192x192", type: "image/png" },
			{ url: "/icon-512.png", sizes: "512x512", type: "image/png" },
		],
		appleWebApp: {
			capable: true,
			title,
			statusBarStyle: "default",
		},
	};
}

export const viewport: Viewport = {
	width: "device-width",
	themeColor: "#f8f4ea",
	initialScale: 1,
	viewportFit: "cover",
	userScalable: false,
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="ru">
			<body
				className={`${nunito.variable} ${jetbrainsMono.variable} antialiased bg-[var(--background)]`}
			>
				<AuthProvider>
					<SettingsProvider>
						<AppShell>
							<div className="lg:flex min-h-dvh">
								<DesktopSidebar />
								<main className="flex-1 min-w-0 lg:overflow-x-hidden">
									{children}
								</main>
							</div>
							<BottomNav />
						</AppShell>
					</SettingsProvider>
				</AuthProvider>
			</body>
		</html>
	);
}
