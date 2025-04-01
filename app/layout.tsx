// app/layout.tsx
export const metadata = {
  title: "Coffee Chat Roulette",
  description: "Match colleagues randomly for coffee chats",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-black font-sans">{children}</body>
    </html>
  );
}
