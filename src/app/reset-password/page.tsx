import { Suspense } from "react";
import ResetPasswordClient from "./ResetPasswordClient";

export const metadata = { title: "Réinitialisation du mot de passe — L'Economie" };

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordClient />
    </Suspense>
  );
}
