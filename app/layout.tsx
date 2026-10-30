import "./globals.css";

import type { Metadata } from "next";
import { DM_Sans, Outfit } from "next/font/google";
import { Sidebar } from "./_components/common/Sidebar";
import { Wrapper } from "./_components/common/Wrapper";
import { TopNavBar } from "./_components/common/TopNavBar";

const dmSans = DM_Sans({ variable: "--font-dm-sans", subsets: ["latin"] });
const outfit = Outfit({ variable: "--font-outfit", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Foodist | Planejamento alimentar",
  description: "Planejamento alimentar para a rotina de vocês.",
};

const themeScript = `(() => {
  let preference = "system";
  try {
    const stored = localStorage.getItem("foodist-theme");
    if (stored === "light" || stored === "dark" || stored === "system") preference = stored;
  } catch {}
  const dark = preference === "dark" || (preference === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
  document.documentElement.dataset.themePreference = preference;
})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={`${dmSans.variable} ${outfit.variable} h-full antialiased`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-dvh flex-col md:flex-row">
        <Sidebar />
        <Wrapper>
          <TopNavBar />
          <main className="mx-auto w-full max-w-content p-4 sm:p-6 lg:p-8">{children}</main>
        </Wrapper>
      </body>
    </html>
  );
}

