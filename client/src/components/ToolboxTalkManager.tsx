import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { 
  MessageSquare, 
  Plus, 
  Calendar,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  FileText,
  Mic,
  MicOff,
  Save,
  Eye,
  Download
} from "lucide-react";

interface ToolboxTalk {
  id: string;
  title: string;
  topic: string;
  date: string;
  conductor: string;
  attendees: string[];
  duration: number;
  keyPoints: string[];
  hazards: string[];
  actionItems: string[];
  completed: boolean;
  notes?: string;
}

interface ToolboxTalkManagerProps {
  companyId: number;
  userRole: string;
}

const toolboxTalkSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title too long"),
  topic: z.string().min(5, "Topic must be at least 5 characters").max(200, "Topic too long"),
  conductor: z.string().min(2, "Conductor name required").max(50, "Name too long"),
  attendees: z.string().min(5, "At least one attendee required"),
  keyPoints: z.string().min(10, "Key points must be detailed").max(500, "Key points too long"),
  hazards: z.string().optional(),
  actionItems: z.string().optional(),
  notes: z.string().optional()
});

type ToolboxTalkData = z.infer<typeof toolboxTalkSchema>;

export function ToolboxTalkManager({ companyId, userRole }: ToolboxTalkManagerProps) {
  const [toolboxTalks, setToolboxTalks] = useState<ToolboxTalk[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedTalk, setSelectedTalk] = useState<ToolboxTalk | null>(null);
  const [showNewTalkForm, setShowNewTalkForm] = useState(false);
  const { toast } = useToast();

  const form = useForm<ToolboxTalkData>({
    resolver: zodResolver(toolboxTalkSchema),
    defaultValues: {
      title: "",
      topic: "",
      conductor: "",
      attendees: "",
      keyPoints: "",
      hazards: "",
      actionItems: "",
      notes: ""
    }
  });

  // Mock data - replace with real API
  useEffect(() => {
    const mockTalks: ToolboxTalk[] = [
      {
        id: '1',
        title: 'Working at Height Safety',
        topic: 'Fall prevention and safety harness use',
        date: '2025-01-22',
        conductor: 'John Smith',
        attendees: ['Mark Johnson', 'Sarah Wilson', 'Mike Brown', 'Emma Davis'],
        duration: 15,
        keyPoints: [
          'Always inspect harnesses before use',
          'Maintain three points of contact',
          'Check weather conditions',
          'Ensure proper anchor points'
        ],
        hazards: ['Falls from height', 'Equipment failure', 'Weather conditions'],
        actionItems: ['Replace worn harness - Mark', 'Install new anchor point - Mike'],
        completed: true,
        notes: 'All team members demonstrated proper harness fitting'
      },
      {
        id: '2',
        title: 'Manual Handling Techniques',
        topic: 'Safe lifting and carrying procedures',
        date: '2025-01-20',
        conductor: 'Sarah Wilson',
        attendees: ['John Smith', 'Mark Johnson', 'Lisa Green'],
        duration: 20,
        keyPoints: [
          'Assess load before lifting',
          'Keep back straight',
          'Use mechanical aids when possible',
          'Get help for heavy items'
        ],
        hazards: ['Back strain', 'Muscle injury', 'Dropped loads'],
        actionItems: ['Order lifting aids - John', 'Review lifting policy - Sarah'],
        completed: true,
        notes: 'Demonstrated proper lifting technique with building materials'
      },
      {
        id: '3',
        title: 'Site Security Procedures',
        topic: 'End of day security and material protection',
        date: '2025-01-18',
        conductor: 'Mike Brown',
        attendees: ['All site staff'],
        duration: 10,
        keyPoints: [
          'Secure all tools and equipment',
          'Check site boundaries',
          'Set security systems',
          'Report any concerns'
        ],
        hazards: ['Theft', 'Vandalism', 'Unauthorised access'],
        actionItems: ['Install additional security lighting', 'Update access codes'],
        completed: false
      }
    ];
    
    setToolboxTalks(mockTalks);
  }, [companyId]);

  const handleSubmitTalk = (data: ToolboxTalkData) => {
    const newTalk: ToolboxTalk = {
      id: Date.now().toString(),
      title: data.title,
      topic: data.topic,
      date: new Date().toISOString().split('T')[0],
      conductor: data.conductor,
      attendees: data.attendees.split(',').map(name => name.trim()),
      duration: 15, // Default duration
      keyPoints: data.keyPoints.split('\n').filter(point => point.trim()),
      hazards: data.hazards ? data.hazards.split(',').map(h => h.trim()) : [],
      actionItems: data.actionItems ? data.actionItems.split('\n').filter(item => item.trim()) : [],
      completed: true,
      notes: data.notes
    };

    setToolboxTalks(prev => [newTalk, ...prev]);
    setShowNewTalkForm(false);
    form.reset();
    
    toast({
      title: "Toolbox Talk Recorded",
      description: "Your toolbox talk has been successfully recorded and saved.",
    });
  };

  const startRecording = () => {
    setIsRecording(true);
    toast({
      title: "Recording Started",
      description: "Recording toolbox talk. Speak clearly into your device.",
    });
    
    // Simulate recording for demo
    setTimeout(() => {
      setIsRecording(false);
      toast({
        title: "Recording Complete",
        description: "Your toolbox talk has been recorded and transcribed.",
      });
    }, 5000);
  };

  const getCompletionBadge = (completed: boolean) => {
    return completed ? (
      <Badge className="bg-green-100 text-green-800">Completed</Badge>
    ) : (
      <Badge variant="secondary">In Progress</Badge>
    );
  };

  const thisWeekTalks = toolboxTalks.filter(talk => {
    const talkDate = new Date(talk.date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return talkDate >= weekAgo;
  });

  const thisMonthTalks = toolboxTalks.filter(talk => {
    const talkDate = new Date(talk.date);
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    return talkDate >= monthAgo;
  });

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-construction-orange rounded-lg flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-steel-gray">This Week</p>
                <p className="text-2xl font-bold text-charcoal">{thisWeekTalks.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-steel-gray">This Month</p>
                <p className="text-2xl font-bold text-charcoal">{thisMonthTalks.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-steel-gray">Completed</p>
                <p className="text-2xl font-bold text-charcoal">
                  {toolboxTalks.filter(talk => talk.completed).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-steel-gray">Avg Attendees</p>
                <p className="text-2xl font-bold text-charcoal">
                  {toolboxTalks.length > 0 ? 
                    Math.round(toolboxTalks.reduce((sum, talk) => sum + talk.attendees.length, 0) / toolboxTalks.length) 
                    : 0
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              Quick Actions
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Dialog open={showNewTalkForm} onOpenChange={setShowNewTalkForm}>
              <DialogTrigger asChild>
                <Button className="h-20 bg-construction-orange hover:bg-orange-600">
                  <div className="text-center">
                    <Plus className="h-6 w-6 mx-auto mb-2" />
                    <span>Record New Talk</span>
                  </div>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Record Toolbox Talk</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSubmitTalk)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Talk Title</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Working at Height Safety" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="conductor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Conducted By</FormLabel>
                            <FormControl>
                              <Input placeholder="Name of person conducting talk" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="topic"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Topic</FormLabel>
                          <FormControl>
                            <Input placeholder="Brief description of the safety topic" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="attendees"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Attendees</FormLabel>
                          <FormControl>
                            <Input placeholder="Names separated by commas" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="keyPoints"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Key Points Covered</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Enter key safety points, one per line"
                              className="min-h-24"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="hazards"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Hazards Discussed (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="Separated by commas" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="actionItems"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Action Items (Optional)</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Actions to be taken, one per line"
                                className="min-h-16"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Additional Notes (Optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Any additional observations or comments"
                              className="min-h-16"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end space-x-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setShowNewTalkForm(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" className="bg-construction-orange hover:bg-orange-600">
                        <Save className="h-4 w-4 mr-2" />
                        Save Talk
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>

            <Button 
              variant="outline" 
              className="h-20"
              onClick={startRecording}
              disabled={isRecording}
            >
              <div className="text-center">
                {isRecording ? (
                  <>
                    <MicOff className="h-6 w-6 mx-auto mb-2 text-red-500 animate-pulse" />
                    <span>Recording...</span>
                  </>
                ) : (
                  <>
                    <Mic className="h-6 w-6 mx-auto mb-2" />
                    <span>Voice Recording</span>
                  </>
                )}
              </div>
            </Button>

            <Button variant="outline" className="h-20">
              <div className="text-center">
                <FileText className="h-6 w-6 mx-auto mb-2" />
                <span>Generate Template</span>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Toolbox Talks */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Toolbox Talks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {toolboxTalks.map((talk) => (
              <div 
                key={talk.id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => setSelectedTalk(talk)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-semibold text-charcoal">{talk.title}</h4>
                      {getCompletionBadge(talk.completed)}
                    </div>
                    
                    <p className="text-steel-gray text-sm mb-3">{talk.topic}</p>
                    
                    <div className="flex items-center space-x-6 text-sm text-steel-gray">
                      <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(talk.date).toLocaleDateString('en-GB')}
                      </span>
                      <span className="flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        {talk.attendees.length} attendees
                      </span>
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {talk.duration} minutes
                      </span>
                      <span className="flex items-center">
                        <MessageSquare className="h-3 w-3 mr-1" />
                        {talk.conductor}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      Export
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {toolboxTalks.length === 0 && (
            <div className="text-center py-12 text-steel-gray">
              <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No toolbox talks recorded yet</h3>
              <p className="mb-4">Start recording your daily safety talks to maintain compliance.</p>
              <Button onClick={() => setShowNewTalkForm(true)}>
                Record First Talk
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}