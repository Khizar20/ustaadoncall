import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { testUsersTable, checkRLSPolicies } from "@/lib/testUsersTable";
import { Eye, EyeOff, User, Lock, Mail, Phone, MapPin, ArrowRight, CheckCircle, Bug } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

// Simple password hashing function (in production, use bcrypt or similar)
const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};

const UserRegister = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    address: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [showBypassOption, setShowBypassOption] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Function to manually confirm user (for testing)
  const handleManualConfirmation = async (userId: string) => {
    try {
      console.log("🔄 Manually confirming user:", userId);
      
      // Since we don't have admin privileges, we'll use a different approach
      // We'll update the user's email_confirmed_at directly in the database
      const { error } = await supabase
        .from('users')
        .update({ 
          email_confirmed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        throw new Error(error.message);
      }

      toast({
        title: "User Confirmed",
        description: "You can now log in with your credentials.",
      });

      // Navigate to login
      navigate('/user-login');
    } catch (error: any) {
      console.error("❌ Manual confirmation failed:", error);
      toast({
        title: "Confirmation Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    const errors: string[] = [];

    if (!formData.name.trim()) errors.push("Name is required");
    if (!formData.email.trim()) errors.push("Email is required");
    if (!formData.phone.trim()) errors.push("Phone number is required");
    if (!formData.password) errors.push("Password is required");
    if (formData.password.length < 6) errors.push("Password must be at least 6 characters");
    if (formData.password !== formData.confirmPassword) errors.push("Passwords do not match");
    if (!formData.address.trim()) errors.push("Address is required");

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log("=== USER REGISTRATION START ===");
      console.log("Form data:", formData);

      // Validate form
      if (!formData.name || !formData.email || !formData.phone || !formData.address || !formData.password) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields.",
          variant: "destructive"
        });
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        toast({
          title: "Password Mismatch",
          description: "Passwords do not match.",
          variant: "destructive"
        });
        return;
      }

      console.log("✅ Form validation passed");

      // Hash password
      const hashedPassword = await hashPassword(formData.password);
      console.log("✅ Password hashed successfully");

      console.log("🔄 Creating user in Supabase Auth...");
      
      // Check if user already exists in auth
      const { data: existingUser, error: checkError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });

      let authData;
      let authError;

      if (existingUser.user) {
        // User already exists in auth - this is fine, we'll just update their profile
        console.log("✅ User already exists in Supabase Auth, proceeding with profile creation");
        authData = { user: existingUser.user };
        authError = null;
      } else {
        // Create new user in auth
        const signUpResult = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              name: formData.name,
              phone: formData.phone
            }
          }
        });
        authData = signUpResult.data;
        authError = signUpResult.error;
      }

      console.log("Supabase Auth response:", { authData, authError });

      if (authError) {
        console.error("❌ Supabase Auth error:", authError);
        throw new Error(authError.message);
      }

      if (authData.user) {
        console.log("✅ User created/verified in Supabase Auth:", authData.user.id);
        setCurrentUserId(authData.user.id);

        console.log("🔄 Creating user profile in users table...");
        
        const userProfileData = {
          id: authData.user.id,
          email: formData.email,
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          password_hash: hashedPassword,
          addresses: JSON.stringify([{ label: "Home", address: formData.address, is_default: true }]),
          preferences: JSON.stringify({ notifications: true, sms_notifications: false }),
          created_at: new Date().toISOString()
        };

        console.log("User profile data to insert:", userProfileData);

        // Check if user already exists in users table
        const { data: existingProfile, error: profileCheckError } = await supabase
          .from('users')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        let profileData;
        let profileError;

        if (existingProfile) {
          // Update existing profile
          console.log("✅ User profile already exists, updating...");
          const { data: updateData, error: updateError } = await supabase
            .from('users')
            .update({
              name: formData.name,
              phone: formData.phone,
              address: formData.address,
              password_hash: hashedPassword,
              addresses: JSON.stringify([{ label: "Home", address: formData.address, is_default: true }]),
              preferences: JSON.stringify({ notifications: true, sms_notifications: false }),
              updated_at: new Date().toISOString()
            })
            .eq('id', authData.user.id)
            .select();
          
          profileData = updateData;
          profileError = updateError;
        } else {
          // Create new profile
          console.log("✅ Creating new user profile...");
          const { data: insertData, error: insertError } = await supabase
            .from('users')
            .insert(userProfileData)
            .select();
          
          profileData = insertData;
          profileError = insertError;
        }

        console.log("Users table insert/update response:", { profileData, profileError });

        if (profileError) {
          console.error("❌ Users table error:", profileError);
          throw new Error(`Failed to create user profile: ${profileError.message}`);
        }

        console.log("✅ User profile created/updated successfully:", profileData);

        // Check if user is also a provider
        const { data: providerData, error: providerError } = await supabase
          .from('providers')
          .select('*')
          .eq('user_id', authData.user.id)
          .single();

        if (providerData) {
          console.log("✅ User is also a provider:", providerData);
          toast({
            title: "Account Updated",
            description: "Your account has been updated. You can access both user and provider features.",
          });
        } else {
          console.log("✅ User is not a provider");
          toast({
            title: "Registration Successful",
            description: "Your account has been created successfully. Please check your email for verification.",
          });
        }

        console.log("=== USER REGISTRATION SUCCESS ===");
        setIsVerificationSent(true);
      } else {
        throw new Error("Failed to create user account");
      }
    } catch (error: any) {
      console.error("❌ Registration error:", error);
      let errorMessage = error.message;
      
      if (error.message.includes("User already registered")) {
        errorMessage = "This email is already registered. You can log in or reset your password.";
      } else if (error.message.includes("Invalid email")) {
        errorMessage = "Please enter a valid email address.";
      } else if (error.message.includes("Password should be at least")) {
        errorMessage = "Password should be at least 6 characters long.";
      }
      
      toast({
        title: "Registration Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestDatabase = async () => {
    setIsTesting(true);
    try {
      console.log("=== RUNNING DATABASE TESTS ===");
      
      // Test users table
      const tableTest = await testUsersTable();
      console.log("Table test result:", tableTest);
      
      // Test RLS policies
      const rlsTest = await checkRLSPolicies();
      console.log("RLS test result:", rlsTest);
      
      if (tableTest.success && rlsTest.success) {
        toast({
          title: "Database Tests Passed",
          description: "Users table and RLS policies are working correctly.",
        });
      } else {
        toast({
          title: "Database Tests Failed",
          description: `Table test: ${tableTest.error || 'OK'}, RLS test: ${rlsTest.error || 'OK'}`,
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error("Test failed:", error);
      toast({
        title: "Test Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsTesting(false);
    }
  };

  if (isVerificationSent) {
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
                <CheckCircle className="w-8 h-8 text-green-600" />
              </motion.div>
              <CardTitle className="text-2xl font-bold text-green-600">Check Your Email</CardTitle>
              <CardDescription>
                We've sent a verification link to {formData.email}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Please check your email and click the verification link to activate your account.
                </p>
                <p className="text-xs text-muted-foreground">
                  Don't see the email? Check your spam folder.
                </p>
              </div>
              
              <div className="space-y-2">
                <Button
                  onClick={() => navigate('/user-login')}
                  className="w-full"
                >
                  Go to Login
                </Button>
                
                {/* Resend verification button */}
                <Button
                  variant="outline"
                  onClick={async () => {
                    if (currentUserId) {
                      try {
                        // First check verification status
                        const { data: userData, error: userError } = await supabase
                          .from('users')
                          .select('*')
                          .eq('id', currentUserId)
                          .single();

                        if (userError || !userData) {
                          toast({
                            title: "Error",
                            description: "User not found. Please try registering again.",
                            variant: "destructive"
                          });
                          return;
                        }

                        // Check if already verified
                        if (userData.email_confirmed_at) {
                          toast({
                            title: "Already Verified",
                            description: "This email is already verified. You can log in with your password.",
                            variant: "default"
                          });
                          return;
                        }

                        // Resend verification email
                        const { error } = await supabase.auth.resend({
                          type: 'signup',
                          email: formData.email
                        });

                        if (error) {
                          if (error.message.includes("User already confirmed")) {
                            toast({
                              title: "Already Verified",
                              description: "This email is already verified. You can log in with your password.",
                              variant: "default"
                            });
                          } else {
                            toast({
                              title: "Failed to Resend",
                              description: error.message,
                              variant: "destructive"
                            });
                          }
                        } else {
                          toast({
                            title: "Email Resent",
                            description: "Verification email has been resent. Please check your email and spam folder.",
                          });
                        }
                      } catch (error: any) {
                        toast({
                          title: "Error",
                          description: error.message || "Failed to resend verification email.",
                          variant: "destructive"
                        });
                      }
                    }
                  }}
                  className="w-full"
                >
                  Resend Verification Email
                </Button>
                
                {/* Development bypass option - only show in development */}
                {process.env.NODE_ENV === 'development' && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => setShowBypassOption(!showBypassOption)}
                      className="w-full text-xs"
                    >
                      {showBypassOption ? "Hide" : "Show"} Development Options
                    </Button>
                    
                    {showBypassOption && (
                      <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <p className="text-xs text-yellow-800 mb-2">
                          <strong>Development Mode:</strong> If email verification is not working, you can manually confirm the user.
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            // Use the current user ID from registration
                            if (currentUserId) {
                              handleManualConfirmation(currentUserId);
                            } else {
                              toast({
                                title: "Error",
                                description: "User ID not found. Please try registering again.",
                                variant: "destructive"
                              });
                            }
                          }}
                          className="w-full text-xs"
                        >
                          Manually Confirm User (Dev Only)
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
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
            <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
            <CardDescription>
              Join UstaadOnCall to book trusted service providers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

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
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={handleChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="address"
                    name="address"
                    type="text"
                    placeholder="Enter your address"
                    value={formData.address}
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
                    placeholder="Create a password"
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
                      <EyeOff className="h-4 h-4" />
                    ) : (
                      <Eye className="h-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="pl-10 pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 h-4" />
                    ) : (
                      <Eye className="h-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating Account...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    Create Account
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </Button>

              {/* Debug button - remove in production */}
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleTestDatabase}
                disabled={isTesting}
              >
                {isTesting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    Testing Database...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Bug className="w-4 h-4" />
                    Test Database Connection
                  </div>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/user-login" className="text-primary hover:underline font-medium">
                  Sign In
                </Link>
              </p>
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-700">
                <strong>Security Notice:</strong> Your account will be verified via email before you can access our services.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default UserRegister; 