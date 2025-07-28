import { supabase } from './supabaseClient';

export const testEmailConfiguration = async (email: string) => {
  console.log("=== TESTING EMAIL CONFIGURATION ===");
  
  try {
    // Test 1: Check if user exists and email confirmation status
    console.log("🔄 Checking user email confirmation status...");
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    console.log("User data:", userData);
    console.log("User error:", userError);

    if (userError) {
      return { success: false, error: "User not found in database" };
    }

    // Test 2: Try to resend confirmation email
    console.log("🔄 Testing email resend functionality...");
    const { error: resendError } = await supabase.auth.resend({
      type: 'signup',
      email: email
    });

    console.log("Resend error:", resendError);

    if (resendError) {
      return { success: false, error: resendError.message };
    }

    // Test 3: Check auth user status
    console.log("🔄 Checking auth user status...");
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
    
    const authUser = users?.find(u => u.email === email);
    console.log("Auth user:", authUser);

    if (authUser) {
      console.log("Email confirmation status:", {
        email_confirmed_at: authUser.email_confirmed_at,
        confirmed_at: authUser.confirmed_at,
        created_at: authUser.created_at
      });
    }

    return { 
      success: true, 
      message: "Email configuration test completed",
      userData,
      authUser
    };

  } catch (error: any) {
    console.error("❌ Email configuration test failed:", error);
    return { success: false, error: error.message };
  }
};

export const checkEmailSettings = async () => {
  console.log("=== CHECKING EMAIL SETTINGS ===");
  
  try {
    // This would require admin privileges, but we can check what we can
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      console.log("✅ User is authenticated");
      console.log("Session user:", session.user);
      
      // Check if email is confirmed
      const isEmailConfirmed = session.user.email_confirmed_at !== null;
      console.log("Email confirmed:", isEmailConfirmed);
      
      return { 
        success: true, 
        emailConfirmed: isEmailConfirmed,
        userId: session.user.id
      };
    } else {
      console.log("⚠️ No authenticated session");
      return { success: false, error: "No authenticated session" };
    }
  } catch (error: any) {
    console.error("❌ Email settings check failed:", error);
    return { success: false, error: error.message };
  }
}; 