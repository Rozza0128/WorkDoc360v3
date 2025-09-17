import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Mail, Gift, Clock, Star } from "lucide-react";

const emailCaptureSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  tradeType: z.string().optional(),
});

type EmailCaptureData = z.infer<typeof emailCaptureSchema>;

interface EmailCaptureProps {
  variant?: "exit_intent" | "pricing_page" | "feature_gate" | "newsletter";
  title?: string;
  description?: string;
  incentive?: string;
  className?: string;
}

export function EmailCapture({ 
  variant = "newsletter",
  title,
  description,
  incentive,
  className = ""
}: EmailCaptureProps) {
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<EmailCaptureData>({
    resolver: zodResolver(emailCaptureSchema),
    defaultValues: {
      email: "",
      firstName: "",
      tradeType: "",
    },
  });

  const submitEmailMutation = useMutation({
    mutationFn: async (data: EmailCaptureData) => {
      const response = await apiRequest("POST", "/api/email-capture", {
        ...data,
        source: variant,
        capturedAt: new Date().toISOString(),
      });
      return response;
    },
    onSuccess: () => {
      setIsSubmitted(true);
      toast({
        title: "Thanks for subscribing!",
        description: "We'll keep you updated with UK construction compliance tips and updates.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Something went wrong",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: EmailCaptureData) => {
    submitEmailMutation.mutate(data);
  };

  if (isSubmitted) {
    return (
      <Card className={`${className} border-green-200 bg-green-50`}>
        <CardContent className="p-6 text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-green-800 mb-2">You're all set!</h3>
          <p className="text-green-700">
            Check your inbox for exclusive construction compliance resources and updates.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Content based on variant
  const getContent = () => {
    switch (variant) {
      case "exit_intent":
        return {
          title: title || "Wait! Don't Miss Out on Compliance Tips",
          description: description || "Get free UK construction compliance guides and industry updates before you go.",
          incentive: incentive || "🎁 Free Risk Assessment Template"
        };
      case "pricing_page":
        return {
          title: title || "Get Notified When We Launch New Features",
          description: description || "Be the first to know about new compliance tools and special pricing.",
          incentive: incentive || "⚡ Early access & 20% discount"
        };
      case "feature_gate":
        return {
          title: title || "Unlock Premium Compliance Templates",
          description: description || "Get access to our library of professional compliance documents.",
          incentive: incentive || "📋 5 Free Premium Templates"
        };
      default:
        return {
          title: title || "Stay Updated with Construction Compliance",
          description: description || "Get weekly tips, regulatory updates, and industry insights.",
          incentive: incentive || "📧 Weekly compliance newsletter"
        };
    }
  };

  const content = getContent();

  return (
    <Card className={`${className} border-construction-orange`}>
      <CardHeader className="text-center">
        <CardTitle className="text-xl text-charcoal flex items-center justify-center gap-2">
          <Star className="h-5 w-5 text-construction-orange" />
          {content.title}
        </CardTitle>
        <p className="text-steel-gray">{content.description}</p>
        {content.incentive && (
          <div className="bg-construction-orange bg-opacity-10 text-construction-orange px-4 py-2 rounded-lg font-semibold">
            {content.incentive}
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="First name"
                        {...field}
                        className="text-base"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Work email"
                        {...field}
                        className="text-base"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button
              type="submit"
              disabled={submitEmailMutation.isPending}
              className="w-full bg-construction-orange hover:bg-orange-600"
            >
              {submitEmailMutation.isPending ? (
                <>
                  <Clock className="mr-2 h-4 w-4 animate-spin" />
                  Subscribing...
                </>
              ) : (
                <>
                  <Gift className="mr-2 h-4 w-4" />
                  Get Free Resources
                </>
              )}
            </Button>
          </form>
        </Form>
        
        <p className="text-xs text-steel-gray text-center mt-3">
          No spam. Unsubscribe anytime. We respect your privacy.
        </p>
      </CardContent>
    </Card>
  );
}