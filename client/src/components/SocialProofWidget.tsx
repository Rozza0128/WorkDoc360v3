import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Users, 
  FileText, 
  Clock,
  MapPin,
  Building,
  Zap
} from "lucide-react";

interface ActivityItem {
  id: string;
  type: 'signup' | 'document' | 'upgrade';
  company: string;
  location: string;
  trade: string;
  timeAgo: string;
  action: string;
}

const SAMPLE_ACTIVITIES: ActivityItem[] = [
  {
    id: '1',
    type: 'document',
    company: 'Scaffolding Company',
    location: 'Manchester',
    trade: 'Scaffolding',
    timeAgo: '2 minutes ago',
    action: 'created a Risk Assessment'
  },
  {
    id: '2',
    type: 'signup',
    company: 'Electrical Contractor',
    location: 'Birmingham',
    trade: 'Electrical',
    timeAgo: '8 minutes ago',
    action: 'joined WorkDoc360'
  },
  {
    id: '3',
    type: 'upgrade',
    company: 'Plastering Specialist',
    location: 'Leeds',
    trade: 'Plastering',
    timeAgo: '15 minutes ago',
    action: 'upgraded to Professional'
  },
  {
    id: '4',
    type: 'document',
    company: 'Building Contractor',
    location: 'London',
    trade: 'General Building',
    timeAgo: '23 minutes ago',
    action: 'generated Method Statement'
  },
  {
    id: '5',
    type: 'document',
    company: 'Roofing Contractor',
    location: 'Newcastle',
    trade: 'Roofing',
    timeAgo: '31 minutes ago',
    action: 'created Toolbox Talk'
  },
  {
    id: '6',
    type: 'signup',
    company: 'Plumbing Services',
    location: 'Bristol',
    trade: 'Plumbing',
    timeAgo: '45 minutes ago',
    action: 'started free trial'
  }
];

const getIconForType = (type: string) => {
  switch (type) {
    case 'signup': return <Users className="h-4 w-4 text-green-600" />;
    case 'document': return <FileText className="h-4 w-4 text-blue-600" />;
    case 'upgrade': return <TrendingUp className="h-4 w-4 text-purple-600" />;
    default: return <Building className="h-4 w-4 text-slate-600" />;
  }
};

const getColorForType = (type: string) => {
  switch (type) {
    case 'signup': return 'bg-green-50 border-green-200';
    case 'document': return 'bg-blue-50 border-blue-200';  
    case 'upgrade': return 'bg-purple-50 border-purple-200';
    default: return 'bg-slate-50 border-slate-200';
  }
};

export function SocialProofWidget() {
  const [currentActivity, setCurrentActivity] = useState(0);
  const [stats, setStats] = useState({
    documentsToday: 247,
    companiesThisMonth: 156,
    activeUsers: 23
  });

  useEffect(() => {
    // Rotate through activities every 4 seconds
    const interval = setInterval(() => {
      setCurrentActivity(prev => (prev + 1) % SAMPLE_ACTIVITIES.length);
    }, 4000);

    // Simulate real-time stats updates
    const statsInterval = setInterval(() => {
      setStats(prev => ({
        documentsToday: prev.documentsToday + Math.floor(Math.random() * 3),
        companiesThisMonth: prev.companiesThisMonth + (Math.random() > 0.85 ? 1 : 0),
        activeUsers: Math.max(15, prev.activeUsers + Math.floor(Math.random() * 5 - 2))
      }));
    }, 30000); // Update every 30 seconds

    return () => {
      clearInterval(interval);
      clearInterval(statsInterval);
    };
  }, []);

  const activity = SAMPLE_ACTIVITIES[currentActivity];

  return (
    <div className="space-y-4">
      {/* Real-time Activity Feed */}
      <Card className={`${getColorForType(activity.type)} transition-all duration-500 hover:shadow-md`}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              {getIconForType(activity.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {activity.company}
                </p>
                <Badge variant="secondary" className="text-xs px-2 py-0">
                  {activity.trade}
                </Badge>
              </div>
              <div className="flex items-center space-x-2 text-xs text-slate-600">
                <span>{activity.action}</span>
                <span>•</span>
                <div className="flex items-center space-x-1">
                  <MapPin className="h-3 w-3" />
                  <span>{activity.location}</span>
                </div>
                <span>•</span>
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{activity.timeAgo}</span>
                </div>
              </div>
            </div>
            <div className="flex-shrink-0">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-lg p-3 text-center shadow-sm border">
          <div className="text-lg font-bold text-blue-600">{stats.documentsToday}</div>
          <div className="text-xs text-slate-600">Docs Today</div>
        </div>
        <div className="bg-white rounded-lg p-3 text-center shadow-sm border">
          <div className="text-lg font-bold text-green-600">{stats.companiesThisMonth}</div>
          <div className="text-xs text-slate-600">New Companies</div>
        </div>
        <div className="bg-white rounded-lg p-3 text-center shadow-sm border">
          <div className="flex items-center justify-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <div className="text-lg font-bold text-slate-700">{stats.activeUsers}</div>
          </div>
          <div className="text-xs text-slate-600">Online Now</div>
        </div>
      </div>
    </div>
  );
}

export function FloatingSocialProof() {
  const [visible, setVisible] = useState(false);
  const [currentActivity, setCurrentActivity] = useState(0);

  useEffect(() => {
    // Show after 3 seconds, then cycle visibility
    setTimeout(() => setVisible(true), 3000);
    
    // Cycle through activities
    const interval = setInterval(() => {
      setCurrentActivity(prev => (prev + 1) % SAMPLE_ACTIVITIES.length);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  const activity = SAMPLE_ACTIVITIES[currentActivity];

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50 max-w-sm">
      <Card className="bg-white shadow-lg border-2 border-green-200 animate-slide-in-bottom">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              {getIconForType(activity.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900">
                🎉 {activity.company}
              </p>
              <p className="text-xs text-slate-600">
                {activity.action} • {activity.location}
              </p>
              <p className="text-xs text-green-600 font-medium">
                {activity.timeAgo}
              </p>
            </div>
            <button 
              onClick={() => setVisible(false)}
              className="text-slate-400 hover:text-slate-600 flex-shrink-0"
            >
              ×
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Urgency Counter Component
export function UrgencyCounter({ targetDate }: { targetDate?: Date }) {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    if (!targetDate) {
      // Default to end of day
      const now = new Date();
      targetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
    }

    const interval = setInterval(() => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();
      
      if (difference > 0) {
        setTimeLeft({
          hours: Math.floor(difference / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-3 rounded-lg text-center">
      <div className="flex items-center justify-center space-x-2 mb-2">
        <Zap className="h-5 w-5 animate-pulse" />
        <span className="font-bold">Limited Time: Beta Pricing</span>
      </div>
      <div className="flex justify-center space-x-4 text-sm">
        <div className="text-center">
          <div className="text-2xl font-bold">{timeLeft.hours.toString().padStart(2, '0')}</div>
          <div className="text-xs opacity-80">Hours</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">{timeLeft.minutes.toString().padStart(2, '0')}</div>
          <div className="text-xs opacity-80">Minutes</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">{timeLeft.seconds.toString().padStart(2, '0')}</div>
          <div className="text-xs opacity-80">Seconds</div>
        </div>
      </div>
      <p className="text-xs mt-2 opacity-90">
        Get £65/month pricing before it increases to £95/month
      </p>
    </div>
  );
}