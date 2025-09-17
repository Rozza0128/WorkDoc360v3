import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Download, Settings, HardHat, Construction } from "lucide-react";

export default function TestDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" className="p-2">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-construction-orange bg-opacity-10 rounded-lg flex items-center justify-center">
                  <Construction className="h-6 w-6 text-construction-orange" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-charcoal">Rob & Son Scaffolding Services Ltd</h1>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">Scaffolding Contractor</Badge>
                    <span className="text-sm text-steel-gray">
                      Last updated: {new Date().toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-charcoal">Compliant</span>
              </div>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Generate Report
              </Button>
              <Button variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content with Tabs */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-100 p-4 mb-4 rounded">
          <h2 className="font-bold text-red-800">DEBUG: Tab Test Page</h2>
          <p className="text-red-700">Active tab: {activeTab}</p>
          <p className="text-red-700">This should show 8 tabs below:</p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full border-2 border-blue-500">
          <TabsList className="grid w-full grid-cols-8 bg-yellow-100 border-2 border-green-500">
            <TabsTrigger value="dashboard" className="bg-blue-200">Dashboard</TabsTrigger>
            <TabsTrigger value="documents" className="bg-blue-200">Generate</TabsTrigger>
            <TabsTrigger value="recommended" className="bg-blue-200">Recommended</TabsTrigger>
            <TabsTrigger value="upload" className="bg-blue-200">Upload</TabsTrigger>
            <TabsTrigger value="library" className="bg-blue-200">Library</TabsTrigger>
            <TabsTrigger value="users" className="bg-blue-200">Users</TabsTrigger>
            <TabsTrigger value="billing" className="bg-blue-200">Billing</TabsTrigger>
            <TabsTrigger value="settings" className="bg-blue-200">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="space-y-8 mt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">24</div>
                  <p className="text-xs text-muted-foreground">+2 from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">95%</div>
                  <p className="text-xs text-muted-foreground">+5% from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3</div>
                  <p className="text-xs text-muted-foreground">CSCS cards</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">7</div>
                  <p className="text-xs text-muted-foreground">2 new this week</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="documents" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Document Generation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-steel-gray">AI-powered document generation tools for your scaffolding business.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommended" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Recommended Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-steel-gray">Trade-specific document recommendations for scaffolding contractors.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upload" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Document Upload</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-steel-gray">Upload and manage your compliance documents.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="library" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Document Library</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-steel-gray">Browse and manage all your company documents.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-steel-gray">Manage team members and their access levels.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Billing & Subscriptions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-steel-gray">Manage your subscription and billing information.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Company Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-steel-gray">Configure your company settings and preferences.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}