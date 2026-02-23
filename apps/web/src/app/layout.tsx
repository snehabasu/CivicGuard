import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CivicGuard — Clinical Documentation Assistant",
  description:
    "AI-assisted scribe tool for social workers. All AI output is DRAFT pending clinician review.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", maxWidth: 800, margin: "0 auto", padding: "1rem" }}>
        <header style={{ borderBottom: "1px solid #e5e7eb", paddingBottom: "0.75rem", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <strong style={{ fontSize: "1.1rem" }}>CivicGuard</strong>
            <small style={{ color: "#6b7280" }}>
              AI output is always DRAFT — clinician review required before Epic entry
            </small>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
