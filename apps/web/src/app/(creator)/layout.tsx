// apps/web/src/app/(creator)/layout.tsx
export default function CreatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Pure passthrough — each creator page renders its own shell
  return <>{children}</>;
}
