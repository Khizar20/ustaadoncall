import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { Eye, EyeOff, User, Lock, Mail, Phone, MapPin, ArrowRight, CheckCircle, Home, ArrowLeft } from "lucide-react";
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



  // Show success state if registration was successful
  if (isVerificationSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
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
                  <span className="font-medium">Back to Home</span>
                </Link>
              </div>

              {/* Logo */}
              <Link to="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Home className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl">UstaadOnCall</span>
              </Link>

              {/* Right side - empty for balance */}
              <div className="w-24"></div>
            </div>
          </div>
        </header>

        {/* Success Message */}
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
                  className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4"
                >
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </motion.div>
                <CardTitle className="text-2xl font-bold text-green-600">Registration Successful!</CardTitle>
                <CardDescription>
                  Your account has been created successfully. Please check your email for verification.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>Next Steps:</strong>
                  </p>
                  <ul className="text-sm text-blue-700 mt-2 space-y-1">
                    <li>• Check your email for verification link</li>
                    <li>• Click the verification link to activate your account</li>
                    <li>• Once verified, you can log in to your account</li>
                  </ul>
                </div>
                
                <Button
                  onClick={() => {
                    setIsVerificationSent(false);
                    setFormData({
                      name: "",
                      email: "",
                      phone: "",
                      password: "",
                      confirmPassword: "",
                      address: ""
                    });
                  }}
                  className="w-full"
                >
                  Register Another Account
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => navigate('/user-login')}
                  className="w-full"
                >
                  Go to Login
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
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
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
                <span className="font-medium">Back to Home</span>
              </Link>
            </div>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Home className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl">UstaadOnCall</span>
            </Link>

            {/* Right side - empty for balance */}
            <div className="w-24"></div>
          </div>
        </div>
      </header>

      {/* Registration Form */}
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
              <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
              <CardDescription>
                Join UstaadOnCall and start booking services
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
  </div>
  );
};

export default UserRegister; 