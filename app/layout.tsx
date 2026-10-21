import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import HeaderMenu from "./_components/common/HeaderMenu";
import { NavSidebar } from "./_components/common/NavSidebar";

const outfit = Outfit({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Food Calendar | Meal planning app",
	description: "Meal planning app",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
	return (
		<html
			lang="en"
			className={`${outfit.className} ${outfit.variable} h-full antialiased`}
		>
			<body className="min-h-full flex flex-col bg-sky-50 text-sky-700">
				<HeaderMenu />
				<div className="flex gap-4 w-full grow">
					<NavSidebar />
					{children}
				</div>
			</body>
		</html>
	);
}
