export default function AppSectionLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="app-shell min-h-dvh overflow-x-hidden overflow-y-auto bg-background">
      {children}
    </div>
  );
}
