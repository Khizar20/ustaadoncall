import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  Search, 
  Filter,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  Star,
  AlertCircle,
  LogOut,
  Shield,
  BarChart3
} from "lucide-react";
import AdminSidebar from "@/components/ui/admin-sidebar";
import AdminSettings from "@/components/admin-settings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { sendProviderApprovalEmail } from "@/lib/emailService";

interface PendingRequest {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  service_category: string[];
  experience: string;
  location: string;
  bio: string;
  profile_image_url: string;
  cnic_front_url: string;
  cnic_back_url: string;
  jobs_pricing: Record<string, any[]>;
  status: 'pending' | 'approved' | 'rejected' | 'under_review';
  admin_notes: string;
  created_at: string;
  updated_at: string;
}

interface Provider {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string;
  service_category: string;
  bio: string;
  experience: string;
  location: string;
  profile_image: string;
  cnic_front: string;
  cnic_back: string;
  is_verified: boolean;
  rating: number;
  reviews_count: number;
  jobs_pricing: Record<string, any[]>;
  created_at: string;
}

const AdminPanel = () => {
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<PendingRequest[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<PendingRequest | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [providerSearchTerm, setProviderSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [adminNotes, setAdminNotes] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'pending' | 'providers' | 'analytics' | 'settings'>('dashboard');
  const [adminInfo, setAdminInfo] = useState<any>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem("admin_token");
    if (!token) {
      window.location.href = "/admin-login";
      return;
    }

    // Verify token and get admin info
    verifyAuth();
  }, []);

  const verifyAuth = async () => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      window.location.href = "/admin-login";
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/me`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        localStorage.removeItem("admin_token");
        window.location.href = "/admin-login";
        return;
      }

      const adminData = await response.json();
      setAdminInfo(adminData);
      
      // Fetch data
      fetchPendingRequests();
      fetchProviders();
    } catch (error) {
      localStorage.removeItem("admin_token");
      window.location.href = "/admin-login";
    }
  };

  useEffect(() => {
    filterRequests();
  }, [pendingRequests, searchTerm, statusFilter]);

  useEffect(() => {
    filterProviders();
  }, [providers, providerSearchTerm]);

  const fetchPendingRequests = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/pending-requests/`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error("Failed to fetch requests");
      const data = await response.json();
      setPendingRequests(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch pending requests",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProviders = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/providers/`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error("Failed to fetch providers");
      const data = await response.json();
      setProviders(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch providers",
        variant: "destructive"
      });
    }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/logout`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_expires_at");
      window.location.href = "/admin-login";
    }
  };

  const handleAdminUpdate = (updatedInfo: any) => {
    setAdminInfo(updatedInfo);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as any);
  };

  const filterRequests = () => {
    let filtered = pendingRequests;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(request =>
        request.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.service_category.some(cat => cat.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(request => request.status === statusFilter);
    }

    setFilteredRequests(filtered);
  };

  const filterProviders = () => {
    let filtered = providers;

    // Filter by search term
    if (providerSearchTerm) {
      filtered = filtered.filter(provider =>
        provider.name.toLowerCase().includes(providerSearchTerm.toLowerCase()) ||
        provider.service_category.toLowerCase().includes(providerSearchTerm.toLowerCase()) ||
        provider.location.toLowerCase().includes(providerSearchTerm.toLowerCase())
      );
    }

    setFilteredProviders(filtered);
  };

  const updateRequestStatus = async (requestId: string, status: string, notes: string = "") => {
    setIsUpdating(true);
    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/pending-requests/${requestId}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          status,
          admin_notes: notes
        })
      });

      if (!response.ok) throw new Error("Failed to update request");

      const result = await response.json();
      console.log("Raw response from backend:", result);
      console.log("Response keys:", Object.keys(result));
      console.log("Has email_data:", 'email_data' in result);

      if (status === 'approved') {
        console.log("=== EMAIL SENDING PROCESS START ===");
        console.log("Result from backend:", result);
        
        // Send approval email if email data is available
        if (result.email_data) {
          console.log("Email data found:", result.email_data);
          try {
            console.log("Calling sendProviderApprovalEmail with data:", {
              provider_name: result.email_data.provider_name,
              provider_email: result.email_data.provider_email,
              one_time_password: result.email_data.one_time_password,
              login_url: result.email_data.login_url,
              service_category: result.email_data.service_category
            });
            
            const emailSent = await sendProviderApprovalEmail({
              provider_name: result.email_data.provider_name,
              provider_email: result.email_data.provider_email,
              one_time_password: result.email_data.one_time_password,
              login_url: result.email_data.login_url,
              service_category: result.email_data.service_category
            });
            
            console.log("Email sending result:", emailSent);
            
            if (emailSent) {
              console.log("✅ Email sent successfully!");
              toast({
                title: "Provider Approved!",
                description: "Application approved, provider added to the system, credentials sent via email, and removed from pending requests.",
              });
            } else {
              console.log("❌ Email sending failed!");
              toast({
                title: "Provider Approved!",
                description: "Application approved, provider added to the system, but email sending failed. Please contact the provider manually.",
                variant: "destructive"
              });
            }
          } catch (error) {
            console.error('❌ Email sending error:', error);
            console.error('Error details:', {
              message: error.message,
              stack: error.stack,
              name: error.name
            });
            toast({
              title: "Provider Approved!",
              description: "Application approved, provider added to the system, but email sending failed. Please contact the provider manually.",
              variant: "destructive"
            });
          }
        } else {
          console.log("❌ No email_data found in result:", result);
          toast({
            title: "Provider Approved!",
            description: "Application approved, provider added to the system, and removed from pending requests.",
          });
        }
        console.log("=== EMAIL SENDING PROCESS END ===");
      } else if (status === 'rejected') {
        toast({
          title: "Application Rejected",
          description: "Application has been rejected, documents deleted, and removed from pending requests.",
        });
      } else {
        toast({
          title: "Status Updated",
          description: `Request status updated to ${status.replace('_', ' ')}`,
        });
      }

      // Refresh the list
      fetchPendingRequests();
      setSelectedRequest(null);
      setAdminNotes("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update request status",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
      approved: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      rejected: { color: "bg-red-100 text-red-800", icon: XCircle },
      under_review: { color: "bg-secondary text-secondary-foreground", icon: Eye }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onLogout={handleLogout}
        adminInfo={adminInfo}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-2">Dashboard</h1>
                <p className="text-muted-foreground">Overview of your admin panel</p>
              </div>

              {/* Stats Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Pending Requests</p>
                        <p className="text-2xl font-bold text-yellow-600">
                          {pendingRequests.filter(r => r.status === 'pending').length}
                        </p>
                      </div>
                      <Clock className="h-8 w-8 text-yellow-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Providers</p>
                        <p className="text-2xl font-bold text-primary">{providers.length}</p>
                      </div>
                      <User className="h-8 w-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Applications</p>
                        <p className="text-2xl font-bold">{pendingRequests.length}</p>
                      </div>
                      <FileText className="h-8 w-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          )}

          {/* Pending Requests Tab */}
          {activeTab === 'pending' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-2">Pending Requests</h1>
                <p className="text-muted-foreground">Review and manage service provider applications</p>
              </div>

              {/* Filters for Pending Requests */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col md:flex-row gap-4 mb-6"
              >
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, email, or service category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </motion.div>

              {/* Pending Requests List */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-4"
              >
                {filteredRequests.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No requests found</h3>
                      <p className="text-muted-foreground">
                        {searchTerm || statusFilter !== "all" 
                          ? "Try adjusting your search or filter criteria"
                          : "No pending requests at the moment"
                        }
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  filteredRequests.map((request, index) => (
                    <motion.div
                      key={request.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                    >
                      <Card className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                                  <User className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-lg">
                                    {request.first_name} {request.last_name}
                                  </h3>
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Mail className="w-4 h-4" />
                                    {request.email}
                                  </div>
                                </div>
                                {getStatusBadge(request.status)}
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div className="flex items-center gap-2 text-sm">
                                  <Phone className="w-4 h-4 text-muted-foreground" />
                                  {request.phone}
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <MapPin className="w-4 h-4 text-muted-foreground" />
                                  {request.location || "Not specified"}
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <Calendar className="w-4 h-4 text-muted-foreground" />
                                  {formatDate(request.created_at)}
                                </div>
                              </div>

                              <div className="mb-4">
                                <h4 className="font-medium mb-2">Service Categories:</h4>
                                <div className="flex flex-wrap gap-2">
                                  {request.service_category.map((category, idx) => (
                                    <Badge key={idx} variant="secondary">
                                      {category}
                                    </Badge>
                                  ))}
                                </div>
                              </div>

                              {request.bio && (
                                <div className="mb-4">
                                  <h4 className="font-medium mb-2">Bio:</h4>
                                  <p className="text-sm text-muted-foreground line-clamp-2">
                                    {request.bio}
                                  </p>
                                </div>
                              )}
                            </div>

                            <div className="flex flex-col gap-2 ml-4">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Eye className="w-4 h-4 mr-2" />
                                    View Details
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle>Application Details</DialogTitle>
                                    <DialogDescription>
                                      Review the complete application details
                                    </DialogDescription>
                                  </DialogHeader>
                                  
                                  <div className="space-y-6">
                                    {/* Basic Information */}
                                    <div>
                                      <h3 className="font-semibold mb-3">Basic Information</h3>
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <label className="text-sm font-medium text-muted-foreground">Name</label>
                                          <p>{request.first_name} {request.last_name}</p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium text-muted-foreground">Email</label>
                                          <p>{request.email}</p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium text-muted-foreground">Phone</label>
                                          <p>{request.phone}</p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium text-muted-foreground">Location</label>
                                          <p>{request.location || "Not specified"}</p>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Service Information */}
                                    <div>
                                      <h3 className="font-semibold mb-3">Service Information</h3>
                                      <div className="space-y-3">
                                        <div>
                                          <label className="text-sm font-medium text-muted-foreground">Service Categories</label>
                                          <div className="flex flex-wrap gap-2 mt-1">
                                            {request.service_category.map((category, idx) => (
                                              <Badge key={idx} variant="secondary">
                                                {category}
                                              </Badge>
                                            ))}
                                          </div>
                                        </div>
                                        {request.experience && (
                                          <div>
                                            <label className="text-sm font-medium text-muted-foreground">Experience</label>
                                            <p>{request.experience}</p>
                                          </div>
                                        )}
                                        {request.bio && (
                                          <div>
                                            <label className="text-sm font-medium text-muted-foreground">Bio</label>
                                            <p className="text-sm">{request.bio}</p>
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {/* Pricing Information */}
                                    {request.jobs_pricing && Object.keys(request.jobs_pricing).length > 0 && (
                                      <div>
                                        <h3 className="font-semibold mb-3">Pricing Information</h3>
                                        <div className="space-y-3">
                                          {Object.entries(request.jobs_pricing).map(([category, jobs]) => (
                                            <div key={category}>
                                              <h4 className="font-medium text-sm capitalize">{category}</h4>
                                              <div className="grid grid-cols-2 gap-2 mt-1">
                                                {Array.isArray(jobs) && jobs.map((job: any, idx: number) => (
                                                  <div key={idx} className="text-sm">
                                                    <span className="text-muted-foreground">{job.job}:</span>
                                                    <span className="ml-1 font-medium">Rs. {job.price}</span>
                                                  </div>
                                                ))}
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* Documents */}
                                    <div>
                                      <h3 className="font-semibold mb-3">Documents</h3>
                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {request.profile_image_url && (
                                          <div>
                                            <label className="text-sm font-medium text-muted-foreground">Profile Image</label>
                                            <div className="relative group cursor-pointer mt-1">
                                              <img 
                                                src={request.profile_image_url} 
                                                alt="Profile" 
                                                className="w-full h-32 object-cover rounded border-2 border-transparent group-hover:border-primary transition-colors"
                                              />
                                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                                                <span className="text-white text-sm font-medium">Click to View</span>
                                              </div>
                                              <Dialog>
                                                <DialogTrigger asChild>
                                                  <div className="absolute inset-0 cursor-pointer"></div>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-4xl max-h-[80vh]">
                                                  <DialogHeader>
                                                    <DialogTitle>Profile Image</DialogTitle>
                                                  </DialogHeader>
                                                  <div className="flex justify-center">
                                                    <img 
                                                      src={request.profile_image_url} 
                                                      alt="Profile" 
                                                      className="max-w-full max-h-[60vh] object-contain rounded"
                                                    />
                                                  </div>
                                                </DialogContent>
                                              </Dialog>
                                            </div>
                                          </div>
                                        )}
                                        {request.cnic_front_url && (
                                          <div>
                                            <label className="text-sm font-medium text-muted-foreground">CNIC Front</label>
                                            <div className="relative group cursor-pointer mt-1">
                                              <img 
                                                src={request.cnic_front_url} 
                                                alt="CNIC Front" 
                                                className="w-full h-32 object-cover rounded border-2 border-transparent group-hover:border-primary transition-colors"
                                              />
                                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                                                <span className="text-white text-sm font-medium">Click to View</span>
                                              </div>
                                              <Dialog>
                                                <DialogTrigger asChild>
                                                  <div className="absolute inset-0 cursor-pointer"></div>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-4xl max-h-[80vh]">
                                                  <DialogHeader>
                                                    <DialogTitle>CNIC Front</DialogTitle>
                                                  </DialogHeader>
                                                  <div className="flex justify-center">
                                                    <img 
                                                      src={request.cnic_front_url} 
                                                      alt="CNIC Front" 
                                                      className="max-w-full max-h-[60vh] object-contain rounded"
                                                    />
                                                  </div>
                                                </DialogContent>
                                              </Dialog>
                                            </div>
                                          </div>
                                        )}
                                        {request.cnic_back_url && (
                                          <div>
                                            <label className="text-sm font-medium text-muted-foreground">CNIC Back</label>
                                            <div className="relative group cursor-pointer mt-1">
                                              <img 
                                                src={request.cnic_back_url} 
                                                alt="CNIC Back" 
                                                className="w-full h-32 object-cover rounded border-2 border-transparent group-hover:border-primary transition-colors"
                                              />
                                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                                                <span className="text-white text-sm font-medium">Click to View</span>
                                              </div>
                                              <Dialog>
                                                <DialogTrigger asChild>
                                                  <div className="absolute inset-0 cursor-pointer"></div>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-4xl max-h-[80vh]">
                                                  <DialogHeader>
                                                    <DialogTitle>CNIC Back</DialogTitle>
                                                  </DialogHeader>
                                                  <div className="flex justify-center">
                                                    <img 
                                                      src={request.cnic_back_url} 
                                                      alt="CNIC Back" 
                                                      className="max-w-full max-h-[60vh] object-contain rounded"
                                                    />
                                                  </div>
                                                </DialogContent>
                                              </Dialog>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {/* Admin Actions */}
                                    {request.status === 'pending' && (
                                      <div>
                                        <h3 className="font-semibold mb-3">Admin Actions</h3>
                                        <div className="space-y-4">
                                          <div>
                                            <label className="text-sm font-medium text-muted-foreground">Admin Notes</label>
                                            <Textarea
                                              placeholder="Add notes about this application..."
                                              value={adminNotes}
                                              onChange={(e) => setAdminNotes(e.target.value)}
                                              className="mt-1"
                                            />
                                          </div>
                                          <div className="flex gap-2">
                                            <Button
                                              onClick={() => updateRequestStatus(request.id, 'approved', adminNotes)}
                                              disabled={isUpdating}
                                              className="flex-1 bg-green-600 hover:bg-green-700"
                                            >
                                              <CheckCircle className="w-4 h-4 mr-2" />
                                              Approve & Move to Providers
                                            </Button>
                                            <Button
                                              onClick={() => updateRequestStatus(request.id, 'rejected', adminNotes)}
                                              disabled={isUpdating}
                                              variant="destructive"
                                              className="flex-1"
                                            >
                                              <XCircle className="w-4 h-4 mr-2" />
                                              Reject & Remove
                                            </Button>
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                    {/* Status Information */}
                                    {request.status !== 'pending' && (
                                      <div>
                                        <h3 className="font-semibold mb-3">Status Information</h3>
                                        <div className="space-y-2">
                                          <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-muted-foreground">Status:</span>
                                            {getStatusBadge(request.status)}
                                          </div>
                                          {request.admin_notes && (
                                            <div>
                                              <span className="text-sm font-medium text-muted-foreground">Admin Notes:</span>
                                              <p className="text-sm mt-1">{request.admin_notes}</p>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </DialogContent>
                              </Dialog>

                              {request.status === 'pending' && (
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => updateRequestStatus(request.id, 'approved')}
                                    disabled={isUpdating}
                                    className="bg-green-600 hover:bg-green-700"
                                    title="Approve and move to providers (removes from pending)"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => updateRequestStatus(request.id, 'rejected')}
                                    disabled={isUpdating}
                                    title="Reject, delete documents, and remove from pending"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                )}
              </motion.div>
            </motion.div>
          )}

          {/* Providers Tab */}
          {activeTab === 'providers' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-2">Approved Providers</h1>
                <p className="text-muted-foreground">Manage and view approved service providers</p>
              </div>

              {/* Filters for Providers */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col md:flex-row gap-4 mb-6"
              >
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, service category, or location..."
                    value={providerSearchTerm}
                    onChange={(e) => setProviderSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </motion.div>

              {/* Providers List */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-4"
              >
                {filteredProviders.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No providers found</h3>
                      <p className="text-muted-foreground">
                        {providerSearchTerm 
                          ? "Try adjusting your search criteria"
                          : "No approved providers at the moment"
                        }
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  filteredProviders.map((provider, index) => (
                    <motion.div
                      key={provider.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                    >
                      <Card className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                                  <User className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-lg">{provider.name}</h3>
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <MapPin className="w-4 h-4" />
                                    {provider.location || "Not specified"}
                                  </div>
                                </div>
                                <Badge variant="default" className="bg-green-100 text-green-800">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Verified
                                </Badge>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div className="flex items-center gap-2 text-sm">
                                  <Star className="w-4 h-4 text-yellow-500" />
                                  {provider.rating?.toFixed(1) || '0'} ({provider.reviews_count} reviews)
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <Calendar className="w-4 h-4 text-muted-foreground" />
                                  {formatDate(provider.created_at)}
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <FileText className="w-4 h-4 text-muted-foreground" />
                                  {provider.service_category}
                                </div>
                              </div>

                              <div className="mb-4">
                                <h4 className="font-medium mb-2">Bio:</h4>
                                <p className="text-sm text-muted-foreground">{provider.bio || "No bio provided"}</p>
                              </div>

                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedProvider(provider)}
                                  className="flex items-center gap-2"
                                >
                                  <Eye className="w-4 h-4" />
                                  View Details
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                )}
              </motion.div>
            </motion.div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-2">Analytics</h1>
                <p className="text-muted-foreground">View reports and analytics</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Application Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Total Applications</span>
                        <span className="font-semibold">{pendingRequests.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Pending Review</span>
                        <span className="font-semibold text-yellow-600">
                          {pendingRequests.filter(r => r.status === 'pending').length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Approved</span>
                        <span className="font-semibold text-green-600">
                          {pendingRequests.filter(r => r.status === 'approved').length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Rejected</span>
                        <span className="font-semibold text-red-600">
                          {pendingRequests.filter(r => r.status === 'rejected').length}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Provider Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Total Providers</span>
                        <span className="font-semibold">{providers.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Verified Providers</span>
                        <span className="font-semibold text-green-600">
                          {providers.filter(p => p.is_verified).length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Average Rating</span>
                        <span className="font-semibold">
                          {providers.length > 0 
                            ? (providers.reduce((sum, p) => sum + p.rating, 0) / providers.length).toFixed(1)
                            : '0.0'
                          }
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-sm">
                        <div className="font-medium">Latest Applications</div>
                        <div className="text-muted-foreground">
                          {pendingRequests.slice(0, 3).map(request => (
                            <div key={request.id} className="mt-1">
                              {request.first_name} {request.last_name} - {formatDate(request.created_at)}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <AdminSettings 
              adminInfo={adminInfo} 
              onUpdate={handleAdminUpdate}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel; 