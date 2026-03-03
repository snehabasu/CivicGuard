"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

/**
 * Export page now redirects to the unified review page.
 * Kept as a route so existing links / bookmarks don't break.
 */
function ExportRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const visitId = searchParams.get("visitId");
    router.replace(visitId ? `/review?visitId=${visitId}` : "/review");
  }, [router, searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-sm text-teal-dark/40">Loading...</p>
    </div>
  );
}

export default function ExportPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-sm text-teal-dark/40">Loading...</p>
        </div>
      }
    >
      <ExportRedirect />
    </Suspense>
  );
}
