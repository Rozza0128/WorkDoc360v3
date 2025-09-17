import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { FileText, Users, Eye, Building, HardHat, Wrench, CheckCircle, Download, Copy, Sparkles } from "lucide-react";

const documentGenerationSchema = z.object({
  templateType: z.string().min(1, "Please select a document type"),
  siteName: z.string().min(1, "Site name is required"),
  siteAddress: z.string().min(1, "Site address is required"),
  projectManager: z.string().min(1, "Project manager is required"),
  hazards: z.string().optional(),
  controlMeasures: z.string().optional(),
  specialRequirements: z.string().optional(),
  // Custom trade consultation fields
  customTradeDescription: z.string().optional(),
  customWorkActivities: z.string().optional(),
  customEquipment: z.string().optional(),
  customChallenges: z.string().optional(),
});

interface DocumentGeneratorProps {
  companyId: number;
  tradeType: string;
}

type DocumentGenerationData = z.infer<typeof documentGenerationSchema>;

export function DocumentGenerator({ companyId, tradeType }: DocumentGeneratorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [generatedDocument, setGeneratedDocument] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const isCustomTrade = tradeType === "other";

  const form = useForm<DocumentGenerationData>({
    resolver: zodResolver(documentGenerationSchema),
    defaultValues: {
      templateType: "",
      siteName: "",
      siteAddress: "",
      projectManager: "",
      hazards: "",
      controlMeasures: "",
      specialRequirements: "",
      customTradeDescription: "",
      customWorkActivities: "",
      customEquipment: "",
      customChallenges: "",
    },
  });

  const getAvailableTemplates = () => {
    if (isCustomTrade) {
      return [
        {
          id: "custom-consultation",
          name: "Custom Trade Consultation",
          description: "Professional research service for unlisted trades",
          icon: <Users className="h-4 w-4" />,
          price: "From £150",
          features: ["24hr review", "Bespoke templates", "UK compliance research"]
        }
      ];
    }

    const baseTemplates = [
      {
        id: "risk-assessment",
        name: "Risk Assessment",
        description: "Comprehensive site risk evaluation",
        icon: <FileText className="h-4 w-4" />,
        price: "Included",
        features: ["CDM 2015 compliant", "Site-specific hazards", "Control measures"]
      },
      {
        id: "method-statement",
        name: "Method Statement",
        description: "Step-by-step work procedures",
        icon: <FileText className="h-4 w-4" />,
        price: "Included",
        features: ["Safe work procedures", "Equipment requirements", "Emergency procedures"]
      },
    ];

    if (tradeType === "scaffolder") {
      return [
        ...baseTemplates,
        {
          id: "tg20-inspection",
          name: "TG20 Inspection Sheet",
          description: "CISRS compliant inspection record",
          icon: <Building className="h-4 w-4" />,
          price: "Included",
          features: ["TG20:24 compliant", "Daily inspections", "CISRS approved"]
        }
      ];
    }

    if (tradeType === "plasterer") {
      return [
        ...baseTemplates,
        {
          id: "material-certificate",
          name: "Material Certificate",
          description: "Product compliance documentation",
          icon: <HardHat className="h-4 w-4" />,
          price: "Included",
          features: ["CE marking", "British Standards", "Quality assurance"]
        }
      ];
    }

    return baseTemplates;
  };

  const availableTemplates = getAvailableTemplates();

  const getTemplateDetails = (templateId: string) => {
    return availableTemplates.find(t => t.id === templateId);
  };

  const generateDocument = useMutation({
    mutationFn: async (data: DocumentGenerationData) => {
      const response = await apiRequest("POST", `/api/companies/${companyId}/documents/generate`, {
        templateType: selectedTemplate,
        siteName: data.siteName,
        siteAddress: data.siteAddress,
        projectManager: data.projectManager,
        hazards: data.hazards,
        controlMeasures: data.controlMeasures,
        specialRequirements: data.specialRequirements,
        customTradeDescription: data.customTradeDescription,
        customWorkActivities: data.customWorkActivities,
        customEquipment: data.customEquipment,
        customChallenges: data.customChallenges,
      });
      return await response.json();
    },
    onSuccess: (response) => {
      if (isCustomTrade) {
        toast({
          title: "AI Consultation Generated",
          description: "Professional consultation document has been created using AI analysis.",
        });
      } else {
        toast({
          title: "AI Document Generated",
          description: "Your document has been created using AI-powered content generation.",
        });
      }
      
      setGeneratedDocument(response);
      
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${companyId}/documents`] });
      queryClient.invalidateQueries({ queryKey: ["/api/generated-documents"] });
      form.reset();
      setSelectedTemplate("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to process request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: DocumentGenerationData) => {
    generateDocument.mutate(data);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Template Selection */}
      <Card className="shadow-sm border-l-4 border-l-construction-orange">
        <CardHeader className="pb-6">
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5 text-construction-orange" />
            {isCustomTrade ? "Custom Trade Services" : "Document Templates"}
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            {isCustomTrade 
              ? "Professional consultation for trades not covered by our standard templates"
              : "Select a document template for your project"
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            {availableTemplates.map((template) => (
              <div
                key={template.id}
                className={`border-2 rounded-xl p-6 cursor-pointer transition-all duration-200 ${
                  selectedTemplate === template.id
                    ? "border-construction-orange bg-construction-orange/5 shadow-md ring-2 ring-construction-orange/20"
                    : "border-gray-200 hover:border-construction-orange/50 hover:shadow-sm"
                }`}
                onClick={() => {
                  setSelectedTemplate(template.id);
                  form.setValue("templateType", template.id);
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setSelectedTemplate(template.id);
                    form.setValue("templateType", template.id);
                  }
                }}
                aria-pressed={selectedTemplate === template.id}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className={`p-2 rounded-lg ${selectedTemplate === template.id ? 'bg-construction-orange text-white' : 'bg-gray-100 text-gray-600'}`}>
                      {template.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-charcoal">{template.name}</h3>
                        <Badge 
                          variant={template.price === "Included" ? "secondary" : "outline"} 
                          className="text-xs font-medium"
                        >
                          {template.price}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-3">{template.description}</p>
                      {template.features && (
                        <div className="flex flex-wrap gap-2">
                          {template.features.map((feature, index) => (
                            <span 
                              key={index}
                              className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-md"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  {selectedTemplate === template.id && (
                    <div className="ml-4">
                      <CheckCircle className="h-5 w-5 text-construction-orange" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Document Form */}
      {selectedTemplate && (
        <Card className="shadow-sm border-l-4 border-l-blue-500">
          <CardHeader className="pb-6">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <Building className="h-5 w-5 text-blue-500" />
              {isCustomTrade ? "Custom Trade Consultation" : "Document Details"}
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              {isCustomTrade 
                ? "Tell us about your business so we can research the right documents for you"
                : "Provide site-specific information for your document"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              {/* Custom Trade Research Form */}
              {isCustomTrade && selectedTemplate === "custom-consultation" && (
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
                    <h4 className="font-medium text-blue-900 mb-2">Bespoke Document Research Service</h4>
                    <p className="text-sm text-blue-700 mb-3">
                      Our compliance team will research your specific trade requirements and create custom documents. 
                      This service is charged at £150/hour with an estimated 2-4 hours for most trades.
                    </p>
                    <p className="text-xs text-blue-600">
                      You'll receive a detailed quote before any work begins.
                    </p>
                  </div>

                  <FormField
                    control={form.control}
                    name="customTradeDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Describe Your Trade/Business</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="e.g. We specialise in heritage stone restoration and conservation work on listed buildings..."
                            className="resize-none h-24"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Tell us exactly what your company does - be as specific as possible
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="customWorkActivities"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Main Work Activities</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="e.g. Lime mortar repointing, stone carving, structural repairs, cleaning using DOFF systems..."
                            className="resize-none h-20"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          List the main activities and processes your team performs
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="customEquipment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Equipment & Materials</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="e.g. Hydraulic lime, traditional hand tools, scaffolding, stone cutting equipment..."
                            className="resize-none h-20"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          What equipment, tools, and materials do you regularly use?
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="customChallenges"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Specific Safety Challenges</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="e.g. Working on unstable historic structures, dust control in occupied buildings, working around the public..."
                            className="resize-none h-20"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Any particular safety challenges or risks specific to your work
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Standard Document Generation Form */}
              {(!isCustomTrade || selectedTemplate !== "custom-consultation") && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="templateType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Document Type</FormLabel>
                        <Select 
                          onValueChange={(value) => {
                            field.onChange(value);
                            setSelectedTemplate(value);
                          }} 
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select document type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availableTemplates.map((template) => (
                              <SelectItem key={template.id} value={template.id}>
                                {template.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="siteName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Site Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Residential Development Phase 2" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="siteAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Site Address</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Full site address including postcode"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="projectManager"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Manager</FormLabel>
                        <FormControl>
                          <Input placeholder="Name of responsible person" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {selectedTemplate && (
                    <div className="space-y-6">
                      <FormField
                        control={form.control}
                        name="hazards"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel className="text-sm font-medium text-charcoal">Specific Hazards</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="List any site-specific hazards or risks (e.g., working at height, confined spaces, electrical hazards)"
                                className="resize-none min-h-[100px] border-gray-300 focus:border-construction-orange focus:ring-construction-orange"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription className="text-sm text-muted-foreground">
                              Identify hazards specific to your site conditions
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="controlMeasures"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Control Measures</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Describe control measures and safety procedures"
                                className="resize-none"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Specify how identified risks will be controlled
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="specialRequirements"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Special Requirements</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Any special client or site requirements"
                                className="resize-none"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
                <Button 
                  type="submit" 
                  disabled={generateDocument.isPending || !selectedTemplate}
                  className="flex-1 h-12 text-base font-medium bg-construction-orange hover:bg-construction-orange-dark transition-colors"
                >
                  {generateDocument.isPending ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                      {isCustomTrade ? "Submitting Request..." : "Generating..."}
                    </div>
                  ) : (
                    <>
                      {isCustomTrade && selectedTemplate === "custom-consultation" ? (
                        <>
                          <Users className="mr-2 h-5 w-5" />
                          Submit Research Request
                        </>
                      ) : (
                        <>
                          <FileText className="mr-2 h-5 w-5" />
                          Generate Document
                        </>
                      )}
                    </>
                  )}
                </Button>
                
                {selectedTemplate && !isCustomTrade && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="sm:w-auto h-12 border-construction-orange text-construction-orange hover:bg-construction-orange/5"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </Button>
                )}
              </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* Generated Document Preview */}
      {generatedDocument && (
        <Card className="shadow-sm border-l-4 border-l-green-500">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Document Generated Successfully
            </CardTitle>
            <CardDescription className="text-base">
              {generatedDocument.name || 'Untitled Document'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Document Summary */}
            {generatedDocument.summary && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Document Summary</h4>
                <p className="text-blue-800 text-sm">{generatedDocument.summary}</p>
              </div>
            )}

            {/* Document Content Preview */}
            {generatedDocument.content && (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Document Content</h4>
                <div className="bg-gray-50 border rounded-lg p-4 max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans">
                    {generatedDocument.content}
                  </pre>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t flex-wrap">
              <Button
                onClick={() => window.open(generatedDocument.downloadUrl, '_blank')}
                className="bg-construction-orange hover:bg-orange-600"
              >
                <Download className="mr-2 h-4 w-4" />
                Download Document
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setGeneratedDocument(null)}
              >
                Generate Another Document
              </Button>

              {generatedDocument.type !== 'consultation' && generatedDocument.content && (
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(generatedDocument.content || '');
                    toast({
                      title: "Copied to Clipboard",
                      description: "Document content copied to clipboard",
                    });
                  }}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Content
                </Button>
              )}
            </div>

            {/* AI Generation Info */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-purple-600" />
                <span className="font-medium text-purple-900">AI-Powered Generation</span>
              </div>
              <p className="text-purple-800 text-sm">
                This document was created using advanced AI technology, ensuring compliance with UK construction regulations 
                and industry best practices. The content is tailored to your specific trade type and project requirements.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}