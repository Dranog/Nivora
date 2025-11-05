/**
 * Public Layout - Standalone
 * No header, no footer, no wrapper
 * Just returns children as-is
 */

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
