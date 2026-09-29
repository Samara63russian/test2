import type { Metadata } from "next";
import { Manrope, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-sans",
  subsets: ["latin", "cyrillic"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-display",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "Письмо → Запись | Трекер запросов КП",
  description:
    "Отслеживание входящих писем с запросами коммерческих предложений, перечней и общих запросов. Бесплатный ИИ-конспект и журнал записей.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body
        className={`${manrope.variable} ${sourceSerif.variable} font-sans antialiased`}
      >
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
