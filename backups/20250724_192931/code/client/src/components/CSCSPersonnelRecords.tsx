import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users, 
  CreditCard,
  Calendar,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Clock,
  Search,
  FileText,
  Download,
  Plus,
  Building2,
  Shield
} from "lucide-react";

interface PersonnelRecord {
  id: string;
  employeeName: string;
  employeeId: string;
  employmentType: 'permanent' | 'temporary' | 'subcontractor' | 'agency' | 'freelance';
  contractorCompany?: string;
  agencyName?: string;
  contractStartDate?: string;
  contractEndDate?: string;
  primaryTrade: string;
  role: string;
  skillLevel: 'apprentice' | 'skilled' | 'supervisor' | 'manager';
  cscsCardNumber: string;
  cardType: string;
  cardColor: string;
  issueDate: string;
  expiryDate: string;
  verificationDate: string;
  status: 'valid' | 'expiring' | 'expired' | 'pending';
  currentSite: string;
  currentProject: string;
  siteStartDate: string;
  expectedEndDate?: string;
  dayRate?: number;
  insuranceProvider?: string;
  publicLiabilityAmount?: number;
  inductionCompleted: boolean;
  inductionDate?: string;
  recordStatus: 'active' | 'suspended' | 'archived';
  photoUrl?: string;
}

interface CSCSPersonnelRecordsProps {
  companyId: string;
}

export function CSCSPersonnelRecords({ companyId }: CSCSPersonnelRecordsProps) {
  const [personnel, setPersonnel] = useState<PersonnelRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [siteFilter, setSiteFilter] = useState('all');
  const [employmentFilter, setEmploymentFilter] = useState('all');

  // Mock personnel data reflecting real construction workforce diversity
  useEffect(() => {
    const mockPersonnel: PersonnelRecord[] = [
      {
        id: '1',
        employeeName: 'John Worker',
        employeeId: 'EMP001',
        employmentType: 'permanent',
        primaryTrade: 'Scaffolding',
        role: 'Lead Scaffolder',
        skillLevel: 'skilled',
        cscsCardNumber: 'JW027401',
        cardType: 'Green CSCS Labourer Card',
        cardColor: 'Green',
        issueDate: '2020-01-15',
        expiryDate: '2025-01-15',
        verificationDate: '2025-01-24',
        status: 'valid',
        currentSite: 'Manchester Office Development',
        currentProject: 'MAN-2025-001',
        siteStartDate: '2024-11-01',
        expectedEndDate: '2025-06-30',
        contractStartDate: '2020-01-15',
        inductionCompleted: true,
        inductionDate: '2024-10-28',
        recordStatus: 'active',
        insuranceProvider: 'Zurich Insurance',
        publicLiabilityAmount: 200000000 // £2M in pence
      },
      {
        id: '2',
        employeeName: 'Sarah Builder',
        employeeId: 'TEMP002',
        employmentType: 'temporary',
        primaryTrade: 'General Construction',
        role: 'Site Supervisor',
        skillLevel: 'supervisor',
        cscsCardNumber: 'SB045782',
        cardType: 'Blue CSCS Supervisor Card',
        cardColor: 'Blue',
        issueDate: '2019-06-20',
        expiryDate: '2024-06-20',
        verificationDate: '2024-12-10',
        status: 'expired',
        currentSite: 'London Bridge Project',
        currentProject: 'LON-2024-047',
        siteStartDate: '2024-09-15',
        expectedEndDate: '2025-03-31',
        contractStartDate: '2024-09-01',
        contractEndDate: '2025-04-30',
        dayRate: 35000, // £350/day in pence
        inductionCompleted: false,
        recordStatus: 'suspended', // Due to expired card
        insuranceProvider: 'AXA Business Insurance'
      },
      {
        id: '3',
        employeeName: 'Mike Carpenter',
        employeeId: 'SUB003',
        employmentType: 'subcontractor',
        contractorCompany: 'Midlands Carpentry Ltd',
        primaryTrade: 'Carpentry',
        role: 'Skilled Carpenter',
        skillLevel: 'skilled',
        cscsCardNumber: 'MC067893',
        cardType: 'Blue CSCS Skilled Worker Card',
        cardColor: 'Blue',
        issueDate: '2022-03-10',
        expiryDate: '2025-03-10',
        verificationDate: '2025-01-20',
        status: 'expiring',
        currentSite: 'Birmingham Retail Park',
        currentProject: 'BIR-2024-023',
        siteStartDate: '2024-12-01',
        expectedEndDate: '2025-08-31',
        contractStartDate: '2024-12-01',
        contractEndDate: '2025-09-30',
        dayRate: 28000, // £280/day
        inductionCompleted: true,
        inductionDate: '2024-11-25',
        recordStatus: 'active',
        insuranceProvider: 'Aviva Commercial',
        publicLiabilityAmount: 100000000 // £1M
      },
      {
        id: '4',
        employeeName: 'Lisa Electrician',
        employeeId: 'AGY004',
        employmentType: 'agency',
        agencyName: 'Northern Electrical Recruitment',
        primaryTrade: 'Electrical',
        role: 'Qualified Electrician',
        skillLevel: 'skilled',
        cscsCardNumber: 'LE089234',
        cardType: 'Gold CSCS Electrician Card',
        cardColor: 'Gold',
        issueDate: '2021-09-15',
        expiryDate: '2026-09-15',
        verificationDate: '2025-01-22',
        status: 'valid',
        currentSite: 'Leeds Hospital Extension',
        currentProject: 'LEE-2024-089',
        siteStartDate: '2025-01-15',
        expectedEndDate: '2025-12-31',
        contractStartDate: '2025-01-10',
        contractEndDate: '2026-01-31',
        dayRate: 42000, // £420/day
        inductionCompleted: true,
        inductionDate: '2025-01-08',
        recordStatus: 'active',
        insuranceProvider: 'QBE Insurance',
        publicLiabilityAmount: 500000000 // £5M
      },
      {
        id: '5',
        employeeName: 'Tom Apprentice',
        employeeId: 'APP005',
        employmentType: 'permanent',
        primaryTrade: 'Plumbing',
        role: 'Plumbing Apprentice',
        skillLevel: 'apprentice',
        cscsCardNumber: 'TA093847',
        cardType: 'Red CSCS Trainee Card',
        cardColor: 'Red',
        issueDate: '2024-09-01',
        expiryDate: '2027-09-01',
        verificationDate: '2025-01-23',
        status: 'valid',
        currentSite: 'Manchester Office Development',
        currentProject: 'MAN-2025-001',
        siteStartDate: '2024-09-15',
        contractStartDate: '2024-09-01',
        contractEndDate: '2027-08-31', // 3-year apprenticeship
        dayRate: 8000, // £80/day apprentice rate
        inductionCompleted: true,
        inductionDate: '2024-09-01',
        recordStatus: 'active',
        insuranceProvider: 'Company Policy'
      }
    ];

    setPersonnel(mockPersonnel);
  }, [companyId]);

  const filteredPersonnel = personnel.filter(person => {
    const matchesSearch = person.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         person.cscsCardNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         person.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         person.primaryTrade.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || person.status === statusFilter;
    const matchesSite = siteFilter === 'all' || person.currentSite === siteFilter;
    const matchesEmployment = employmentFilter === 'all' || person.employmentType === employmentFilter;
    
    return matchesSearch && matchesStatus && matchesSite && matchesEmployment;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      valid: { variant: 'default' as const, icon: CheckCircle, text: 'Valid' },
      expiring: { variant: 'secondary' as const, icon: Clock, text: 'Expiring Soon' },
      expired: { variant: 'destructive' as const, icon: AlertTriangle, text: 'Expired' },
      pending: { variant: 'outline' as const, icon: Clock, text: 'Pending Verification' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    );
  };

  const getCardColorBadge = (color: string) => {
    const colorClasses = {
      'Green': 'bg-green-100 text-green-800 border-green-300',
      'Blue': 'bg-blue-100 text-blue-800 border-blue-300',
      'Gold': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'Red': 'bg-red-100 text-red-800 border-red-300',
      'White': 'bg-gray-100 text-gray-800 border-gray-300',
      'Black': 'bg-gray-900 text-white border-gray-700'
    };
    
    return (
      <Badge className={colorClasses[color as keyof typeof colorClasses] || 'bg-gray-100 text-gray-800'}>
        {color} Card
      </Badge>
    );
  };

  const sites = Array.from(new Set(personnel.map(p => p.currentSite)));
  const employmentTypes = Array.from(new Set(personnel.map(p => p.employmentType)));

  const getEmploymentTypeBadge = (type: string) => {
    const typeConfig = {
      permanent: 'bg-green-100 text-green-800 border-green-300',
      temporary: 'bg-blue-100 text-blue-800 border-blue-300',
      subcontractor: 'bg-orange-100 text-orange-800 border-orange-300',
      agency: 'bg-purple-100 text-purple-800 border-purple-300',
      freelance: 'bg-gray-100 text-gray-800 border-gray-300'
    };
    
    return (
      <Badge className={typeConfig[type as keyof typeof typeConfig] || 'bg-gray-100 text-gray-800'}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with Business Context */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-6 w-6 mr-2 text-orange-600" />
            CSCS Personnel Records Management
          </CardTitle>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                <Shield className="h-4 w-4 mr-2" />
                Site Access Control
              </h4>
              <p className="text-sm text-blue-700">
                Verify all personnel have valid CSCS cards before allowing site access. 
                Essential for HSE compliance and insurance requirements.
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-900 mb-2 flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Audit & Compliance
              </h4>
              <p className="text-sm text-green-700">
                Maintain comprehensive records for CDM 2015 compliance, 
                insurance claims, and principal contractor obligations.
              </p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <h4 className="font-semibold text-orange-900 mb-2 flex items-center">
                <Building2 className="h-4 w-4 mr-2" />
                Project Management
              </h4>
              <p className="text-sm text-orange-700">
                Track qualifications across multiple sites, manage renewals, 
                and ensure competent person requirements are met.
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, card number, or role..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="valid">Valid</SelectItem>
                <SelectItem value="expiring">Expiring Soon</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Select value={siteFilter} onValueChange={setSiteFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by site" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sites</SelectItem>
                {sites.map(site => (
                  <SelectItem key={site} value={site}>{site}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={employmentFilter} onValueChange={setEmploymentFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Employment type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {employmentTypes.map(type => (
                  <SelectItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button className="bg-orange-600 hover:bg-orange-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Personnel
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Personnel Records Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Personnel Records ({filteredPersonnel.length})</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Compliance Audit
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-semibold">Employee</th>
                  <th className="text-left p-3 font-semibold">Employment</th>
                  <th className="text-left p-3 font-semibold">CSCS Card</th>
                  <th className="text-left p-3 font-semibold">Status</th>
                  <th className="text-left p-3 font-semibold">Current Assignment</th>
                  <th className="text-left p-3 font-semibold">Contract & Rates</th>
                  <th className="text-left p-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPersonnel.map((person) => (
                  <tr key={person.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div>
                        <div className="font-medium">{person.employeeName}</div>
                        <div className="text-sm text-gray-500">
                          {person.employeeId} • {person.primaryTrade}
                        </div>
                        <div className="text-xs text-gray-400">
                          {person.role} ({person.skillLevel})
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="space-y-1">
                        {getEmploymentTypeBadge(person.employmentType)}
                        {person.contractorCompany && (
                          <div className="text-xs text-gray-500">{person.contractorCompany}</div>
                        )}
                        {person.agencyName && (
                          <div className="text-xs text-gray-500">via {person.agencyName}</div>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center">
                        <CreditCard className="h-4 w-4 mr-2 text-gray-400" />
                        <div>
                          <div className="font-mono text-sm">{person.cscsCardNumber}</div>
                          <div className="text-xs text-gray-500">
                            Expires: {new Date(person.expiryDate).toLocaleDateString('en-GB')}
                          </div>
                        </div>
                      </div>
                      <div className="mt-1">
                        {getCardColorBadge(person.cardColor)}
                      </div>
                    </td>
                    <td className="p-3">
                      {getStatusBadge(person.status)}
                      <div className="mt-1">
                        <Badge variant={person.inductionCompleted ? 'default' : 'destructive'} className="text-xs">
                          {person.inductionCompleted ? 'Inducted' : 'No Induction'}
                        </Badge>
                      </div>
                    </td>
                    <td className="p-3">
                      <div>
                        <div className="flex items-center text-sm">
                          <MapPin className="h-3 w-3 mr-1 text-gray-400" />
                          {person.currentSite}
                        </div>
                        <div className="text-xs text-gray-500">
                          Project: {person.currentProject}
                        </div>
                        <div className="text-xs text-gray-400">
                          Started: {new Date(person.siteStartDate).toLocaleDateString('en-GB')}
                          {person.expectedEndDate && (
                            <span> • Ends: {new Date(person.expectedEndDate).toLocaleDateString('en-GB')}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="text-sm">
                        {person.dayRate && (
                          <div className="font-medium">£{(person.dayRate / 100).toFixed(0)}/day</div>
                        )}
                        {person.contractEndDate ? (
                          <div className="text-xs text-gray-500">
                            Contract ends: {new Date(person.contractEndDate).toLocaleDateString('en-GB')}
                          </div>
                        ) : (
                          <div className="text-xs text-green-600">Permanent</div>
                        )}
                        {person.publicLiabilityAmount && (
                          <div className="text-xs text-gray-400">
                            Insurance: £{(person.publicLiabilityAmount / 100000000)}M
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Re-verify
                        </Button>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Personnel</p>
                <p className="text-2xl font-bold">{personnel.length}</p>
                <p className="text-xs text-gray-500">
                  Permanent: {personnel.filter(p => p.employmentType === 'permanent').length} • 
                  Temporary: {personnel.filter(p => p.employmentType === 'temporary').length} • 
                  Contractors: {personnel.filter(p => p.employmentType === 'subcontractor' || p.employmentType === 'agency').length}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Valid Cards</p>
                <p className="text-2xl font-bold text-green-600">
                  {personnel.filter(p => p.status === 'valid').length}
                </p>
                <p className="text-xs text-gray-500">
                  {Math.round((personnel.filter(p => p.status === 'valid').length / personnel.length) * 100)}% compliance
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Needs Attention</p>
                <p className="text-2xl font-bold text-orange-600">
                  {personnel.filter(p => p.status === 'expiring' || p.status === 'expired' || !p.inductionCompleted).length}
                </p>
                <p className="text-xs text-gray-500">
                  Cards + Inductions
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Daily Rate Total</p>
                <p className="text-2xl font-bold text-green-600">
                  £{personnel.filter(p => p.dayRate && p.recordStatus === 'active')
                           .reduce((sum, p) => sum + (p.dayRate || 0), 0) / 100}
                </p>
                <p className="text-xs text-gray-500">
                  Active workforce daily cost
                </p>
              </div>
              <Building2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}