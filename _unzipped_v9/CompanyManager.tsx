import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Building,
  Plus,
  Trash2,
  Edit,
  Users,
  FileText,
  Settings,
  MapPin,
  Phone,
  Mail,
  Calendar
} from "lucide-react";

const tradeTypes = [
  { value: "scaffolder", label: "Scaffolding Contractor" },
  { value: "plasterer", label: "Plastering Contractor" },
  { value: "general_building_contractor", label: "General Building Contractor" },
  { value: "bricklayer", label: "Bricklayer" },
  { value: "carpenter", label: "Carpenter" },
  { value: "electrician", label: "Electrician" },
  { value: "plumber", label: "Plumber" },
  { value: "roofer", label: "Roofer" },
  { value: "painter_decorator", label: "Painter & Decorator" },
  { value: "heating_engineer", label: "Heating Engineer" },
];

const businessTypes = [
  { value: "limited_company", label: "Limited Company" },
  { value: "sole_trader", label: "Sole Trader" },
  { value: "partnership", label: "Partnership" },
  { value: "llp", label: "Limited Liability Partnership" },
  { value: "charity", label: "Charity/Non-profit" },
  { value: "other", label: "Other" },
];

export function CompanyManager() {
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingCompany, setEditingCompany] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    businessType: "",
    tradeType: "",
    address: "",
    phone: "",
    email: "",
    registrationNumber: "",
    description: "",
  });

  const { data: companies, isLoading } = useQuery({
    queryKey: ["/api/companies"],
  });

  const createCompanyMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/companies", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      setShowCreateDialog(false);
      setFormData({
        name: "",
        businessType: "",
        tradeType: "",
        address: "",
        phone: "",
        email: "",
        registrationNumber: "",
        description: "",
      });
      toast({
        title: "Company Created",
        description: "Demo company has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create company",
        variant: "destructive",
      });
    },
  });

  const deleteCompanyMutation = useMutation({
    mutationFn: async (companyId: number) => {
      const res = await apiRequest("DELETE", `/api/companies/${companyId}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      toast({
        title: "Company Deleted",
        description: "Demo company has been removed successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete company",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.businessType || !formData.tradeType) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    createCompanyMutation.mutate(formData);
  };

  const createDemoCompany = (type: 'small' | 'medium' | 'large') => {
    const demoData = {
      small: {
        name: "Small Demo Construction Ltd",
        businessType: "limited_company",
        tradeType: "general_building_contractor",
        address: "123 Demo Street, London, SW1A 1AA",
        phone: "020 7123 4567",
        email: "demo@smallconstruction.co.uk",
        registrationNumber: "12345678",
        description: "Small construction company for demo purposes",
      },
      medium: {
        name: "Medium Build Partners LLP",
        businessType: "llp",
        tradeType: "scaffolder",
        address: "456 Construction Avenue, Manchester, M1 1AA",
        phone: "0161 234 5678",
        email: "info@mediumbuild.co.uk",
        registrationNumber: "OC123456",
        description: "Medium-sized scaffolding company for demo",
      },
      large: {
        name: "Enterprise Construction Group",
        businessType: "limited_company",
        tradeType: "general_building_contractor",
        address: "789 Corporate Plaza, Birmingham, B1 1AA",
        phone: "0121 345 6789",
        email: "contact@enterpriseconstruction.co.uk",
        registrationNumber: "87654321",
        description: "Large construction enterprise for demo purposes",
      },
    };

    createCompanyMutation.mutate(demoData[type]);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Company Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Building className="h-5 w-5 text-construction-orange" />
              <span>Company Management</span>
            </div>
            <div className="flex items-center space-x-2">
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Company
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create Demo Company</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Company Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Enter company name"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="businessType">Business Type *</Label>
                        <Select
                          value={formData.businessType}
                          onValueChange={(value) => setFormData({ ...formData, businessType: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select business type" />
                          </SelectTrigger>
                          <SelectContent>
                            {businessTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="tradeType">Trade Type *</Label>
                        <Select
                          value={formData.tradeType}
                          onValueChange={(value) => setFormData({ ...formData, tradeType: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select trade type" />
                          </SelectTrigger>
                          <SelectContent>
                            {tradeTypes.map((trade) => (
                              <SelectItem key={trade.value} value={trade.value}>
                                {trade.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="registrationNumber">Registration Number</Label>
                        <Input
                          id="registrationNumber"
                          value={formData.registrationNumber}
                          onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                          placeholder="Companies House number"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Textarea
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Company address"
                        rows={2}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="Phone number"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="Company email"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Brief company description"
                        rows={2}
                      />
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowCreateDialog(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={createCompanyMutation.isPending}
                      >
                        {createCompanyMutation.isPending ? "Creating..." : "Create Company"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Quick Demo Company Creation */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-medium text-blue-900 mb-3">Quick Demo Companies</h3>
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => createDemoCompany('small')}
                disabled={createCompanyMutation.isPending}
              >
                Add Small Company
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => createDemoCompany('medium')}
                disabled={createCompanyMutation.isPending}
              >
                Add Medium Company
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => createDemoCompany('large')}
                disabled={createCompanyMutation.isPending}
              >
                Add Large Company
              </Button>
            </div>
          </div>

          {/* Companies List */}
          <div className="space-y-4">
            {companies?.map((company: any) => (
              <div key={company.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-charcoal">{company.name}</h3>
                      <Badge variant="outline" className="text-xs">
                        {company.tradeType?.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                        {company.businessType?.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      {company.address && (
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-steel-gray" />
                          <span className="text-steel-gray truncate">{company.address}</span>
                        </div>
                      )}
                      {company.phone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-steel-gray" />
                          <span className="text-steel-gray">{company.phone}</span>
                        </div>
                      )}
                      {company.email && (
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-steel-gray" />
                          <span className="text-steel-gray">{company.email}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-steel-gray" />
                        <span className="text-steel-gray">
                          {new Date(company.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {company.description && (
                      <p className="text-sm text-steel-gray mt-2">{company.description}</p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`/dashboard/${company.id}`, '_blank')}
                    >
                      <Settings className="h-4 w-4 mr-1" />
                      Open
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete "${company.name}"? This action cannot be undone.`)) {
                          deleteCompanyMutation.mutate(company.id);
                        }
                      }}
                      disabled={deleteCompanyMutation.isPending}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {!companies?.length && (
              <div className="text-center py-8">
                <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No companies found</p>
                <p className="text-sm text-gray-500">Create demo companies using the buttons above</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}