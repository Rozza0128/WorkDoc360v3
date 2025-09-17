import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Building, 
  PaintRoller, 
  Hammer, 
  CheckCircle,
  Users
} from "lucide-react";

interface TradeOption {
  value: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
}

interface TradeSelectionProps {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

const tradeOptions: TradeOption[] = [
  {
    value: "scaffolder",
    title: "Scaffolder",
    description: "CISRS certification tracking, TG20/TG30:24 compliance, scaffold design calculations",
    icon: <Building className="h-8 w-8" />,
    features: [
      "CISRS Certification tracking",
      "TG20/TG30:24 Compliance documents",
      "Local authority permits",
      "Daily inspection records",
      "Method statements for scaffold erection/dismantling"
    ]
  },
  {
    value: "plasterer",
    title: "Plasterer",
    description: "CSCS 2025 compliance, material certificates, fire-resistant documentation",
    icon: <PaintRoller className="h-8 w-8" />,
    features: [
      "CSCS card renewal tracking (2025 deadline)",
      "Material compliance certificates",
      "Fire-resistant material documentation",
      "Skills certification records",
      "Site-specific risk assessments"
    ]
  },
  {
    value: "general_builder",
    title: "General Builder",
    description: "Building Control approvals, CDM 2015 compliance, ISO 45001:2018 templates",
    icon: <Hammer className="h-8 w-8" />,
    features: [
      "Building Control Approval documents",
      "CDM 2015 compliance documentation",
      "ISO 45001:2018 management system templates",
      "Risk assessments and method statements (RAMS)",
      "CSCS card management system"
    ]
  },
  {
    value: "custom",
    title: "Other Trade (Not Listed)",
    description: "Specialist trade consultation - we'll research your specific requirements",
    icon: <Users className="h-8 w-8" />,
    features: [
      "Bespoke document research service (£150/hour)",
      "Industry-specific compliance review",
      "Custom template creation for your trade",
      "Dedicated compliance consultation",
      "Ongoing support and template updates"
    ]
  }
];

export function TradeSelection({ value, onValueChange, className = "" }: TradeSelectionProps) {
  return (
    <div className={className}>
      <RadioGroup
        value={value}
        onValueChange={onValueChange}
        className="space-y-6"
      >
        {tradeOptions.map((option) => (
          <div key={option.value} className="relative">
            <RadioGroupItem
              value={option.value}
              id={option.value}
              className="absolute top-4 left-4 z-10"
            />
            <Label
              htmlFor={option.value}
              className="block cursor-pointer"
            >
              <Card className={`transition-all hover:shadow-lg ${
                value === option.value 
                  ? 'border-construction-orange bg-orange-50 shadow-md' 
                  : 'hover:border-gray-300'
              }`}>
                <CardContent className="p-6 pl-16">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-construction-orange bg-opacity-10 rounded-lg flex items-center justify-center flex-shrink-0 text-construction-orange">
                      {option.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-charcoal mb-2">{option.title}</h3>
                      <p className="text-steel-gray mb-4">{option.description}</p>
                      <div className="grid md:grid-cols-2 gap-2">
                        {option.features.map((feature, index) => (
                          <div key={index} className="flex items-center space-x-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-compliant-green flex-shrink-0" />
                            <span className="text-charcoal">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}

export { tradeOptions };
export type { TradeOption };
