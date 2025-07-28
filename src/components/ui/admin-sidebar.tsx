import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Users, 
  Clock, 
  Settings, 
  BarChart3, 
  FileText, 
  Shield,
  ChevronLeft,
  ChevronRight,
  Home,
  UserCheck,
  AlertCircle,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  adminInfo: any;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const AdminSidebar = ({ 
  activeTab, 
  onTabChange, 
  onLogout, 
  adminInfo, 
  isCollapsed, 
  onToggleCollapse 
}: AdminSidebarProps) => {
  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: Home,
      description: "Overview and statistics"
    },
    {
      id: "pending",
      label: "Pending Requests",
      icon: Clock,
      description: "Review applications"
    },
    {
      id: "providers",
      label: "Approved Providers",
      icon: UserCheck,
      description: "Manage providers"
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: BarChart3,
      description: "View reports"
    },
    {
      id: "settings",
      label: "Admin Settings",
      icon: Settings,
      description: "Manage account"
    }
  ];

  return (
    <motion.div
      initial={{ width: isCollapsed ? 80 : 280 }}
      animate={{ width: isCollapsed ? 80 : 280 }}
      className="h-screen bg-card border-r border-border flex flex-col"
    >
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <span className="font-semibold text-lg">Admin Panel</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="h-8 w-8 p-0"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Admin Info */}
      {!isCollapsed && adminInfo && (
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">
                {adminInfo.full_name || adminInfo.username}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {adminInfo.email || "Admin"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "default" : "ghost"}
              className={cn(
                "w-full justify-start gap-3 h-auto p-3",
                activeTab === item.id && "bg-primary text-primary-foreground"
              )}
              onClick={() => onTabChange(item.id)}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {!isCollapsed && (
                <div className="flex-1 text-left">
                  <div className="font-medium">{item.label}</div>
                  <div className="text-xs opacity-70">{item.description}</div>
                </div>
              )}
            </Button>
          );
        })}
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-border">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-destructive hover:text-destructive"
          onClick={onLogout}
        >
          <LogOut className="h-4 w-4" />
          {!isCollapsed && "Logout"}
        </Button>
      </div>
    </motion.div>
  );
};

export default AdminSidebar; 