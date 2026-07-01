import { Suspense } from "react";
import AchatSuccesClient from "./AchatSuccesClient";

export default function AchatSuccesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <AchatSuccesClient />
    </Suspense>
  );
}
