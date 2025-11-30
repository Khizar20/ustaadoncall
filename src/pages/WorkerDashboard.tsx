import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Search, 
  MapPin, 
  Calendar, 
  DollarSign, 
  User, 
  Settings, 
  Wallet, 
  Briefcase,
  Star,
  CheckCircle,
  Clock,
  X,
  Bell,
  CreditCard,
  Phone,
  Mail,
  Award,
  FileText,
  Filter,
  ArrowUpDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Navigation } from "@/components/ui/navigation";
import { Footer } from "@/components/ui/footer";
import { useToast } from "@/hooks/use-toast";

// Hardcoded Worker Profile Data
const workerProfile = {
  name: "Khizar",
  city: "Houston",
  bio: "Reliable Gig Doer. 5.0 Stars. 45 Jobs Completed.",
  skills: ["Photography", "Assembly", "Delivery"],
  rating: 5.0,
  jobsCompleted: 45,
  verification: {
    phone: "Verified",
    id: "Pending"
  },
  profileImage: null
};

// Hardcoded Wallet Data
const walletData = {
  currentBalance: 520.00,
  lastPayout: 315.00,
  transactions: [
    {
      id: "TXN-001",
      jobTitle: "Replace lightbulb on 'Acme Co' sign",
      amount: 70.00,
      date: "2025-11-25T10:30:00Z",
      status: "Completed"
    },
    {
      id: "TXN-002",
      jobTitle: "Property check and photo documentation",
      amount: 56.00,
      date: "2025-11-23T14:20:00Z",
      status: "Completed"
    },
    {
      id: "TXN-003",
      jobTitle: "Deliver package to downtown office",
      amount: 42.00,
      date: "2025-11-20T09:15:00Z",
      status: "Completed"
    },
    {
      id: "TXN-004",
      jobTitle: "Minor fence repair",
      amount: 84.00,
      date: "2025-11-18T16:45:00Z",
      status: "Completed"
    },
    {
      id: "TXN-005",
      jobTitle: "Gutter cleaning for residential property",
      amount: 98.00,
      date: "2025-11-15T11:30:00Z",
      status: "Completed"
    }
  ]
};

// Hardcoded Job Assignments
const jobAssignments = {
  upcoming: [
    {
      id: "JOB-UP-001",
      title: "Move furniture items between rooms",
      date: "2025-12-01T10:00:00Z",
      payout: 63.00,
      location: "Spring, TX",
      clientPrice: 90.00
    },
    {
      id: "JOB-UP-002",
      title: "Property check and photo documentation",
      date: "2025-12-02T14:00:00Z",
      payout: 56.00,
      location: "Katy, TX",
      clientPrice: 80.00
    }
  ],
  inProgress: [
    {
      id: "JOB-IP-001",
      title: "Replace lightbulb on 'Acme Co' sign",
      date: "2025-11-30T17:00:00Z",
      payout: 70.00,
      location: "Sugar Land, TX",
      clientPrice: 100.00,
      startedAt: "2025-11-30T15:00:00Z"
    }
  ],
  completed: [
    {
      id: "JOB-COMP-001",
      title: "Deliver package to downtown office building",
      date: "2025-11-28T16:00:00Z",
      payout: 42.00,
      location: "Houston, TX",
      clientPrice: 60.00,
      completedAt: "2025-11-28T18:30:00Z"
    },
    {
      id: "JOB-COMP-002",
      title: "Minor fence repair - replace 2 boards",
      date: "2025-11-27T18:00:00Z",
      payout: 84.00,
      location: "Pearland, TX",
      clientPrice: 120.00,
      completedAt: "2025-11-27T20:15:00Z"
    },
    {
      id: "JOB-COMP-003",
      title: "Gutter cleaning for residential property",
      date: "2025-11-25T15:00:00Z",
      payout: 98.00,
      location: "The Woodlands, TX",
      clientPrice: 140.00,
      completedAt: "2025-11-25T17:45:00Z"
    },
    {
      id: "JOB-COMP-004",
      title: "Property check and photo documentation",
      date: "2025-11-23T14:00:00Z",
      payout: 56.00,
      location: "Katy, TX",
      clientPrice: 80.00,
      completedAt: "2025-11-23T15:30:00Z"
    },
    {
      id: "JOB-COMP-005",
      title: "Replace lightbulb on 'Acme Co' sign",
      date: "2025-11-20T17:00:00Z",
      payout: 70.00,
      location: "Sugar Land, TX",
      clientPrice: 100.00,
      completedAt: "2025-11-20T18:00:00Z"
    }
  ],
  cancelled: [
    {
      id: "JOB-CANC-001",
      title: "Deliver package to downtown office",
      date: "2025-11-22T16:00:00Z",
      payout: 42.00,
      location: "Houston, TX",
      clientPrice: 60.00,
      cancelledAt: "2025-11-22T14:00:00Z",
      reason: "Client cancelled"
    }
  ]
};

// Hardcoded Available Jobs (same as Services page)
const mockJobs = [
  {
    id: "JOB-001",
    title: "Replace lightbulb on 'Acme Co' sign",
    payout: 70.00,
    category: "Signage Maintenance",
    locationArea: "Sugar Land, TX",
    dueDate: "2025-11-30T17:00:00Z",
    distance: 5.2,
    status: "Available",
    clientPrice: 100.00
  },
  {
    id: "JOB-002",
    title: "Property check and photo documentation",
    payout: 56.00,
    category: "Property Inspection",
    locationArea: "Katy, TX",
    dueDate: "2025-12-01T14:00:00Z",
    distance: 8.7,
    status: "Available",
    clientPrice: 80.00
  },
  {
    id: "JOB-003",
    title: "Deliver package to downtown office building",
    payout: 42.00,
    category: "Delivery",
    locationArea: "Houston, TX",
    dueDate: "2025-11-29T16:00:00Z",
    distance: 3.1,
    status: "Available",
    clientPrice: 60.00
  },
  {
    id: "JOB-004",
    title: "Minor fence repair - replace 2 boards",
    payout: 84.00,
    category: "Minor Maintenance",
    locationArea: "Pearland, TX",
    dueDate: "2025-12-02T18:00:00Z",
    distance: 12.3,
    status: "Available",
    clientPrice: 120.00
  },
  {
    id: "JOB-005",
    title: "Gutter cleaning for residential property",
    payout: 98.00,
    category: "Property Maintenance",
    locationArea: "The Woodlands, TX",
    dueDate: "2025-12-03T15:00:00Z",
    distance: 15.8,
    status: "Available",
    clientPrice: 140.00
  },
  {
    id: "JOB-006",
    title: "Move furniture items between rooms",
    payout: 63.00,
    category: "Moving Assistance",
    locationArea: "Spring, TX",
    dueDate: "2025-11-28T13:00:00Z",
    distance: 7.4,
    status: "Available",
    clientPrice: 90.00
  }
];

const jobCategories = [
  "All Categories",
  "Signage Maintenance",
  "Property Inspection",
  "Delivery",
  "Minor Maintenance",
  "Property Maintenance",
  "Moving Assistance"
];

const WorkerDashboard = () => {
  const [activeTab, setActiveTab] = useState("find-jobs");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [sortBy, setSortBy] = useState<"distance" | "payout" | "dueDate">("distance");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const { toast } = useToast();

  // Filter and sort jobs
  const filteredJobs = selectedCategory === "All Categories"
    ? mockJobs
    : mockJobs.filter(job => job.category === selectedCategory);

  const sortedJobs = [...filteredJobs].sort((a, b) => {
    switch (sortBy) {
      case "distance":
        return a.distance - b.distance;
      case "payout":
        return b.payout - a.payout;
      case "dueDate":
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      default:
        return 0;
    }
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });
  };

  const handleAcceptJob = (jobId: string) => {
    toast({
      title: "Job Accepted!",
      description: "You've successfully accepted this job. Check 'My Jobs' tab for details.",
    });
  };

  const handleManagePayout = () => {
    toast({
      title: "Stripe Connect Portal",
      description: "This will open the Stripe Connect portal to manage your payout method.",
    });
  };

  const tabs = [
    { id: "find-jobs", label: "Find Jobs", icon: Search },
    { id: "my-jobs", label: "My Jobs", icon: Briefcase },
    { id: "wallet", label: "Wallet", icon: Wallet },
    { id: "profile", label: "Profile", icon: User },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-32 pb-12">
        <div className="container mx-auto px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2 font-heading">
              Worker Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage your gigs, earnings, and profile
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="mb-8 border-b border-border">
            <div className="flex flex-wrap gap-2 md:gap-4 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                      activeTab === tab.id
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="whitespace-nowrap">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div className="mt-8">
            {/* Find Jobs Tab */}
            {activeTab === "find-jobs" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-6">
                  <div className="flex flex-col sm:flex-row gap-3 md:gap-4 items-center justify-between bg-secondary/30 rounded-xl p-4 md:p-6 border border-border">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <Filter className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="flex-1 sm:flex-none px-4 py-2 border border-border rounded-lg bg-background text-foreground text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                      >
                        {jobCategories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <ArrowUpDown className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as "distance" | "payout" | "dueDate")}
                        className="flex-1 sm:flex-none px-4 py-2 border border-border rounded-lg bg-background text-foreground text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                      >
                        <option value="distance">Sort by Distance</option>
                        <option value="payout">Sort by Payout</option>
                        <option value="dueDate">Sort by Due Date</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl md:text-2xl font-bold text-foreground font-heading">
                      Available Jobs
                    </h2>
                    <p className="text-sm md:text-base text-muted-foreground">
                      {sortedJobs.length} {sortedJobs.length === 1 ? "job" : "jobs"} found
                    </p>
                  </div>

                  {sortedJobs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                      {sortedJobs.map((job, idx) => (
                        <motion.div
                          key={job.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                        >
                          <Card className="relative group bg-background hover:shadow-elegant card-hover border border-border rounded-xl overflow-hidden">
                            <div className="p-4 md:p-6">
                              <h3 className="font-semibold text-lg md:text-xl text-foreground mb-3 group-hover:text-primary transition-colors font-heading">
                                {job.title}
                              </h3>

                              <div className="mb-4">
                                <div
                                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-lg md:text-xl text-foreground"
                                  style={{ backgroundColor: "#FFDE59" }}
                                >
                                  <span className="text-sm md:text-base">$</span>
                                  <span>{job.payout.toFixed(2)}</span>
                                  <span className="text-sm md:text-base font-normal">Payout</span>
                                </div>
                              </div>

                              <div className="mb-3">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs md:text-sm font-medium bg-secondary text-foreground border border-border">
                                  {job.category}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 mb-3 text-sm md:text-base text-muted-foreground">
                                <MapPin className="w-4 h-4 flex-shrink-0" />
                                <span className="truncate">
                                  {job.locationArea} • {job.distance} mi away
                                </span>
                              </div>

                              <div className="flex items-center gap-2 mb-4 text-sm md:text-base text-muted-foreground">
                                <Calendar className="w-4 h-4 flex-shrink-0" />
                                <span>Due by: {formatDate(job.dueDate)}</span>
                              </div>

                              <div className="mb-4">
                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                  {job.status}
                                </span>
                              </div>

                              <Button
                                className="w-full font-medium text-sm md:text-base"
                                style={{ backgroundColor: "#0846BC", color: "#FFFFFF" }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = "#073a9e";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = "#0846BC";
                                }}
                                onClick={() => handleAcceptJob(job.id)}
                              >
                                Accept Job
                              </Button>
                            </div>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
                      <p className="text-muted-foreground">
                        Try adjusting your filters or check back later for new opportunities.
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* My Jobs Tab */}
            {activeTab === "my-jobs" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="space-y-8">
                  {/* Upcoming Jobs */}
                  {jobAssignments.upcoming.length > 0 && (
                    <div>
                      <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 font-heading flex items-center gap-2">
                        <Clock className="w-5 h-5 text-primary" />
                        Upcoming ({jobAssignments.upcoming.length})
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {jobAssignments.upcoming.map((job) => (
                          <Card key={job.id} className="p-4 md:p-6 border-border">
                            <div className="flex items-start justify-between mb-3">
                              <h3 className="font-semibold text-lg text-foreground">{job.title}</h3>
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                Upcoming
                              </Badge>
                            </div>
                            <div className="space-y-2 text-sm text-muted-foreground mb-4">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>{formatDate(job.date)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                <span>{job.location}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4" />
                                <span className="font-semibold text-foreground">${job.payout.toFixed(2)} payout</span>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              className="w-full"
                              style={{ borderColor: "#0846BC", color: "#0846BC" }}
                            >
                              View Details
                            </Button>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* In Progress Jobs */}
                  {jobAssignments.inProgress.length > 0 && (
                    <div>
                      <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 font-heading flex items-center gap-2">
                        <Clock className="w-5 h-5 text-yellow-600" />
                        In Progress ({jobAssignments.inProgress.length})
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {jobAssignments.inProgress.map((job) => (
                          <Card key={job.id} className="p-4 md:p-6 border-border">
                            <div className="flex items-start justify-between mb-3">
                              <h3 className="font-semibold text-lg text-foreground">{job.title}</h3>
                              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                In Progress
                              </Badge>
                            </div>
                            <div className="space-y-2 text-sm text-muted-foreground mb-4">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>Due: {formatDate(job.date)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                <span>{job.location}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4" />
                                <span className="font-semibold text-foreground">${job.payout.toFixed(2)} payout</span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                className="flex-1"
                                style={{ backgroundColor: "#0846BC", color: "#FFFFFF" }}
                              >
                                Submit Proof
                              </Button>
                              <Button variant="outline" className="flex-1">
                                View Details
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Completed Jobs */}
                  {jobAssignments.completed.length > 0 && (
                    <div>
                      <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 font-heading flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        Completed ({jobAssignments.completed.length})
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {jobAssignments.completed.map((job) => (
                          <Card key={job.id} className="p-4 md:p-6 border-border">
                            <div className="flex items-start justify-between mb-3">
                              <h3 className="font-semibold text-lg text-foreground">{job.title}</h3>
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                Completed
                              </Badge>
                            </div>
                            <div className="space-y-2 text-sm text-muted-foreground mb-4">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>Completed: {formatDate(job.completedAt!)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                <span>{job.location}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4" />
                                <span className="font-semibold text-foreground">${job.payout.toFixed(2)} paid</span>
                              </div>
                            </div>
                            <Button variant="outline" className="w-full">
                              View Details
                            </Button>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Cancelled Jobs */}
                  {jobAssignments.cancelled.length > 0 && (
                    <div>
                      <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 font-heading flex items-center gap-2">
                        <X className="w-5 h-5 text-red-600" />
                        Cancelled ({jobAssignments.cancelled.length})
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {jobAssignments.cancelled.map((job) => (
                          <Card key={job.id} className="p-4 md:p-6 border-border opacity-75">
                            <div className="flex items-start justify-between mb-3">
                              <h3 className="font-semibold text-lg text-foreground">{job.title}</h3>
                              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                Cancelled
                              </Badge>
                            </div>
                            <div className="space-y-2 text-sm text-muted-foreground mb-4">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>Cancelled: {formatDate(job.cancelledAt!)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                <span>{job.location}</span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Reason: {job.reason}
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Wallet Tab */}
            {activeTab === "wallet" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="space-y-6">
                  {/* Balance Card */}
                  <Card className="p-6 md:p-8 border-border" style={{ backgroundColor: "#F4E4C2" }}>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-lg text-muted-foreground mb-2">Available Balance</h2>
                        <div
                          className="text-4xl md:text-5xl font-bold"
                          style={{ color: "#0846BC" }}
                        >
                          ${walletData.currentBalance.toFixed(2)}
                        </div>
                      </div>
                      <Wallet className="w-12 h-12 md:w-16 md:h-16" style={{ color: "#0846BC" }} />
                    </div>
                    <div className="pt-4 border-t border-border">
                      <p className="text-sm text-muted-foreground">
                        Last Payout: <span className="font-semibold text-foreground">${walletData.lastPayout.toFixed(2)}</span>
                      </p>
                    </div>
                  </Card>

                  {/* Transaction History */}
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 font-heading">
                      Transaction History
                    </h2>
                    <Card className="border-border">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-border">
                              <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Job Title</th>
                              <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Amount</th>
                              <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Date</th>
                              <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {walletData.transactions.map((transaction) => (
                              <tr key={transaction.id} className="border-b border-border hover:bg-secondary/30 transition-colors">
                                <td className="py-3 px-4 text-sm text-foreground">{transaction.jobTitle}</td>
                                <td className="py-3 px-4 text-sm font-semibold text-primary">
                                  ${transaction.amount.toFixed(2)}
                                </td>
                                <td className="py-3 px-4 text-sm text-muted-foreground">
                                  {formatDate(transaction.date)}
                                </td>
                                <td className="py-3 px-4">
                                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                    {transaction.status}
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </Card>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Profile Tab */}
            {activeTab === "profile" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Profile Info */}
                  <div className="lg:col-span-2 space-y-6">
                    <Card className="p-6 border-border">
                      <div className="flex items-start gap-4 mb-6">
                        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          {workerProfile.profileImage ? (
                            <img
                              src={workerProfile.profileImage}
                              alt={workerProfile.name}
                              className="w-20 h-20 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-3xl font-bold text-primary">
                              {workerProfile.name.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div className="flex-1">
                          <h2 className="text-2xl font-bold text-foreground mb-2 font-heading">
                            {workerProfile.name}
                          </h2>
                          <div className="flex items-center gap-2 mb-2">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">{workerProfile.city}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold text-foreground">{workerProfile.rating.toFixed(1)}</span>
                            <span className="text-muted-foreground">({workerProfile.jobsCompleted} jobs completed)</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h3 className="font-semibold text-foreground mb-2">Bio</h3>
                          <p className="text-muted-foreground">{workerProfile.bio}</p>
                        </div>

                        <div>
                          <h3 className="font-semibold text-foreground mb-2">Skills</h3>
                          <div className="flex flex-wrap gap-2">
                            {workerProfile.skills.map((skill, idx) => (
                              <Badge key={idx} variant="outline" className="bg-secondary text-foreground">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Card>

                    {/* Rating Summary */}
                    <Card className="p-6 border-border">
                      <h3 className="text-xl font-bold text-foreground mb-4 font-heading">Rating Summary</h3>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="text-4xl font-bold text-foreground mb-1">{workerProfile.rating.toFixed(1)}</div>
                          <div className="flex items-center justify-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className="w-5 h-5 fill-yellow-400 text-yellow-400"
                              />
                            ))}
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="text-muted-foreground mb-2">
                            Based on {workerProfile.jobsCompleted} completed jobs
                          </p>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Award className="w-4 h-4 text-primary" />
                              <span className="text-sm text-foreground">Top Rated Worker</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span className="text-sm text-foreground">100% Completion Rate</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* Verification Badges */}
                  <div>
                    <Card className="p-6 border-border">
                      <h3 className="text-xl font-bold text-foreground mb-4 font-heading">Verification</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                          <div className="flex items-center gap-3">
                            <Phone className="w-5 h-5 text-green-600" />
                            <span className="font-medium text-foreground">Phone Verified</span>
                          </div>
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-yellow-600" />
                            <span className="font-medium text-foreground">ID Verification</span>
                          </div>
                          <Clock className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div className="text-xs text-muted-foreground pt-2">
                          Complete ID verification to access more job opportunities
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="space-y-6">
                  {/* Notification Preferences */}
                  <Card className="p-6 border-border">
                    <h2 className="text-xl font-bold text-foreground mb-4 font-heading">Notification Preferences</h2>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                        <div className="flex items-center gap-3">
                          <Mail className="w-5 h-5 text-primary" />
                          <div>
                            <h3 className="font-semibold text-foreground">Email Notifications</h3>
                            <p className="text-sm text-muted-foreground">Receive job alerts and updates via email</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={emailNotifications}
                            onChange={(e) => setEmailNotifications(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                        <div className="flex items-center gap-3">
                          <Phone className="w-5 h-5 text-primary" />
                          <div>
                            <h3 className="font-semibold text-foreground">SMS Notifications</h3>
                            <p className="text-sm text-muted-foreground">Receive urgent job alerts via text message</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={smsNotifications}
                            onChange={(e) => setSmsNotifications(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </div>
                    </div>
                  </Card>

                  {/* Payout Settings */}
                  <Card className="p-6 border-border">
                    <h2 className="text-xl font-bold text-foreground mb-4 font-heading">Payout Settings</h2>
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg border border-border bg-secondary/30">
                        <div className="flex items-center gap-3 mb-2">
                          <CreditCard className="w-5 h-5 text-primary" />
                          <h3 className="font-semibold text-foreground">Manage Payout Method</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                          Connect your bank account or debit card to receive payments securely through Stripe Connect.
                        </p>
                        <Button
                          onClick={handleManagePayout}
                          style={{ backgroundColor: "#0846BC", color: "#FFFFFF" }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#073a9e";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "#0846BC";
                          }}
                        >
                          <CreditCard className="w-4 h-4 mr-2" />
                          Manage Payout Method (Stripe Connect)
                        </Button>
                      </div>
                    </div>
                  </Card>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default WorkerDashboard;

