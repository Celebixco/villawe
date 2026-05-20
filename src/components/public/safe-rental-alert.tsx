import { Alert, AlertDescription } from "@/components/ui/alert";
import { TriangleAlert } from "lucide-react";

export function SafeRentalAlert() {
  return (
    <Alert
      variant="warning"
      className="rounded-[1.7rem] border-warning/28 bg-warning/12 shadow-[0_16px_40px_-30px_rgba(232,165,48,0.26)]"
    >
      <TriangleAlert className="text-warning" />
      <AlertDescription className="text-sm leading-6 text-foreground">
        Platform dışı ödeme yapmayın. Tüm ödeme ve depozito detaylarını Villawe üzerinden teyit edin.
      </AlertDescription>
    </Alert>
  );
}
