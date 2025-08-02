export interface Translation {
  en: string;
  ur: string;
}

export interface TranslationKey {
  [key: string]: Translation;
}

// Core application terms
export const coreTranslations: TranslationKey = {
  // Navigation and main sections
  "Home": { en: "Home", ur: "ہوم" },
  "Services": { en: "Services", ur: "خدمات" },
  "About": { en: "About", ur: "ہمارے بارے میں" },
  "Contact": { en: "Contact", ur: "رابطہ" },
  "Dashboard": { en: "Dashboard", ur: "ڈیش بورڈ" },
  "Profile": { en: "Profile", ur: "پروفائل" },
  "Settings": { en: "Settings", ur: "ترتیبات" },
  "Logout": { en: "Logout", ur: "لاگ آؤٹ" },
  "Login": { en: "Login", ur: "لاگ ان" },
  "Register": { en: "Register", ur: "رجسٹر" },
  "Sign Up": { en: "Sign Up", ur: "سائن اپ" },
  "Sign In": { en: "Sign In", ur: "سائن ان" },

  // User types
  "User": { en: "User", ur: "صارف" },
  "Provider": { en: "Provider", ur: "سروس پرووائیڈر" },
  "Service Provider": { en: "Service Provider", ur: "سروس پرووائیڈر" },
  "Customer": { en: "Customer", ur: "گاہک" },
  "Client": { en: "Client", ur: "کلائنٹ" },

  // Service categories
  "Plumbing": { en: "Plumbing", ur: "پلمبنگ" },
  "Electrical": { en: "Electrical", ur: "الیکٹریکل" },
  "Beauty & Wellness": { en: "Beauty & Wellness", ur: "خوبصورتی اور صحت" },
  "Car Wash": { en: "Car Wash", ur: "کار واش" },
  "Home Cleaning": { en: "Home Cleaning", ur: "گھر کی صفائی" },
  "Appliance Repair": { en: "Appliance Repair", ur: "آلات کی مرمت" },
  "Gardening": { en: "Gardening", ur: "باغبانی" },
  "Painting": { en: "Painting", ur: "پینٹنگ" },
  "All Services": { en: "All Services", ur: "تمام خدمات" },
  "All Providers": { en: "All Providers", ur: "تمام سروس پرووائیڈرز" },
  "Search providers, services, or locations...": { en: "Search providers, services, or locations...", ur: "سروس پرووائیڈرز، خدمات، یا مقامات تلاش کریں..." },
  "found": { en: "found", ur: "ملے" },

  // Service job types
  "Pipe Installation": { en: "Pipe Installation", ur: "پائپ کی تنصیب" },
  "Leak Repair": { en: "Leak Repair", ur: "لیک کی مرمت" },
  "Drain Cleaning": { en: "Drain Cleaning", ur: "ڈرین کی صفائی" },
  "Water Heater Repair": { en: "Water Heater Repair", ur: "واٹر ہیٹر کی مرمت" },
  "Faucet Replacement": { en: "Faucet Replacement", ur: "نلکی کی تبدیلی" },
  "Wiring Installation": { en: "Wiring Installation", ur: "وائرنگ کی تنصیب" },
  "Light Fixture Repair": { en: "Light Fixture Repair", ur: "لائٹ فکسچر کی مرمت" },
  "Circuit Breaker Replacement": { en: "Circuit Breaker Replacement", ur: "سرکٹ بریکر کی تبدیلی" },
  "Outlet Installation": { en: "Outlet Installation", ur: "آؤٹ لیٹ کی تنصیب" },
  "Fan Installation": { en: "Fan Installation", ur: "پنکھے کی تنصیب" },
  "Haircut": { en: "Haircut", ur: "بال کاٹنا" },
  "Facial": { en: "Facial", ur: "فیسیل" },
  "Manicure": { en: "Manicure", ur: "مینیکیور" },
  "Pedicure": { en: "Pedicure", ur: "پیڈیکیور" },
  "Makeup": { en: "Makeup", ur: "میک اپ" },
  "Exterior Wash": { en: "Exterior Wash", ur: "بیرونی دھلائی" },
  "Interior Cleaning": { en: "Interior Cleaning", ur: "اندرونی صفائی" },
  "Waxing": { en: "Waxing", ur: "موم لگانا" },
  "Engine Cleaning": { en: "Engine Cleaning", ur: "انجن کی صفائی" },
  "Room Cleaning": { en: "Room Cleaning", ur: "کمرے کی صفائی" },
  "Bathroom Cleaning": { en: "Bathroom Cleaning", ur: "باتھ روم کی صفائی" },
  "Kitchen Cleaning": { en: "Kitchen Cleaning", ur: "کچن کی صفائی" },
  "Sofa Cleaning": { en: "Sofa Cleaning", ur: "صوفے کی صفائی" },
  "Carpet Cleaning": { en: "Carpet Cleaning", ur: "قالین کی صفائی" },

  // Booking and service terms
  "Book": { en: "Book", ur: "بک کریں" },
  "Booking": { en: "Booking", ur: "بکنگ" },
  "Book a Service": { en: "Book a Service", ur: "سروس بک کریں" },
  "Book Now": { en: "Book Now", ur: "ابھی بک کریں" },
  "Request Service": { en: "Request Service", ur: "سروس کی درخواست" },
  "Service Request": { en: "Service Request", ur: "سروس کی درخواست" },
  "Live Request": { en: "Live Request", ur: "براہ راست درخواست" },
  "Urgent Request": { en: "Urgent Request", ur: "فوری درخواست" },
  "Service Location": { en: "Service Location", ur: "سروس کی جگہ" },
  "Service Date": { en: "Service Date", ur: "سروس کی تاریخ" },
  "Service Time": { en: "Service Time", ur: "سروس کا وقت" },
  "Special Instructions": { en: "Special Instructions", ur: "خصوصی ہدایات" },
  "Instructions": { en: "Instructions", ur: "ہدایات" },

  // Status terms
  "Status": { en: "Status", ur: "حیثیت" },
  "Pending": { en: "Pending", ur: "زیر التوا" },
  "Confirmed": { en: "Confirmed", ur: "تصدیق شدہ" },
  "In Progress": { en: "In Progress", ur: "جاری ہے" },
  "Completed": { en: "Completed", ur: "مکمل" },
  "Cancelled": { en: "Cancelled", ur: "منسوخ" },
  "Active": { en: "Active", ur: "فعال" },
  "Inactive": { en: "Inactive", ur: "غیر فعال" },

  // Payment and pricing
  "Price": { en: "Price", ur: "قیمت" },
  "Pricing": { en: "Pricing", ur: "قیمتوں کا تعین" },
  "Total Amount": { en: "Total Amount", ur: "کل رقم" },
  "Payment": { en: "Payment", ur: "ادائیگی" },
  "Payment Method": { en: "Payment Method", ur: "ادائیگی کا طریقہ" },
  "Bid": { en: "Bid", ur: "بولی" },
  "Bid Amount": { en: "Bid Amount", ur: "بولی کی رقم" },
  "Starting Price": { en: "Starting Price", ur: "شروعاتی قیمت" },
  "Cost": { en: "Cost", ur: "لاگت" },
  "Free": { en: "Free", ur: "مفت" },

  // Rating and reviews
  "Rating": { en: "Rating", ur: "درجہ بندی" },
  "Reviews": { en: "Reviews", ur: "تبصرے" },
  "Review": { en: "Review", ur: "تبصرہ" },
  "Star": { en: "Star", ur: "ستارہ" },
  "Stars": { en: "Stars", ur: "ستارے" },
  "Excellent": { en: "Excellent", ur: "بہترین" },
  "Good": { en: "Good", ur: "اچھا" },
  "Average": { en: "Average", ur: "اوسط" },
  "Poor": { en: "Poor", ur: "برا" },

  // Location and address
  "Location": { en: "Location", ur: "مقام" },
  "Address": { en: "Address", ur: "پتہ" },
  "Nearby": { en: "Nearby", ur: "قریب" },
  "Distance": { en: "Distance", ur: "فاصلہ" },
  "Search Location": { en: "Search Location", ur: "مقام تلاش کریں" },
  "Current Location": { en: "Current Location", ur: "موجودہ مقام" },
  "Select Location": { en: "Select Location", ur: "مقام منتخب کریں" },

  // Contact information
  "Contact": { en: "Contact", ur: "رابطہ" },
  "Phone": { en: "Phone", ur: "فون" },
  "Email": { en: "Email", ur: "ای میل" },
  "Message": { en: "Message", ur: "پیغام" },
  "Send Message": { en: "Send Message", ur: "پیغام بھیجیں" },
  "Chat": { en: "Chat", ur: "چیٹ" },

  // Form fields
  "Name": { en: "Name", ur: "نام" },
  "Full Name": { en: "Full Name", ur: "پورا نام" },
  "First Name": { en: "First Name", ur: "پہلا نام" },
  "Last Name": { en: "Last Name", ur: "آخری نام" },
  "Password": { en: "Password", ur: "پاس ورڈ" },
  "Confirm Password": { en: "Confirm Password", ur: "پاس ورڈ کی تصدیق" },
  "Phone Number": { en: "Phone Number", ur: "فون نمبر" },
  "Email Address": { en: "Email Address", ur: "ای میل ایڈریس" },
  "Bio": { en: "Bio", ur: "تعارف" },
  "Experience": { en: "Experience", ur: "تجربہ" },
  "Description": { en: "Description", ur: "تفصیل" },

  // Actions and buttons
  "Save": { en: "Save", ur: "محفوظ کریں" },
  "Update": { en: "Update", ur: "اپ ڈیٹ کریں" },
  "Edit": { en: "Edit", ur: "ترمیم" },
  "Delete": { en: "Delete", ur: "حذف کریں" },
  "Cancel": { en: "Cancel", ur: "منسوخ کریں" },
  "Submit": { en: "Submit", ur: "جمع کریں" },
  "Search": { en: "Search", ur: "تلاش" },
  "Filter": { en: "Filter", ur: "فلٹر" },
  "Clear": { en: "Clear", ur: "صاف کریں" },
  "Add": { en: "Add", ur: "شامل کریں" },
  "Remove": { en: "Remove", ur: "ہٹائیں" },
  "View": { en: "View", ur: "دیکھیں" },
  "Show": { en: "Show", ur: "دکھائیں" },
  "Hide": { en: "Hide", ur: "چھپائیں" },
  "Close": { en: "Close", ur: "بند کریں" },
  "Open": { en: "Open", ur: "کھولیں" },
  "Next": { en: "Next", ur: "اگلا" },
  "Previous": { en: "Previous", ur: "پچھلا" },
  "Continue": { en: "Continue", ur: "جاری رکھیں" },
  "Back": { en: "Back", ur: "واپس" },
  "Forward": { en: "Forward", ur: "آگے" },

  // Notifications and alerts
  "Notification": { en: "Notification", ur: "نوٹیفیکیشن" },
  "Notifications": { en: "Notifications", ur: "نوٹیفیکیشنز" },
  "Alert": { en: "Alert", ur: "انتباہ" },
  "Warning": { en: "Warning", ur: "تنبیہ" },
  "Error": { en: "Error", ur: "غلطی" },
  "Success": { en: "Success", ur: "کامیابی" },
  "Info": { en: "Info", ur: "معلومات" },
  "Loading": { en: "Loading", ur: "لوڈ ہو رہا ہے" },
  "Please Wait": { en: "Please Wait", ur: "براہ کرم انتظار کریں" },

  // Time and date
  "Today": { en: "Today", ur: "آج" },
  "Yesterday": { en: "Yesterday", ur: "کل" },
  "Tomorrow": { en: "Tomorrow", ur: "کل" },
  "Date": { en: "Date", ur: "تاریخ" },
  "Time": { en: "Time", ur: "وقت" },
  "Duration": { en: "Duration", ur: "دورانیہ" },
  "Minutes": { en: "Minutes", ur: "منٹ" },
  "Hours": { en: "Hours", ur: "گھنٹے" },
  "Days": { en: "Days", ur: "دن" },

  // Verification and security
  "Verified": { en: "Verified", ur: "تصدیق شدہ" },
  "Unverified": { en: "Unverified", ur: "غیر تصدیق شدہ" },
  "Trusted": { en: "Trusted", ur: "قابل اعتماد" },
  "Professional": { en: "Professional", ur: "پیشہ ور" },
  "Expert": { en: "Expert", ur: "ماہر" },
  "Licensed": { en: "Licensed", ur: "لائسنس یافتہ" },

  // Service quality terms
  "Premium": { en: "Premium", ur: "پریمیم" },
  "Quality": { en: "Quality", ur: "معیار" },
  "Reliable": { en: "Reliable", ur: "قابل اعتماد" },
  "Fast": { en: "Fast", ur: "تیز" },
  "Quick": { en: "Quick", ur: "فوری" },
  "Urgent": { en: "Urgent", ur: "فوری" },
  "Emergency": { en: "Emergency", ur: "ہنگامی" },

  // Common phrases
  "How It Works": { en: "How It Works", ur: "یہ کیسے کام کرتا ہے" },
  "Get Started": { en: "Get Started", ur: "شروع کریں" },
  "Learn More": { en: "Learn More", ur: "مزید جانیں" },
  "Read More": { en: "Read More", ur: "مزید پڑھیں" },
  "View All": { en: "View All", ur: "سب دیکھیں" },
  "See All": { en: "See All", ur: "سب دیکھیں" },
  "No Results": { en: "No Results", ur: "کوئی نتیجہ نہیں" },
  "No Data": { en: "No Data", ur: "کوئی ڈیٹا نہیں" },
  "Empty": { en: "Empty", ur: "خالی" },
  "Available": { en: "Available", ur: "دستیاب" },
  "Unavailable": { en: "Unavailable", ur: "غیر دستیاب" },
  "Online": { en: "Online", ur: "آن لائن" },
  "Offline": { en: "Offline", ur: "آف لائن" },

  // Hero section terms
  "Trusted Local Experts": { en: "Trusted Local Experts", ur: "قابل اعتماد مقامی ماہرین" },
  "Book verified professionals": { en: "Book verified professionals", ur: "تصدیق شدہ پیشہ ور افراد کو بک کریں" },
  "Premium quality delivered": { en: "Premium quality delivered", ur: "پریمیم معیار فراہم" },
  "Become a Provider": { en: "Become a Provider", ur: "سروس پرووائیڈر بنیں" },
  "Premium Services": { en: "Premium Services", ur: "پریمیم خدمات" },
  "Three simple steps": { en: "Three simple steps", ur: "تین آسان مراحل" },
  "From home repairs to personal care, our vetted professionals deliver excellence every time.": { en: "From home repairs to personal care, our vetted professionals deliver excellence every time.", ur: "گھر کی مرمت سے لے کر ذاتی نگہداشت تک، ہمارے تصدیق شدہ پیشہ ور افراد ہر بار بہترین خدمات فراہم کرتے ہیں۔" },

  // Dashboard specific terms
  "My Bookings": { en: "My Bookings", ur: "میری بکنگز" },
  "My Requests": { en: "My Requests", ur: "میری درخواستیں" },
  "Recent Activity": { en: "Recent Activity", ur: "حالیہ سرگرمیاں" },
  "Favorites": { en: "Favorites", ur: "پسندیدہ" },
  "Payment Methods": { en: "Payment Methods", ur: "ادائیگی کے طریقے" },
  "Saved Addresses": { en: "Saved Addresses", ur: "محفوظ شدہ پتے" },
  "Service History": { en: "Service History", ur: "سروس کی تاریخ" },
  "Earnings": { en: "Earnings", ur: "آمدنی" },
  "Revenue": { en: "Revenue", ur: "آمدنی" },
  "Income": { en: "Income", ur: "آمدنی" },
  "Jobs Completed": { en: "Jobs Completed", ur: "مکمل شدہ کام" },
  "Active Jobs": { en: "Active Jobs", ur: "فعال کام" },
  "Pending Jobs": { en: "Pending Jobs", ur: "زیر التوا کام" },

  // Authentication terms
  "Forgot Password": { en: "Forgot Password", ur: "پاس ورڈ بھول گئے" },
  "Reset Password": { en: "Reset Password", ur: "پاس ورڈ ری سیٹ کریں" },
  "Create Account": { en: "Create Account", ur: "اکاؤنٹ بنائیں" },
  "Already have an account": { en: "Already have an account", ur: "پہلے سے اکاؤنٹ ہے" },
  "Don't have an account": { en: "Don't have an account", ur: "اکاؤنٹ نہیں ہے" },
  "Remember Me": { en: "Remember Me", ur: "مجھے یاد رکھیں" },
  "Keep me signed in": { en: "Keep me signed in", ur: "مجھے سائن ان رکھیں" },

  // Error messages
  "Something went wrong": { en: "Something went wrong", ur: "کچھ غلط ہوا" },
  "Please try again": { en: "Please try again", ur: "براہ کرم دوبارہ کوشش کریں" },
  "Invalid credentials": { en: "Invalid credentials", ur: "غلط معلومات" },
  "Network error": { en: "Network error", ur: "نیٹ ورک کی غلطی" },
  "Server error": { en: "Server error", ur: "سرور کی غلطی" },
  "Page not found": { en: "Page not found", ur: "صفحہ نہیں ملا" },
  "Access denied": { en: "Access denied", ur: "رسائی مسترد" },
  "Session expired": { en: "Session expired", ur: "سیشن ختم ہو گیا" },
  "Welcome Back": { en: "Welcome Back", ur: "خوش آمدید" },
  "Sign in to your UstaadOnCall account": { en: "Sign in to your UstaadOnCall account", ur: "اپنے UstaadOnCall اکاؤنٹ میں سائن ان کریں" },
  "Enter your email": { en: "Enter your email", ur: "اپنا ای میل درج کریں" },
  "Enter your password": { en: "Enter your password", ur: "اپنا پاس ورڈ درج کریں" },
  "User Login": { en: "User Login", ur: "صارف لاگ ان" },
  "Provider Login": { en: "Provider Login", ur: "سروس پرووائیڈر لاگ ان" },
  "Become Provider": { en: "Become Provider", ur: "سروس پرووائیڈر بنیں" },
  "Logout": { en: "Logout", ur: "لاگ آؤٹ" },

  // Service Provider Application Form
  "JOIN OUR EXPERT NETWORK": { en: "JOIN OUR EXPERT NETWORK", ur: "ہمارے ماہرین کے نیٹ ورک میں شامل ہوں" },
  "Turn your skills into a thriving business": { en: "Turn your skills into a thriving business", ur: "اپنی مہارتوں کو ایک کامیاب کاروبار میں تبدیل کریں" },
  "Join thousands of professionals who've grown their income with UstaadOnCall": { en: "Join thousands of professionals who've grown their income with UstaadOnCall", ur: "ہزاروں پیشہ ور افراد میں شامل ہوں جنہوں نے UstaadOnCall کے ساتھ اپنی آمدنی بڑھائی ہے" },
  "Start Your Application": { en: "Start Your Application", ur: "اپنی درخواست شروع کریں" },
  "Learn More": { en: "Learn More", ur: "مزید جانیں" },
  "Why Choose UstaadOnCall?": { en: "Why Choose UstaadOnCall?", ur: "UstaadOnCall کیوں منتخب کریں؟" },
  "We provide everything you need to succeed as a service professional": { en: "We provide everything you need to succeed as a service professional", ur: "ہم آپ کو سروس پیشہ ور کے طور پر کامیاب ہونے کے لیے ہر چیز فراہم کرتے ہیں" },
  "Grow Your Business": { en: "Grow Your Business", ur: "اپنا کاروبار بڑھائیں" },
  "Access thousands of customers and increase your revenue with our platform": { en: "Access thousands of customers and increase your revenue with our platform", ur: "ہزاروں گاہکوں تک رسائی حاصل کریں اور ہمارے پلیٹ فارم کے ساتھ اپنی آمدنی بڑھائیں" },
  "Trust & Safety": { en: "Trust & Safety", ur: "اعتماد اور حفاظت" },
  "We handle background checks, insurance verification, and customer vetting": { en: "We handle background checks, insurance verification, and customer vetting", ur: "ہم بیک گراؤنڈ چیک، انشورنس کی تصدیق، اور گاہکوں کی جانچ کرتے ہیں" },
  "Marketing Support": { en: "Marketing Support", ur: "مارکیٹنگ کی مدد" },
  "Professional photos, marketing materials, and customer acquisition included": { en: "Professional photos, marketing materials, and customer acquisition included", ur: "پیشہ ورانہ تصاویر، مارکیٹنگ کے مواد، اور گاہکوں کی حصول شامل ہے" },
  "Build Your Reputation": { en: "Build Your Reputation", ur: "اپنی ساکھ بنائیں" },
  "Customer reviews and ratings help build your professional reputation": { en: "Customer reviews and ratings help build your professional reputation", ur: "گاہکوں کے تبصرے اور درجہ بندی آپ کی پیشہ ورانہ ساکھ بنانے میں مدد کرتے ہیں" },
  "Success by the Numbers": { en: "Success by the Numbers", ur: "اعداد و شمار کے مطابق کامیابی" },
  "See how our providers are thriving": { en: "See how our providers are thriving", ur: "دیکھیں کہ ہمارے سروس پرووائیڈرز کیسے ترقی کر رہے ہیں" },
  "Average Monthly Earnings": { en: "Average Monthly Earnings", ur: "اوسط ماہانہ آمدنی" },
  "Jobs Per Week": { en: "Jobs Per Week", ur: "فی ہفتہ کام" },
  "Average Provider Rating": { en: "Average Provider Rating", ur: "اوسط سروس پرووائیڈر درجہ بندی" },
  "Requirements": { en: "Requirements", ur: "ضروریات" },
  "What you need to get started": { en: "What you need to get started", ur: "شروع کرنے کے لیے آپ کو کیا چاہیے" },
  "Professional experience in your service area": { en: "Professional experience in your service area", ur: "اپنے سروس کے شعبے میں پیشہ ورانہ تجربہ" },
  "Valid business license and insurance": { en: "Valid business license and insurance", ur: "درست کاروباری لائسنس اور انشورنس" },
  "Background check clearance": { en: "Background check clearance", ur: "بیک گراؤنڈ چیک کی منظوری" },
  "Professional tools and equipment": { en: "Professional tools and equipment", ur: "پیشہ ورانہ اوزار اور سامان" },
  "Commitment to quality service": { en: "Commitment to quality service", ur: "معیاری سروس کی پابندی" },
  "Reliable transportation": { en: "Reliable transportation", ur: "قابل اعتماد نقل و حمل" },
  "Ready to Get Started?": { en: "Ready to Get Started?", ur: "شروع کرنے کے لیے تیار ہیں؟" },
  "Complete your application in just a few steps": { en: "Complete your application in just a few steps", ur: "اپنی درخواست صرف چند مراحل میں مکمل کریں" },
  "Personal Information": { en: "Personal Information", ur: "ذاتی معلومات" },
  "First Name": { en: "First Name", ur: "پہلا نام" },
  "Last Name": { en: "Last Name", ur: "آخری نام" },
  "Email Address": { en: "Email Address", ur: "ای میل ایڈریس" },
  "Phone Number": { en: "Phone Number", ur: "فون نمبر" },
  "Years of Experience": { en: "Years of Experience", ur: "تجربے کے سال" },
  "Service Area": { en: "Service Area", ur: "سروس کا علاقہ" },
  "Tell Us About Yourself": { en: "Tell Us About Yourself", ur: "اپنے بارے میں بتائیں" },
  "Your first name": { en: "Your first name", ur: "آپ کا پہلا نام" },
  "Your last name": { en: "Your last name", ur: "آپ کا آخری نام" },
  "your.email@example.com": { en: "your.email@example.com", ur: "آپ.ای میل@مثال.com" },
  "(555) 123-4567": { en: "(555) 123-4567", ur: "(555) 123-4567" },
  "Select experience": { en: "Select experience", ur: "تجربہ منتخب کریں" },
  "1-2 years": { en: "1-2 years", ur: "1-2 سال" },
  "3-5 years": { en: "3-5 years", ur: "3-5 سال" },
  "6-10 years": { en: "6-10 years", ur: "10+ سال" },
  "10+ years": { en: "10+ years", ur: "10+ سال" },
  "City, State or ZIP code": { en: "City, State or ZIP code", ur: "شہر، ریاست یا پوسٹل کوڈ" },
  "Describe your experience, specialties, and what makes you a great service provider...": { en: "Describe your experience, specialties, and what makes you a great service provider...", ur: "اپنے تجربے، مہارتوں، اور اس کے بارے میں بتائیں جو آپ کو ایک عظیم سروس پرووائیڈر بناتا ہے..." },
  "Services & Pricing": { en: "Services & Pricing", ur: "خدمات اور قیمتیں" },
  "Select Service(s) You Offer": { en: "Select Service(s) You Offer", ur: "وہ خدمات منتخب کریں جو آپ فراہم کرتے ہیں" },
  "Select one or more services": { en: "Select one or more services", ur: "ایک یا زیادہ خدمات منتخب کریں" },
  "Jobs & Pricing": { en: "Jobs & Pricing", ur: "کام اور قیمتیں" },
  "Price (PKR)": { en: "Price (PKR)", ur: "قیمت (پاکستانی روپے)" },
  "Add Other Job": { en: "Add Other Job", ur: "دوسرا کام شامل کریں" },
  "Job Name": { en: "Job Name", ur: "کام کا نام" },
  "Identity Verification": { en: "Identity Verification", ur: "شناخت کی تصدیق" },
  "CNIC Front Image": { en: "CNIC Front Image", ur: "شناختی کارڈ کی سامنے کی تصویر" },
  "CNIC Back Image": { en: "CNIC Back Image", ur: "شناختی کارڈ کی پیچھے کی تصویر" },
  "Profile Image": { en: "Profile Image", ur: "پروفائل کی تصویر" },
  "Back": { en: "Back", ur: "پیچھے" },
  "Next": { en: "Next", ur: "اگلا" },
  "Submit": { en: "Submit", ur: "جمع کریں" },
  "Submitting...": { en: "Submitting...", ur: "جمع کر رہے ہیں..." },
  "By submitting this application, you agree to our terms of service and privacy policy. We'll review your application within 48 hours.": { en: "By submitting this application, you agree to our terms of service and privacy policy. We'll review your application within 48 hours.", ur: "اس درخواست کو جمع کرنے سے، آپ ہماری سروس کی شرائط اور رازداری کی پالیسی سے متفق ہیں۔ ہم آپ کی درخواست کا جائزہ 48 گھنٹوں کے اندر لیں گے۔" },
  "Missing Information": { en: "Missing Information", ur: "غائب معلومات" },
  "Please fill in all required fields.": { en: "Please fill in all required fields.", ur: "براہ کرم تمام ضروری فیلڈز پُر کریں۔" },
  "Invalid Email": { en: "Invalid Email", ur: "غلط ای میل" },
  "Please enter a valid email address.": { en: "Please enter a valid email address.", ur: "براہ کرم درست ای میل ایڈریس درج کریں۔" },
  "Invalid Phone Number": { en: "Invalid Phone Number", ur: "غلط فون نمبر" },
  "Please enter a valid Pakistani phone number.": { en: "Please enter a valid Pakistani phone number.", ur: "براہ کرم درست پاکستانی فون نمبر درج کریں۔" },
  "No Services Selected": { en: "No Services Selected", ur: "کوئی خدمت منتخب نہیں کی گئی" },
  "Please select at least one service you offer.": { en: "Please select at least one service you offer.", ur: "براہ کرم کم از کم ایک خدمت منتخب کریں جو آپ فراہم کرتے ہیں۔" },
  "Pricing Errors": { en: "Pricing Errors", ur: "قیمتوں کی غلطیاں" },
  "Please fix the pricing errors before continuing.": { en: "Please fix the pricing errors before continuing.", ur: "براہ کرم جاری رکھنے سے پہلے قیمتوں کی غلطیوں کو درست کریں۔" },
  "Missing Documents": { en: "Missing Documents", ur: "غائب دستاویزات" },
  "Please upload all required documents.": { en: "Please upload all required documents.", ur: "براہ کرم تمام ضروری دستاویزات اپ لوڈ کریں۔" },
  "Application Submitted!": { en: "Application Submitted!", ur: "درخواست جمع کر دی گئی!" },
  "Your provider application has been submitted successfully. We'll review it and get back to you soon.": { en: "Your provider application has been submitted successfully. We'll review it and get back to you soon.", ur: "آپ کی سروس پرووائیڈر کی درخواست کامیابی سے جمع کر دی گئی ہے۔ ہم اس کا جائزہ لیں گے اور جلد آپ سے رابطہ کریں گے۔" },
  "Price must be at least 100 PKR": { en: "Price must be at least 100 PKR", ur: "قیمت کم از کم 100 پاکستانی روپے ہونی چاہیے" },
  "Job name is required": { en: "Job name is required", ur: "کام کا نام ضروری ہے" },
  "Error": { en: "Error", ur: "غلطی" },
  "Failed to submit application. Please try again.": { en: "Failed to submit application. Please try again.", ur: "درخواست جمع کرنے میں ناکام۔ براہ کرم دوبارہ کوشش کریں۔" }
};

// Language context and utilities
export type Language = 'en' | 'ur';

import { useState } from 'react';

export const useLanguage = () => {
  const [language, setLanguage] = useState<Language>('en');

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'ur' : 'en');
  };

  const t = (key: string): string => {
    const translation = coreTranslations[key];
    if (!translation) {
      console.warn(`Translation not found for key: ${key}`);
      return key;
    }
    return translation[language];
  };

  return { language, setLanguage, toggleLanguage, t };
};

// Hook for components
export const useTranslation = () => {
  const { language, setLanguage, toggleLanguage, t } = useLanguage();
  
  return {
    language,
    setLanguage,
    toggleLanguage,
    t,
    isEnglish: language === 'en',
    isUrdu: language === 'ur'
  };
}; 