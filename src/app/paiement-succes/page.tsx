import { Suspense } from "react";
import PaiementSuccesClient from "./PaiementSuccesClient";

export default function PaiementSuccesPage() {
  return (
    <Suspense>
      <PaiementSuccesClient />
    </Suspense>
  );
}
