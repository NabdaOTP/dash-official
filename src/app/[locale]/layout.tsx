import type { Metadata } from "next";
import { Alexandria, Roboto, Roboto_Mono, Zain } from "next/font/google";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import "../globals.css";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { AuthProvider } from "@/features/auth/context/auth-context";
import { Toaster } from "sonner";
import { ProjectsProvider } from "@/features/projects/context/projects-context";

const zain = Zain({
  variable: "--font-arabic",
  subsets: ["arabic"],
  weight: ["400", "700"],
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

const alexandria = Alexandria({
  variable: "--font-alexandria",
  subsets: ["arabic"],
  weight: ["300", "400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Nabda OTP",
  description: "WhatsApp OTP Service Dashboard",
  icons: {
    icon: "/favicon.ico",
  },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html
      lang={locale}
      dir={locale === "ar" ? "rtl" : "ltr"}
      suppressHydrationWarning
    >
      <body
        className={`${roboto.variable} ${robotoMono.variable} ${zain.variable} ${alexandria.variable} antialiased ${
          locale === "ar" ? "font-ar" : "font-en"
        }`}
      >
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            <ProjectsProvider>
              {children}
            </ProjectsProvider>
          </AuthProvider>
          <Toaster position="top-center" richColors />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}