export default function AppSectionLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="h-dvh min-h-0 overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      {children}
    </div>
  );
}
