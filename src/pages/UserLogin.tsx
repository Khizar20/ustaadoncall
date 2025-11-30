import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, ArrowRight, Key, User, Mail, Lock, Home, ArrowLeft, CheckCircle } from "lucide-react";
import { useLanguageContext } from "@/contexts/LanguageContext";

// Password hashing function (same as in registration)
const hashPassword = async (password: string): Promise<string> => {
  console.log("🔐 Hashing password process started");
  console.log("   - Input password length:", password.length);
  console.log("   - Input password:", password); // Be careful with this in production
  
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  console.log("   - Encoded data length:", data.length);
  
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  console.log("   - Hash buffer byte length:", hashBuffer.byteLength);
  
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  console.log("   - Hash array length:", hashArray.length);
  
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  console.log("   - Final hash hex length:", hashHex.length);
  console.log("   - Final hash hex:", hashHex);
  
  return hashHex;
};

// Test function for password hashing (for debugging)
const testPasswordHashing = async (testPassword: string) => {
  console.log("🧪 Testing password hashing with test password:", testPassword);
  const hash1 = await hashPassword(testPassword);
  const hash2 = await hashPassword(testPassword);
  console.log("🧪 Hash 1:", hash1);
  console.log("🧪 Hash 2:", hash2);
  console.log("🧪 Hashes match:", hash1 === hash2);
  return { hash1, hash2, match: hash1 === hash2 };
};

const UserLogin = () => {
  const { t } = useLanguageContext();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResetSent, setIsResetSent] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [isResendingVerification, setIsResendingVerification] = useState(false);
  const [showForgotPasswordDialog, setShowForgotPasswordDialog] = useState(false);
  const [showResendVerificationDialog, setShowResendVerificationDialog] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [resendVerificationEmail, setResendVerificationEmail] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  // Handle email verification success message
  useEffect(() => {
    const verified = searchParams.get('verified');
    if (verified === 'true') {
      toast({
        title: "Email Verified Successfully!",
        description: "Your email has been verified. You can now log in with your credentials.",
        variant: "default"
      });
      // Clear the URL parameter
      navigate('/user-login', { replace: true });
    }
  }, [searchParams, toast, navigate]);

  // Test password hashing on component mount (for debugging)
  useEffect(() => {
    const runHashTest = async () => {
      console.log("🧪 Running password hash test on component mount...");
      await testPasswordHashing("testpassword123");
    };
    runHashTest();
  }, []);

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
      
      // First check verification status
      const status = await checkVerificationStatus(email);
      
      if (!status.exists) {
        throw new Error(status.message);
      }
      
      if (status.verified) {
        // User is already verified, show success message instead of error
        toast({
          title: "Already Verified",
          description: status.message,
          variant: "default"
        });
        
        // Close the dialog
        setShowResendVerificationDialog(false);
        return;
      }

      console.log("✅ User found and verification pending, proceeding with resend...");

      // Try to resend confirmation email
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      });

      if (error) {
        console.error("❌ Supabase resend error:", error);
        
        // Handle specific error cases
        if (error.message.includes("User already confirmed")) {
          toast({
            title: "Already Verified",
            description: "This email is already verified. You can log in with your password.",
            variant: "default"
          });
        } else if (error.message.includes("User not found")) {
          throw new Error("Email not found in authentication system. Please register first.");
        } else if (error.message.includes("Email not confirmed")) {
          throw new Error("Email verification is still pending. Please check your email and click the verification link.");
        } else {
          throw new Error(error.message);
        }
      } else {
        toast({
          title: "Verification Email Sent",
          description: "Please check your email for the verification link. Check your spam folder if you don't see it.",
        });
      }
      
      // Close the dialog
      setShowResendVerificationDialog(false);
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

      // Hardcoded requester credentials check
      const REQUESTER_EMAIL = "khizarahmed3@gmail.com";
      const REQUESTER_PASSWORD = "khizar123";

      if (formData.email === REQUESTER_EMAIL && formData.password === REQUESTER_PASSWORD) {
        // Create mock requester/client data for hardcoded login
        const mockRequesterData = {
          id: "requester-001",
          email: REQUESTER_EMAIL,
          name: "Khizar",
          phone: "(713) 555-1234",
          address: "Houston, TX",
          isProvider: false,
          providerId: null
        };

        // Generate token data with timestamp
        const tokenData = {
          token: "mock-requester-token-" + Date.now(),
          timestamp: Date.now()
        };

        // Store requester info and token data in localStorage
        localStorage.setItem('user_info', JSON.stringify(mockRequesterData));
        localStorage.setItem('user_token', tokenData.token);
        localStorage.setItem('user_token_data', JSON.stringify(tokenData));

        // Dispatch custom event to notify Navigation component
        window.dispatchEvent(new CustomEvent('auth-state-changed'));

        toast({
          title: "Login Successful!",
          description: "Welcome to your requester dashboard.",
        });

        navigate('/requester-dashboard');
        return;
      }

      // Regular user login flow
      // First, try to authenticate with Supabase Auth
      console.log("🔄 Authenticating with Supabase Auth...");
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });

      console.log("Supabase Auth response:", { data, error });

      if (error) {
        console.error("❌ Supabase Auth error:", error);
        
        // Handle specific error cases more accurately
        if (error.message.includes("Email not confirmed")) {
          // This is a clear email confirmation error
          console.log("❌ Email not confirmed error from Supabase");
          toast({
            title: "Email Not Confirmed",
            description: "Please check your email and click the verification link. If you haven't received the email, check your spam folder or use the 'Resend Verification' button.",
            variant: "destructive"
          });
          return;
        } else if (error.message.includes("Invalid login credentials")) {
          // This could be wrong password OR unconfirmed email
          // We need to check the verification status properly
          console.log("❌ Invalid login credentials - checking if it's a verification issue...");
          
          try {
            const verificationStatus = await checkVerificationStatus(formData.email);
            
            if (!verificationStatus.exists) {
              // User doesn't exist at all
              toast({
                title: "Account Not Found",
                description: "No account found with this email. Please register first or check your email address.",
                variant: "destructive"
              });
              return;
            } else if (!verificationStatus.verified) {
              // User exists but email is not confirmed
              console.log("✅ User exists but email not confirmed");
            toast({
              title: "Email Not Confirmed",
              description: "Please check your email and click the verification link. If you haven't received the email, check your spam folder or use the 'Resend Verification' button.",
                variant: "destructive"
              });
              return;
            } else {
              // User exists and is verified, so it's likely a wrong password
              console.log("✅ User exists and is verified - likely wrong password");
              toast({
                title: "Invalid Credentials",
                description: "Invalid email or password. Please check your credentials and try again.",
                variant: "destructive"
              });
              return;
            }
          } catch (statusError) {
            console.error("❌ Failed to check verification status:", statusError);
            // Fallback to generic error message
            toast({
              title: "Login Failed",
              description: "Invalid email or password. Please check your credentials and try again.",
              variant: "destructive"
            });
            return;
          }
        }
        
        // Handle other specific error messages
        let errorMessage = error.message;
        if (error.message.includes("User not found")) {
          errorMessage = "No account found with this email. Please register first or check your email address.";
        }
        
        throw new Error(errorMessage);
      }

      if (data.user) {
        console.log("✅ Supabase Auth successful, user ID:", data.user.id);
        
        // Check if user exists in users table and verify password hash
        console.log("🔄 Checking user profile in users table...");
        console.log("🔍 Looking for user with ID:", data.user.id);
        
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        console.log("📋 Users table query response:", { userData, userError });

        if (userError || !userData) {
          console.error("❌ Users table query error:", userError);
          console.error("❌ User data:", userData);
          throw new Error("User profile not found. Please contact support.");
        }

        console.log("✅ User profile found successfully");
        console.log("📊 User data details:");
        console.log("   - User ID:", userData.id);
        console.log("   - Email:", userData.email);
        console.log("   - Name:", userData.name);
        console.log("   - Has password_hash:", !!userData.password_hash);
        console.log("   - Password hash preview:", userData.password_hash ? userData.password_hash.substring(0, 10) + '...' : 'null');
        console.log("   - Email confirmed at:", userData.email_confirmed_at);
        console.log("   - Created at:", userData.created_at);

        // Verify password hash with detailed logging
        console.log("🔄 Verifying password hash...");
        console.log("📝 Input password length:", formData.password.length);
        console.log("📝 Input password:", formData.password); // Be careful with this in production
        
        const hashedInputPassword = await hashPassword(formData.password);
        console.log("🔐 Generated hash from input password:", hashedInputPassword);
        console.log("🔐 Stored password hash from database:", userData.password_hash);
        console.log("📊 Hash comparison details:");
        console.log("   - Input hash length:", hashedInputPassword.length);
        console.log("   - Stored hash length:", userData.password_hash?.length || 'undefined');
        console.log("   - Hashes match:", userData.password_hash === hashedInputPassword);
        
        // Additional debugging info
        if (userData.password_hash !== hashedInputPassword) {
          console.error("❌ Password hash mismatch details:");
          console.error("   - Expected (stored):", userData.password_hash);
          console.error("   - Received (input):", hashedInputPassword);
          console.error("   - Character-by-character comparison:");
          
          if (userData.password_hash && hashedInputPassword) {
            const maxLength = Math.max(userData.password_hash.length, hashedInputPassword.length);
            for (let i = 0; i < maxLength; i++) {
              const storedChar = userData.password_hash[i] || 'undefined';
              const inputChar = hashedInputPassword[i] || 'undefined';
              if (storedChar !== inputChar) {
                console.error(`     Position ${i}: stored='${storedChar}' vs input='${inputChar}'`);
              }
            }
          }
          
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
          email: userData.email,
          name: userData.name,
          phone: userData.phone,
          address: userData.address,
          isProvider: !!providerData,
          providerId: providerData?.id || null
        };

        // Generate token data with timestamp
        const tokenData = {
          token: data.session?.access_token || '',
          timestamp: Date.now()
        };

        // Store user info and token data in localStorage
        localStorage.setItem('user_info', JSON.stringify(userInfo));
        localStorage.setItem('user_token', tokenData.token);
        localStorage.setItem('user_token_data', JSON.stringify(tokenData));

        // Dispatch custom event to notify Navigation component
        window.dispatchEvent(new CustomEvent('auth-state-changed'));

        toast({
          title: "Login Successful!",
          description: "Welcome back!",
        });

        navigate('/user-dashboard');
      }
    } catch (error: any) {
      console.error("❌ Login error:", error);
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!forgotPasswordEmail.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter your email address.",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log("🔄 Sending password reset email to:", forgotPasswordEmail);

      // First check if user exists in our database
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', forgotPasswordEmail)
        .single();

      if (userError || !userData) {
        throw new Error("Email not found in our system. Please register first.");
      }

      console.log("✅ User found in database:", userData);

      // Send password reset email
      const { error } = await supabase.auth.resetPasswordForEmail(forgotPasswordEmail, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        console.error("❌ Password reset error:", error);
        
        // Handle specific error cases
        if (error.message.includes("User not found")) {
          throw new Error("Email not found in authentication system. Please register first.");
        } else {
          throw new Error(error.message);
        }
      }

      setIsResetSent(true);
      toast({
        title: "Reset Email Sent",
        description: "Check your email for password reset instructions. Check your spam folder if you don't see it.",
      });
      
      // Close the dialog
      setShowForgotPasswordDialog(false);
    } catch (error: any) {
      console.error("❌ Password reset failed:", error);
      toast({
        title: "Reset Failed",
        description: error.message || "Failed to send reset email. Please try again.",
        variant: "destructive"
      });
    }
  };



  const checkVerificationStatus = async (email: string) => {
    try {
      console.log("🔄 Checking verification status for:", email);
      
      // First check if user exists in our database
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (userError || !userData) {
        return { 
          exists: false, 
          verified: false, 
          message: "Email not found in our system. Please register first." 
        };
      }

      console.log("✅ User found in database:", userData);

      // Check if user is already confirmed in our database
      if (userData.email_confirmed_at) {
        return { 
          exists: true, 
          verified: true, 
          message: "This email is already verified in our system. You can log in with your password." 
        };
      }

      // Try to check if user exists in Supabase Auth by attempting to get user info
      console.log("🔄 Checking Supabase Auth verification status...");
      try {
        // Use the admin API to get user information if available
        // Note: This might not work in client-side code due to RLS policies
        const { data: authUsers, error: adminError } = await supabase.auth.admin.listUsers();
        
        if (!adminError && authUsers && authUsers.users) {
          const authUser = authUsers.users.find(u => u.email === email);
          if (authUser) {
            console.log("✅ User found in Supabase Auth:", authUser.email);
            console.log("Email confirmed in Supabase:", authUser.email_confirmed_at);
            
            if (authUser.email_confirmed_at) {
              return { 
                exists: true, 
                verified: true, 
                message: "This email is already verified. You can log in with your password." 
              };
            } else {
              return { 
                exists: true, 
                verified: false, 
                message: "Email verification is pending. You can resend the verification email." 
              };
            }
          } else {
            return { 
              exists: false, 
              verified: false, 
              message: "Email not found in authentication system. Please register first." 
            };
          }
        }
      } catch (authCheckError) {
        console.log("⚠️ Could not check Supabase Auth admin status:", authCheckError);
      }



      // If we can't determine status, assume pending
      return { 
        exists: true, 
        verified: false, 
        message: "Email verification status unclear. You can try resending the verification email." 
      };

    } catch (error: any) {
      console.error("❌ Verification status check failed:", error);
      return { 
        exists: false, 
        verified: false, 
        message: "Failed to check verification status. Please try again." 
      };
    }
  };



  if (isResetSent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
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
    <div className="min-h-screen bg-background">
      {/* Header Navigation */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Back Button */}
            <div className="flex items-center gap-4">
              <Link 
                to="/" 
                className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">{t("Back")} {t("Home")}</span>
              </Link>
            </div>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Home className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl">ThoseJobs</span>
            </Link>

            {/* Right side - empty for balance */}
            <div className="w-24"></div>
          </div>
        </div>
      </header>

      {/* Login Form */}
      <div className="flex items-center justify-center p-4 min-h-[calc(100vh-4rem)]">
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
              <CardTitle className="text-2xl font-bold">{t("Welcome Back")}</CardTitle>
              <CardDescription>
                {t("Sign in to your ThoseJobs account")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t("Email")}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder={t("Enter your email")}
                      value={formData.email}
                      onChange={handleChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">{t("Password")}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder={t("Enter your password")}
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
                      setForgotPasswordEmail(formData.email);
                      setShowForgotPasswordDialog(true);
                    }}
                  >
                    Forgot Password?
                  </Button>
                  <Button
                    type="button"
                    variant="link"
                    className="text-sm text-muted-foreground hover:text-primary"
                    onClick={() => {
                      setResendVerificationEmail(formData.email);
                      setShowResendVerificationDialog(true);
                    }}
                    disabled={isResendingVerification}
                  >
                    {isResendingVerification ? "Sending..." : "Resend Verification"}
                  </Button>
                </div>



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

            <div className="mt-4 p-3 bg-secondary rounded-lg">
              <p className="text-xs text-muted-foreground">
                <strong>Need Help?</strong> Contact our support team if you're having trouble accessing your account.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>

      {/* Forgot Password Dialog */}
      <Dialog open={showForgotPasswordDialog} onOpenChange={setShowForgotPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Enter your email address to receive a password reset link.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="forgot-password-email">Email</Label>
              <Input
                id="forgot-password-email"
                value={forgotPasswordEmail}
                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </div>
          </div>
          <Button onClick={handlePasswordReset} className="w-full">Send Reset Link</Button>
        </DialogContent>
      </Dialog>

      {/* Resend Verification Dialog */}
      <Dialog open={showResendVerificationDialog} onOpenChange={setShowResendVerificationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resend Verification Email</DialogTitle>
            <DialogDescription>
              Enter your email address to check verification status and resend the verification email if needed.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="resend-verification-email">Email</Label>
              <Input
                id="resend-verification-email"
                value={resendVerificationEmail}
                onChange={(e) => setResendVerificationEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={async () => {
                if (resendVerificationEmail.trim()) {
                  const status = await checkVerificationStatus(resendVerificationEmail);
                  if (status.verified) {
                    toast({
                      title: "Already Verified",
                      description: status.message,
                      variant: "default"
                    });
                  } else if (!status.exists) {
                    toast({
                      title: "Email Not Found",
                      description: status.message,
                      variant: "destructive"
                    });
                  } else {
                    toast({
                      title: "Verification Pending",
                      description: status.message,
                      variant: "default"
                    });
                  }
                }
              }}
              className="flex-1"
            >
              Check Status
            </Button>
            <Button 
              onClick={() => handleResendVerification(resendVerificationEmail)} 
              className="flex-1"
              disabled={isResendingVerification}
            >
              {isResendingVerification ? "Sending..." : "Resend Email"}
            </Button>
          </div>
          

        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserLogin; 