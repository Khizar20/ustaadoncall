import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { testEmailConfiguration, checkEmailSettings } from "@/lib/testEmailConfig";
import { Eye, EyeOff, User, Lock, Mail, ArrowRight, Key, Bug } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

// Password hashing function (same as in registration)
const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};

const UserLogin = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResetSent, setIsResetSent] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [isResendingVerification, setIsResendingVerification] = useState(false);
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleResendVerification = async (email: string) => {
    setIsResendingVerification(true);
    try {
      console.log("🔄 Resending verification email to:", email);
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      });

      if (error) {
        throw new Error(error.message);
      }

      toast({
        title: "Verification Email Sent",
        description: "Please check your email for the verification link.",
      });
    } catch (error: any) {
      console.error("❌ Failed to resend verification:", error);
      toast({
        title: "Failed to Resend",
        description: error.message || "Failed to resend verification email. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsResendingVerification(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log("=== USER LOGIN START ===");
      console.log("Login attempt for email:", formData.email);

      // First, try to authenticate with Supabase Auth
      console.log("🔄 Authenticating with Supabase Auth...");
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });

      console.log("Supabase Auth response:", { data, error });

      if (error) {
        console.error("❌ Supabase Auth error:", error);
        
        // Check if it's an email confirmation error
        if (error.message.includes("Email not confirmed") || error.message.includes("Invalid login credentials")) {
          // Try to get user info to check confirmation status
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('email', formData.email)
            .single();

          if (userData && !userError) {
            console.log("✅ User exists in database but email not confirmed");
            toast({
              title: "Email Not Confirmed",
              description: "Please check your email and click the verification link. If you haven't received the email, check your spam folder or use the 'Resend Verification' button.",
              variant: "destructive"
            });
            return;
          }
        }
        
        throw new Error(error.message);
      }

      if (data.user) {
        console.log("✅ Supabase Auth successful, user ID:", data.user.id);
        
        // Check if user exists in users table and verify password hash
        console.log("🔄 Checking user profile in users table...");
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        console.log("Users table query response:", { userData, userError });

        if (userError || !userData) {
          console.error("❌ Users table query error:", userError);
          console.error("User data:", userData);
          throw new Error("User profile not found. Please contact support.");
        }

        console.log("✅ User profile found:", userData);

        // Verify password hash
        console.log("🔄 Verifying password hash...");
        const hashedInputPassword = await hashPassword(formData.password);
        console.log("Input password hash:", hashedInputPassword);
        console.log("Stored password hash:", userData.password_hash);
        
        if (userData.password_hash !== hashedInputPassword) {
          console.error("❌ Password hash mismatch");
          throw new Error("Invalid credentials. Please check your email and password.");
        }

        console.log("✅ Password hash verified successfully");

        // Check if user is also a provider
        const { data: providerData, error: providerError } = await supabase
          .from('providers')
          .select('*')
          .eq('user_id', data.user.id)
          .single();

        console.log("Provider data:", providerData);
        console.log("Provider error:", providerError);

        // Store user info and token
        const userInfo = {
          id: data.user.id,
          email: data.user.email,
          name: userData.name,
          phone: userData.phone,
          address: userData.address,
          isProvider: !!providerData,
          providerId: providerData?.id || null
        };

        const tokenData = {
          user_id: data.user.id,
          email: data.user.email,
          isProvider: !!providerData,
          providerId: providerData?.id || null,
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes
        };

        localStorage.setItem('user_info', JSON.stringify(userInfo));
        localStorage.setItem('user_token', data.session.access_token);
        localStorage.setItem('user_token_data', JSON.stringify(tokenData));

        console.log("✅ Login successful, user info stored");

        // Show success message based on user type
        if (providerData) {
          toast({
            title: "Welcome Back!",
            description: "You can access both user and provider features.",
          });
        } else {
          toast({
            title: "Login Successful",
            description: "Welcome to UstaadOnCall!",
          });
        }

        // Navigate to dashboard
        navigate('/user-dashboard');
      }
    } catch (error: any) {
      console.error("❌ Login failed:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      // Provide more specific error messages
      let errorMessage = error.message;
      if (error.message.includes("Email not confirmed")) {
        errorMessage = "Please check your email and click the verification link before logging in.";
      } else if (error.message.includes("Invalid login credentials")) {
        errorMessage = "Invalid email or password. Please check your credentials.";
      }
      
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!resetEmail.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter your email address.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        throw new Error(error.message);
      }

      setIsResetSent(true);
      toast({
        title: "Reset Email Sent",
        description: "Check your email for password reset instructions.",
      });
    } catch (error: any) {
      toast({
        title: "Reset Failed",
        description: error.message || "Failed to send reset email. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleTestEmailConfig = async () => {
    setIsTestingEmail(true);
    try {
      console.log("=== TESTING EMAIL CONFIGURATION ===");
      
      const email = prompt("Enter email address to test:");
      if (!email) return;

      // Test email configuration
      const emailTest = await testEmailConfiguration(email);
      console.log("Email test result:", emailTest);
      
      // Check email settings
      const settingsTest = await checkEmailSettings();
      console.log("Settings test result:", settingsTest);
      
      if (emailTest.success && settingsTest.success) {
        toast({
          title: "Email Configuration Test",
          description: "Email configuration appears to be working correctly.",
        });
      } else {
        toast({
          title: "Email Configuration Issues",
          description: `Email test: ${emailTest.error || 'OK'}, Settings: ${settingsTest.error || 'OK'}`,
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error("Email test failed:", error);
      toast({
        title: "Test Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsTestingEmail(false);
    }
  };

  if (isResetSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="shadow-xl border-0">
            <CardHeader className="text-center space-y-2">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4"
              >
                <Key className="w-8 h-8 text-green-600" />
              </motion.div>
              <CardTitle className="text-2xl font-bold text-green-600">Check Your Email</CardTitle>
              <CardDescription>
                We've sent password reset instructions to {resetEmail}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Please check your email and follow the link to reset your password.
                </p>
                <p className="text-xs text-muted-foreground">
                  Don't see the email? Check your spam folder.
                </p>
              </div>
              <Button
                onClick={() => setIsResetSent(false)}
                className="w-full"
              >
                Back to Login
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center space-y-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4"
            >
              <User className="w-8 h-8 text-primary" />
            </motion.div>
            <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
            <CardDescription>
              Sign in to your UstaadOnCall account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-10 pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Button
                  type="button"
                  variant="link"
                  className="text-sm text-muted-foreground hover:text-primary"
                  onClick={() => {
                    const email = prompt("Enter your email address:");
                    if (email) {
                      setResetEmail(email);
                      handlePasswordReset();
                    }
                  }}
                >
                  Forgot Password?
                </Button>
                <Button
                  type="button"
                  variant="link"
                  className="text-sm text-muted-foreground hover:text-primary"
                  onClick={() => {
                    const email = prompt("Enter your email address to resend verification:");
                    if (email) {
                      handleResendVerification(email);
                    }
                  }}
                  disabled={isResendingVerification}
                >
                  {isResendingVerification ? "Sending..." : "Resend Verification"}
                </Button>
              </div>

              {/* Development test button - only show in development */}
              {process.env.NODE_ENV === 'development' && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleTestEmailConfig}
                  disabled={isTestingEmail}
                  className="w-full text-xs"
                >
                  {isTestingEmail ? (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      Testing Email Config...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Bug className="w-3 h-3" />
                      Test Email Configuration
                    </div>
                  )}
                </Button>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Signing in...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    Sign In
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link to="/user-register" className="text-primary hover:underline font-medium">
                  Create Account
                </Link>
              </p>
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-700">
                <strong>Need Help?</strong> Contact our support team if you're having trouble accessing your account.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default UserLogin; 