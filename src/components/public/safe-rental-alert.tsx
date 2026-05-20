import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TriangleAlert } from "lucide-react";

export function SafeRentalAlert() {
  return (
    <Alert
      variant="warning"
      className="rounded-[1.8rem] border-warning/28 bg-warning/12 shadow-[0_16px_40px_-30px_rgba(232,165,48,0.3)]"
    >
      <TriangleAlert className="text-warning" />
      <AlertTitle className="text-base">Ödemeyi yalnızca teyitli akışta yapın</AlertTitle>
      <AlertDescription className="mt-2 text-sm leading-6">
        Platform dışı ödeme yapmayın. Tüm ödeme ve depozito detaylarını Villawe üzerinden teyit edin.
      </AlertDescription>
    </Alert>
  );
}
