import { Check, X, AlertTriangle } from "lucide-react";

const variants = {
  existing: { cls: "tag-green", Icon: Check },
  missing:  { cls: "tag-red",   Icon: X },
  priority: { cls: "tag-amber", Icon: AlertTriangle },
  neutral:  { cls: "tag-blue",  Icon: null },
  soft:     { cls: "tag-purple", Icon: null },
};

export default function SkillTag({ label, variant = "neutral" }) {
  const { cls, Icon } = variants[variant] || variants.neutral;
  return (
    <span className={`tag ${cls}`}>
      {Icon && <Icon size={11} />}
      {label}
    </span>
  );
}
