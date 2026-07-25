import { Badge } from "@/components/ui/badge";
import type { RiskAssessment } from "@/lib/types";

interface RiskBadgeProps {
  riskLevel: RiskAssessment["riskLevel"];
}

const RISK_STYLES: Record<RiskAssessment["riskLevel"], string> = {
  low: "bg-green-500/20 text-green-400 border-green-500/30",
  elevated: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  high: "bg-red-500/20 text-red-400 border-red-500/30",
};

const RISK_LABELS: Record<RiskAssessment["riskLevel"], string> = {
  low: "Low Risk",
  elevated: "Elevated Risk",
  high: "High Risk",
};

export function RiskBadge({ riskLevel }: RiskBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={RISK_STYLES[riskLevel]}
      aria-label={`Current risk level: ${RISK_LABELS[riskLevel]}`}
    >
      {RISK_LABELS[riskLevel]}
    </Badge>
  );
}
