import { AlertTriangle, Database, Eye } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type DataSourceNoticeProps = {
  title: string;
  body: string;
  tone?: "info" | "warning" | "error";
};

const toneMap = {
  info: {
    icon: Eye,
    variant: "info" as const,
  },
  warning: {
    icon: Database,
    variant: "warning" as const,
  },
  error: {
    icon: AlertTriangle,
    variant: "destructive" as const,
  },
} as const;

export function DataSourceNotice({
  title,
  body,
  tone = "info",
}: DataSourceNoticeProps) {
  const config = toneMap[tone];
  const Icon = config.icon;

  return (
    <Alert variant={config.variant}>
      <Icon />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{body}</AlertDescription>
    </Alert>
  );
}
