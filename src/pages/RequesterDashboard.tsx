import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Briefcase, 
  Plus, 
  CreditCard, 
  Settings, 
  Calendar, 
  MapPin, 
  DollarSign, 
  User,
  CheckCircle,
  Clock,
  FileText,
  Image as ImageIcon,
  X,
  Upload
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Navigation } from "@/components/ui/navigation";
import { Footer } from "@/components/ui/footer";
import { useToast } from "@/hooks/use-toast";

// Hardcoded Client Profile Data
const clientProfile = {
  email: "khizarahmed3@gmail.com",
  defaultCard: "Visa ending 4567",
  businessName: "",
  taxId: ""
};

// Hardcoded Job List
const jobList = {
  posted: [
    {
      id: "JOB-POST-001",
      title: "Property check and photo documentation",
      date: "2025-11-28T10:00:00Z",
      status: "Posted",
      assignedWorker: null,
      category: "Property Inspection",
      location: "Katy, TX",
      budget: 80.00
    }
  ],
  accepted: [
    {
      id: "JOB-ACC-001",
      title: "Deliver package to downtown office building",
      date: "2025-11-25T14:00:00Z",
      status: "Accepted",
      assignedWorker: "John Smith",
      category: "Delivery",
      location: "Houston, TX",
      budget: 60.00
    }
  ],
  inProgress: [
    {
      id: "JOB-PROG-001",
      title: "Replace lightbulb on 'Acme Co' sign",
      date: "2025-11-30T17:00:00Z",
      status: "In Progress",
      assignedWorker: "Sarah Johnson",
      category: "Signage Maintenance",
      location: "Sugar Land, TX",
      budget: 100.00
    }
  ],
  submitted: [
    {
      id: "JOB-SUB-001",
      title: "Minor fence repair - replace 2 boards",
      date: "2025-11-27T18:00:00Z",
      status: "Submitted",
      assignedWorker: "Mike Davis",
      category: "Minor Maintenance",
      location: "Pearland, TX",
      budget: 120.00
    }
  ],
  completed: [
    {
      id: "JOB-COMP-001",
      title: "Gutter cleaning for residential property",
      date: "2025-11-20T15:00:00Z",
      status: "Completed",
      assignedWorker: "Emily Chen",
      category: "Property Maintenance",
      location: "The Woodlands, TX",
      budget: 140.00,
      completedAt: "2025-11-20T17:00:00Z"
    },
    {
      id: "JOB-COMP-002",
      title: "Move furniture items between rooms",
      date: "2025-11-18T13:00:00Z",
      status: "Completed",
      assignedWorker: "Robert Wilson",
      category: "Moving Assistance",
      location: "Spring, TX",
      budget: 90.00,
      completedAt: "2025-11-18T15:30:00Z"
    }
  ]
};

// Hardcoded Payment History
const paymentHistory = [
  {
    id: "PAY-001",
    jobTitle: "Gutter cleaning for residential property",
    totalCharged: 140.00,
    platformFee: 42.00,
    workerEarnings: 98.00,
    date: "2025-11-20T17:00:00Z"
  },
  {
    id: "PAY-002",
    jobTitle: "Move furniture items between rooms",
    totalCharged: 90.00,
    platformFee: 27.00,
    workerEarnings: 63.00,
    date: "2025-11-18T15:30:00Z"
  },
  {
    id: "PAY-003",
    jobTitle: "Property check and photo documentation",
    totalCharged: 80.00,
    platformFee: 24.00,
    workerEarnings: 56.00,
    date: "2025-11-15T14:00:00Z"
  }
];

// Job Categories
const jobCategories = [
  "Photos",
  "Pickup/Dropoff",
  "Walkthrough",
  "Signage",
  "Other"
];

const RequesterDashboard = () => {
  const [activeTab, setActiveTab] = useState("my-jobs");
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    address: "",
    budget: "",
    deadline: "",
    timeWindow: "",
    specialRequirements: "",
    referenceImages: [] as File[]
  });
  const { toast } = useToast();

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setFormData(prev => ({
        ...prev,
        referenceImages: [...prev.referenceImages, ...files]
      }));
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      referenceImages: prev.referenceImages.filter((_, i) => i !== index)
    }));
  };

  const handlePostJob = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Job Posted!",
      description: "Your job has been posted successfully. Workers will be able to see and accept it.",
    });
    // Reset form
    setFormData({
      title: "",
      category: "",
      description: "",
      address: "",
      budget: "",
      deadline: "",
      timeWindow: "",
      specialRequirements: "",
      referenceImages: []
    });
    setActiveTab("my-jobs");
  };

  const calculateBreakdown = (budget: string) => {
    const amount = parseFloat(budget) || 0;
    const platformFee = amount * 0.30;
    const workerEarnings = amount * 0.70;
    return { amount, platformFee, workerEarnings };
  };

  const breakdown = calculateBreakdown(formData.budget);

  const tabs = [
    { id: "my-jobs", label: "My Jobs", icon: Briefcase },
    { id: "post-job", label: "Post a Job", icon: Plus },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  // Combine all jobs for display
  const allJobs = [
    ...jobList.posted,
    ...jobList.accepted,
    ...jobList.inProgress,
    ...jobList.submitted,
    ...jobList.completed
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-32 pb-12">
        <div className="container mx-auto px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2 font-heading">
              Requester Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage your job postings, payments, and account settings
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
            {/* My Jobs Tab */}
            {activeTab === "my-jobs" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-6 flex justify-between items-center">
                  <h2 className="text-xl md:text-2xl font-bold text-foreground font-heading">
                    My Jobs ({allJobs.length})
                  </h2>
                  <Button
                    onClick={() => setActiveTab("post-job")}
                    style={{ backgroundColor: "#0846BC", color: "#FFFFFF" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#073a9e";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#0846BC";
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Post a New Job
                  </Button>
                </div>

                <div className="space-y-6">
                  {/* Posted Jobs */}
                  {jobList.posted.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-blue-600" />
                        Posted ({jobList.posted.length})
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {jobList.posted.map((job) => (
                          <Card key={job.id} className="p-4 md:p-6 border-border">
                            <div className="flex items-start justify-between mb-3">
                              <h4 className="font-semibold text-lg text-foreground">{job.title}</h4>
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                {job.status}
                              </Badge>
                            </div>
                            <div className="space-y-2 text-sm text-muted-foreground mb-4">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>Posted: {formatDate(job.date)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                <span>{job.location}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4" />
                                <span className="font-semibold text-foreground">Budget: ${job.budget.toFixed(2)}</span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Waiting for worker to accept
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

                  {/* Accepted Jobs */}
                  {jobList.accepted.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        Accepted ({jobList.accepted.length})
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {jobList.accepted.map((job) => (
                          <Card key={job.id} className="p-4 md:p-6 border-border">
                            <div className="flex items-start justify-between mb-3">
                              <h4 className="font-semibold text-lg text-foreground">{job.title}</h4>
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                {job.status}
                              </Badge>
                            </div>
                            <div className="space-y-2 text-sm text-muted-foreground mb-4">
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                <span className="font-medium text-foreground">Worker: {job.assignedWorker}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>Posted: {formatDate(job.date)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                <span>{job.location}</span>
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

                  {/* In Progress Jobs */}
                  {jobList.inProgress.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-yellow-600" />
                        In Progress ({jobList.inProgress.length})
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {jobList.inProgress.map((job) => (
                          <Card key={job.id} className="p-4 md:p-6 border-border">
                            <div className="flex items-start justify-between mb-3">
                              <h4 className="font-semibold text-lg text-foreground">{job.title}</h4>
                              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                {job.status}
                              </Badge>
                            </div>
                            <div className="space-y-2 text-sm text-muted-foreground mb-4">
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                <span className="font-medium text-foreground">Worker: {job.assignedWorker}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>Due: {formatDate(job.date)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                <span>{job.location}</span>
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

                  {/* Submitted Jobs */}
                  {jobList.submitted.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-purple-600" />
                        Submitted ({jobList.submitted.length})
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {jobList.submitted.map((job) => (
                          <Card key={job.id} className="p-4 md:p-6 border-border">
                            <div className="flex items-start justify-between mb-3">
                              <h4 className="font-semibold text-lg text-foreground">{job.title}</h4>
                              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                {job.status}
                              </Badge>
                            </div>
                            <div className="space-y-2 text-sm text-muted-foreground mb-4">
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                <span className="font-medium text-foreground">Worker: {job.assignedWorker}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>Submitted: {formatDate(job.date)}</span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Waiting for your approval
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                className="flex-1"
                                style={{ backgroundColor: "#0846BC", color: "#FFFFFF" }}
                              >
                                Approve
                              </Button>
                              <Button variant="outline" className="flex-1">
                                View Proof
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Completed Jobs */}
                  {jobList.completed.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        Completed ({jobList.completed.length})
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {jobList.completed.map((job) => (
                          <Card key={job.id} className="p-4 md:p-6 border-border">
                            <div className="flex items-start justify-between mb-3">
                              <h4 className="font-semibold text-lg text-foreground">{job.title}</h4>
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                {job.status}
                              </Badge>
                            </div>
                            <div className="space-y-2 text-sm text-muted-foreground mb-4">
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                <span className="font-medium text-foreground">Worker: {job.assignedWorker}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>Completed: {formatDate(job.completedAt!)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                <span>{job.location}</span>
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
                </div>
              </motion.div>
            )}

            {/* Post a Job Tab */}
            {activeTab === "post-job" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="p-6 md:p-8 border-border">
                  <h2 className="text-2xl font-bold text-foreground mb-6 font-heading">
                    Post a New Job
                  </h2>

                  <form onSubmit={handlePostJob} className="space-y-6">
                    {/* Job Title */}
                    <div>
                      <Label htmlFor="title" className="text-base font-semibold">
                        Job Title *
                      </Label>
                      <Input
                        id="title"
                        name="title"
                        type="text"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="e.g., Property check and photo documentation"
                        className="mt-2"
                        required
                      />
                    </div>

                    {/* Category */}
                    <div>
                      <Label htmlFor="category" className="text-base font-semibold">
                        Category *
                      </Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => handleSelectChange("category", value)}
                        required
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {jobCategories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Description */}
                    <div>
                      <Label htmlFor="description" className="text-base font-semibold">
                        Description *
                      </Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Provide detailed information about the job..."
                        className="mt-2 min-h-[120px]"
                        required
                      />
                    </div>

                    {/* Address */}
                    <div>
                      <Label htmlFor="address" className="text-base font-semibold">
                        Address / Location *
                      </Label>
                      <Input
                        id="address"
                        name="address"
                        type="text"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="e.g., Katy, TX or specific address"
                        className="mt-2"
                        required
                      />
                    </div>

                    {/* Budget */}
                    <div>
                      <Label htmlFor="budget" className="text-base font-semibold">
                        Budget (Fixed Price) *
                      </Label>
                      <Input
                        id="budget"
                        name="budget"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.budget}
                        onChange={handleInputChange}
                        placeholder="0.00"
                        className="mt-2"
                        required
                      />
                      {formData.budget && (
                        <div className="mt-3 p-4 rounded-lg border border-border bg-secondary/30">
                          <h4 className="font-semibold text-sm text-foreground mb-2">Payment Breakdown</h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Total Amount:</span>
                              <span className="font-semibold text-foreground">${breakdown.amount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Platform Fee (30%):</span>
                              <span className="font-semibold text-foreground">${breakdown.platformFee.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Worker Earnings (70%):</span>
                              <span
                                className="font-semibold"
                                style={{ color: "#0846BC" }}
                              >
                                ${breakdown.workerEarnings.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Deadline and Time Window */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="deadline" className="text-base font-semibold">
                          Deadline *
                        </Label>
                        <Input
                          id="deadline"
                          name="deadline"
                          type="date"
                          value={formData.deadline}
                          onChange={handleInputChange}
                          className="mt-2"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="timeWindow" className="text-base font-semibold">
                          Time Window *
                        </Label>
                        <Input
                          id="timeWindow"
                          name="timeWindow"
                          type="time"
                          value={formData.timeWindow}
                          onChange={handleInputChange}
                          className="mt-2"
                          required
                        />
                      </div>
                    </div>

                    {/* Special Requirements */}
                    <div>
                      <Label htmlFor="specialRequirements" className="text-base font-semibold">
                        Special Requirements
                      </Label>
                      <Textarea
                        id="specialRequirements"
                        name="specialRequirements"
                        value={formData.specialRequirements}
                        onChange={handleInputChange}
                        placeholder="Any special instructions or requirements..."
                        className="mt-2 min-h-[100px]"
                      />
                    </div>

                    {/* Reference Images */}
                    <div>
                      <Label htmlFor="referenceImages" className="text-base font-semibold">
                        Attach Reference Images
                      </Label>
                      <div className="mt-2">
                        <Input
                          id="referenceImages"
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <label htmlFor="referenceImages">
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={() => document.getElementById("referenceImages")?.click()}
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Images
                          </Button>
                        </label>
                        {formData.referenceImages.length > 0 && (
                          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                            {formData.referenceImages.map((file, index) => (
                              <div key={index} className="relative">
                                <div className="aspect-square rounded-lg border border-border bg-secondary/30 flex items-center justify-center">
                                  <ImageIcon className="w-8 h-8 text-muted-foreground" />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeImage(index)}
                                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                                <p className="text-xs text-muted-foreground mt-1 truncate">{file.name}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4">
                      <Button
                        type="submit"
                        className="w-full font-medium"
                        style={{ backgroundColor: "#0846BC", color: "#FFFFFF" }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#073a9e";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "#0846BC";
                        }}
                      >
                        Post Job
                      </Button>
                    </div>
                  </form>
                </Card>
              </motion.div>
            )}

            {/* Payments Tab */}
            {activeTab === "payments" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-6">
                  <h2 className="text-xl md:text-2xl font-bold text-foreground font-heading">
                    Payment History
                  </h2>
                </div>

                <Card className="border-border">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Job Title</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Total Charged</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Platform Fee (30%)</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paymentHistory.map((payment) => (
                          <tr key={payment.id} className="border-b border-border hover:bg-secondary/30 transition-colors">
                            <td className="py-3 px-4 text-sm text-foreground">{payment.jobTitle}</td>
                            <td className="py-3 px-4 text-sm font-semibold text-foreground">
                              ${payment.totalCharged.toFixed(2)}
                            </td>
                            <td className="py-3 px-4 text-sm text-muted-foreground">
                              ${payment.platformFee.toFixed(2)}
                            </td>
                            <td className="py-3 px-4 text-sm text-muted-foreground">
                              {formatDate(payment.date)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
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
                  {/* Payment Methods */}
                  <Card className="p-6 border-border">
                    <h2 className="text-xl font-bold text-foreground mb-4 font-heading">
                      Payment Methods
                    </h2>
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg border border-border bg-secondary/30">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <CreditCard className="w-5 h-5 text-primary" />
                            <div>
                              <p className="font-semibold text-foreground">{clientProfile.defaultCard}</p>
                              <p className="text-sm text-muted-foreground">Default payment method</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            Change
                          </Button>
                        </div>
                      </div>
                      <Button variant="outline" className="w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Payment Method
                      </Button>
                    </div>
                  </Card>

                  {/* Business Info */}
                  <Card className="p-6 border-border">
                    <h2 className="text-xl font-bold text-foreground mb-4 font-heading">
                      Business Information
                    </h2>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="businessName" className="text-base font-semibold">
                          Business Name
                        </Label>
                        <Input
                          id="businessName"
                          type="text"
                          placeholder="Enter business name"
                          className="mt-2"
                          defaultValue={clientProfile.businessName}
                        />
                      </div>
                      <div>
                        <Label htmlFor="taxId" className="text-base font-semibold">
                          Tax ID / EIN
                        </Label>
                        <Input
                          id="taxId"
                          type="text"
                          placeholder="Enter tax ID or EIN"
                          className="mt-2"
                          defaultValue={clientProfile.taxId}
                        />
                      </div>
                      <Button
                        style={{ backgroundColor: "#0846BC", color: "#FFFFFF" }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#073a9e";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "#0846BC";
                        }}
                      >
                        Save Changes
                      </Button>
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

export default RequesterDashboard;

