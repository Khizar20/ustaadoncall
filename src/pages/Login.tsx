import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/ui/navigation";
import { Footer } from "@/components/ui/footer";

const features = [
  {
    icon: () => <span className="text-2xl">🛡️</span>,
    title: "Secure Access",
    description: "Bank-level security for your account"
  },
  {
    icon: () => <span className="text-2xl">👥</span>,
    title: "Personalized Experience",
    description: "Find the right service for your needs"
  },
  {
    icon: () => <span className="text-2xl">🏠</span>,
    title: "Home Services",
    description: "Book trusted professionals instantly"
  }
];

// Animated floating icons background
const FloatingIcons = () => {
  const icons = ["🔧", "✂️", "🔌", "🏠", "🎨", "🧰"];
  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none z-0">
      {icons.map((icon, i) => (
        <motion.div
          key={i}
          className={`absolute text-[24px] md:text-[32px] opacity-10 animate-float${i+1}`}
          style={{
            left: `${10 + Math.random() * 80}%`,
            top: `${10 + Math.random() * 80}%`,
            animationDelay: `${i * 1.3}s`,
          }}
          animate={{
            y: [0, -20, 10, 0],
            rotate: [0, 120, 240, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 1.3,
          }}
        >
          {icon}
        </motion.div>
      ))}
    </div>
  );
};

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [cardTilt, setCardTilt] = useState({ x: 0, y: 0 });
  const [focusField, setFocusField] = useState<string | null>(null);

  // 3D card tilt effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 30;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 30;
    setCardTilt({ x, y });
  };
  const handleMouseLeave = () => setCardTilt({ x: 0, y: 0 });

  // Form submit logic
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setErrors({});
    await new Promise(res => setTimeout(res, 2000));
    const errs: any = {};
    if (!email) errs.email = 'Email is required';
    if (!password) errs.password = 'Password is required';
    setErrors(errs);
    if (Object.keys(errs).length) { setLoading(false); return; }
    setSuccess(true);
    setLoading(false);
    setTimeout(() => setSuccess(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f9fa] to-[#e9ecef] flex flex-col relative overflow-x-hidden">
      <Navigation />
      <FloatingIcons />
      {/* Subtle animated background gradient */}
      <motion.div
        className="absolute inset-0 z-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          background: "radial-gradient(ellipse 80% 60% at 60% 40%, #1DBF73 0%, transparent 100%)"
        }}
        transition={{ duration: 1.2 }}
      />
      <motion.div
        className="container mx-auto px-4 py-12 flex-1 flex flex-col lg:flex-row items-center justify-center z-10 min-h-[90vh]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Left Side - Login Card */}
        <motion.div
          className="w-full max-w-md mx-auto relative mt-24 mb-8 lg:mt-0 lg:mb-0"
          style={{
            transform: `perspective(900px) rotateY(${cardTilt.x}deg) rotateX(${-cardTilt.y}deg)`
          }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          initial={{ scale: 0.95, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 120, damping: 12 }}
          whileHover={{ scale: 1.04, boxShadow: "0 16px 48px rgba(29,191,115,0.18)" }}
        >
          {/* Brand Header */}
          <motion.div
            className="text-center mb-6 mt-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="w-12 h-12 mx-auto rounded-2xl flex items-center justify-center bg-gradient-to-br from-[#1DBF73] to-[#17a863] shadow-lg animate-logoBounce text-2xl">
              <span role="img" aria-label="logo">🛠️</span>
            </div>
            <h1 className="text-2xl font-bold text-[#1DBF73] mt-2 mb-1">UstaadOnCall</h1>
            <p className="text-gray-500 text-sm animate-fadeInUp opacity-80">Helping Hands Are Just a Click Away</p>
          </motion.div>
          {/* Login Card */}
          <motion.div
            className="bg-white/80 backdrop-blur-2xl rounded-2xl p-5 shadow-xl border border-white/30 transition-all relative overflow-hidden"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <motion.form
              onSubmit={handleSubmit}
              className="space-y-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="mb-6">
                <label className="block mb-2 text-gray-800 font-medium text-sm">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    className={`form-input w-full py-4 pl-12 pr-4 rounded-xl border-2 bg-white text-base transition focus:outline-none ${focusField === 'email' ? 'border-[#1DBF73] ring-2 ring-[#1DBF73]/30 shadow-[0_0_16px_0_rgba(29,191,115,0.10)]' : 'border-[#e9ecef]'}`}
                    placeholder="Enter your email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onFocus={() => setFocusField('email')}
                    onBlur={() => setFocusField(null)}
                    required
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-gray-400">📧</span>
                </div>
                {errors.email && (
                  <motion.div className="text-xs text-red-500 mt-1 animate-fadeInUp" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{errors.email}</motion.div>
                )}
              </div>
              <div className="mb-6">
                <label className="block mb-2 text-gray-800 font-medium text-sm">Password</label>
                <div className="relative">
                  <input
                    type="password"
                    className={`form-input w-full py-4 pl-12 pr-4 rounded-xl border-2 bg-white text-base transition focus:outline-none ${focusField === 'password' ? 'border-[#1DBF73] ring-2 ring-[#1DBF73]/30 shadow-[0_0_16px_0_rgba(29,191,115,0.10)]' : 'border-[#e9ecef]'}`}
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onFocus={() => setFocusField('password')}
                    onBlur={() => setFocusField(null)}
                    required
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-gray-400">🔒</span>
                </div>
                {errors.password && (
                  <motion.div className="text-xs text-red-500 mt-1 animate-fadeInUp" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{errors.password}</motion.div>
                )}
              </div>
              <motion.button
                type="submit"
                className={`submit-btn w-full py-4 rounded-xl bg-gradient-to-br from-[#1DBF73] to-[#17a863] text-white font-semibold text-base shadow-lg transition-all relative flex items-center justify-center ${loading ? 'loading' : ''} ${success ? 'success bg-[#28a745]' : ''}`}
                disabled={loading}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className={`btn-text transition-all ${loading || success ? 'opacity-0' : 'opacity-100'}`}>Find Services</span>
                {loading && (
                  <span className="btn-loading absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-100">
                    <span className="loading-spinner w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin block" />
                  </span>
                )}
                {success && (
                  <span className="success-checkmark absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-100">
                    <span className="checkmark-circle w-6 h-6 rounded-full bg-white flex items-center justify-center animate-checkmarkBounce">✓</span>
                  </span>
                )}
              </motion.button>
              <div className="text-center">
                <p className="text-muted-foreground">
                  Don&apos;t have an account?{' '}
                  <Link to="/register" className="text-primary hover:underline font-medium">
                    Sign up
                  </Link>
                </p>
              </div>
            </motion.form>
            {/* Divider */}
            <div className="divider text-center my-6 text-gray-400 text-sm relative">
              <span className="bg-white/95 px-4 relative z-10">or continue with</span>
              <div className="absolute left-0 right-0 top-1/2 h-px bg-[#e9ecef] z-0" />
            </div>
            {/* Social Login */}
            <div className="flex gap-3 mb-6">
              <a href="#" className="flex-1 py-3 rounded-xl border-2 border-[#e9ecef] bg-white flex items-center justify-center gap-2 font-medium text-sm text-[#ea4335] hover:border-[#1DBF73] hover:shadow transition">
                <span>📧</span> Google
              </a>
              <a href="#" className="flex-1 py-3 rounded-xl border-2 border-[#e9ecef] bg-white flex items-center justify-center gap-2 font-medium text-sm text-[#1877f2] hover:border-[#1DBF73] hover:shadow transition">
                <span>📘</span> Facebook
              </a>
            </div>
            {/* Guest Login */}
            <div className="text-center">
              <a href="#" className="text-gray-500 text-sm font-medium px-4 py-2 rounded-md hover:text-[#1DBF73] hover:bg-[#1DBF73]/5 transition inline-block">Continue as Guest</a>
            </div>
          </motion.div>
        </motion.div>
        {/* Right Side - Features */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-8 w-full max-w-xl mx-auto"
        >
          <div className="text-center lg:text-left">
            <h2 className="font-heading font-bold text-3xl lg:text-4xl text-foreground mb-4">
              Why Join UstaadOnCall?
            </h2>
            <p className="text-lg text-muted-foreground">
              Book trusted home services and enjoy a seamless experience
            </p>
          </div>
          <div className="space-y-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="flex items-start space-x-4 p-6 rounded-2xl bg-card border border-border hover:shadow-lg transition-all duration-300"
                whileHover={{ scale: 1.04, rotate: [0, 2, -2, 0] }}
              >
                <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  {feature.icon()}
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-foreground mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
      <Footer />
    </div>
  );
};

export default Login; 