import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TriangleAlert } from "lucide-react";
import { demoPolicies } from "@/lib/demo-data";

export function SafeRentalAlert() {
  return (
    <Alert variant="warning" className="shadow-[0_16px_40px_-30px_rgba(232,165,48,0.38)]">
      <TriangleAlert className="text-warning" />
      <AlertTitle className="text-base">
        Platform dışı ödeme yapmayın
      </AlertTitle>
      <AlertDescription className="mt-2 space-y-2 text-sm leading-6">
        <p className="font-medium text-foreground">
          Platform dışı ödeme yapmayın. Ödemelerinizi yalnızca resmi kanallar üzerinden gerçekleştirin.
        </p>
        {demoPolicies.safeRentalWarnings.map((warning) => (
          <p key={warning}>{warning}</p>
        ))}
      </AlertDescription>
    </Alert>
  );
}
