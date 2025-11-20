import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { ArrowRight, Eye, EyeOff, TrendingUp, Users, Zap, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Validation function
  const validateForm = () => {
    const newErrors = {};
    
    if (!email.trim()) {
      newErrors.email = 'Email or username is required';
    } else if (email.trim().length < 3) {
      newErrors.email = 'Must be at least 3 characters';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateForm();
  };

  const updateField = (field, value) => {
    if (field === 'email') setEmail(value);
    if (field === 'password') setPassword(value);
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouched({ email: true, password: true });
    
    if (!validateForm()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all fields correctly",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await login({ 
        username: email.trim().toLowerCase(), 
        password 
      });
      const user = response.data.user;

      toast({
        title: "Welcome back!",
        description: `Logged in as ${user.role}`,
      });

      // Redirect based on role
      if (user.role === 'student') navigate('/student');
      else if (user.role === 'teacher') navigate('/teacher');
      else navigate('/admin');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message || "Invalid credentials. Please check your email and password.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Error Message Component
  const ErrorMessage = ({ message }) => (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-1 text-xs text-red-500 mt-1"
    >
      <AlertCircle className="h-3 w-3" />
      <span>{message}</span>
    </motion.div>
  );

  // Success Indicator
  const SuccessIndicator = () => (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="absolute right-3 top-1/2 -translate-y-1/2"
    >
      <CheckCircle2 className="h-4 w-4 text-green-500" />
    </motion.div>
  );

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Brand */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex lg:w-2/5 bg-secondary border-r relative overflow-hidden"
      >
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="h-10 w-10 rounded-lg bg-foreground flex items-center justify-center group-hover:scale-105 transition-transform">
              <span className="text-background font-bold">प</span>
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-bold text-xl">Pariksha</span>
              <span className="text-xs text-muted-foreground">परीक्षा • پَرِیکْشا</span>
            </div>
          </Link>

          {/* Center Content */}
          <div className="space-y-8">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <h2 className="text-4xl font-bold mb-4">Welcome Back</h2>
              <p className="text-muted-foreground text-lg">
                Continue your journey with India's most trusted exam platform
              </p>
            </motion.div>

            {/* Stats */}
            <div className="space-y-4">
              {[
                { icon: Users, label: '1000+ Active Users', value: '1K+' },
                { icon: Zap, label: 'Instant Grading', value: '< 1s' },
                { icon: TrendingUp, label: 'Success Rate', value: '99%' },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-4 p-4 rounded-lg bg-background/50 border hover:bg-background/80 transition-colors"
                >
                  <div className="h-12 w-12 rounded-lg bg-secondary flex items-center justify-center">
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <p className="text-sm text-muted-foreground">
            © 2025 Pariksha.
          </p>
        </div>

        {/* Background decoration */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-gray-300/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-gray-300/10 rounded-full blur-3xl animate-float-delayed" />
      </motion.div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md space-y-8"
        >
          {/* Mobile Logo */}
          <Link to="/" className="flex lg:hidden items-center gap-2 justify-center">
            <div className="h-10 w-10 rounded-lg bg-foreground flex items-center justify-center">
              <span className="text-background font-bold">प</span>
            </div>
            <span className="font-bold text-xl">Pariksha</span>
          </Link>

          {/* Header */}
          <div className="text-center lg:text-left">
            <h1 className="text-3xl font-bold mb-2">Sign in to your account</h1>
            <p className="text-muted-foreground">
              Enter your credentials to access your dashboard
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email/Username */}
            <div className="space-y-2">
              <Label htmlFor="email">
                Email or Username <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  type="text"
                  placeholder="student@university.edu"
                  value={email}
                  onChange={(e) => updateField('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  className={`h-11 ${errors.email && touched.email ? 'border-red-500 pr-10' : ''} ${
                    email && !errors.email ? 'pr-10' : ''
                  }`}
                  required
                />
                {email && !errors.email && <SuccessIndicator />}
              </div>
              {errors.email && touched.email && <ErrorMessage message={errors.email} />}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">
                  Password <span className="text-red-500">*</span>
                </Label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => updateField('password', e.target.value)}
                  onBlur={() => handleBlur('password')}
                  className={`h-11 pr-10 ${errors.password && touched.password ? 'border-red-500' : ''}`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && touched.password && <ErrorMessage message={errors.password} />}
            </div>

            {/* Remember me */}
            <div className="flex items-center">
              <input
                id="remember"
                type="checkbox"
                className="h-4 w-4 rounded border-border cursor-pointer"
              />
              <label htmlFor="remember" className="ml-2 text-sm text-muted-foreground cursor-pointer select-none">
                Remember me for 30 days
              </label>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full h-11 text-base"
              disabled={loading || (touched.email && touched.password && Object.keys(errors).length > 0)}
            >
              {loading ? (
                <>
                  <span className="animate-pulse">Signing in...</span>
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* Security note */}
          <div className="p-3 rounded-lg bg-secondary/50 border border-border/50">
            <p className="text-xs text-muted-foreground text-center">
              🔒 Your connection is secure and encrypted
            </p>
          </div>

          {/* Register link */}
          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-medium text-foreground hover:underline"
            >
              Create account
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
