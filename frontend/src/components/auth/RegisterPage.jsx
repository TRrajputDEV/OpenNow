import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { ArrowRight, ArrowLeft, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Import illustrations
import RoleSelection from './illustrations/RoleSelection';
import StudentInfo from './illustrations/StudentInfo';
import TeacherInfo from './illustrations/TeacherInfo';
import Institution from './illustrations/Institution';
import Security from './illustrations/Security';
import Success from './illustrations/Success';

const RegisterPage = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    role: '',
    fullName: '',
    email: '',
    username: '',
    rollNumber: '',
    subject: '',
    institution: '',
    department: '',
    year: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const totalSteps = 5;

  // Validation functions
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validateUsername = (username) => {
    // Only alphanumeric and underscore, 3-20 characters
    const re = /^[a-zA-Z0-9_]{3,20}$/;
    return re.test(username);
  };

  const validatePassword = (password) => {
    return password.length >= 8 && 
           /[A-Z]/.test(password) && 
           /[a-z]/.test(password) && 
           /\d/.test(password);
  };

  const validateStep = (currentStep) => {
    const newErrors = {};

    switch (currentStep) {
      case 1:
        if (!formData.role) {
          newErrors.role = 'Please select a role';
        }
        break;

      case 2:
        if (!formData.fullName.trim()) {
          newErrors.fullName = 'Full name is required';
        } else if (formData.fullName.trim().length < 3) {
          newErrors.fullName = 'Name must be at least 3 characters';
        }

        if (!formData.email.trim()) {
          newErrors.email = 'Email is required';
        } else if (!validateEmail(formData.email)) {
          newErrors.email = 'Invalid email format';
        }

        if (!formData.username.trim()) {
          newErrors.username = 'Username is required';
        } else if (!validateUsername(formData.username)) {
          newErrors.username = 'Username must be 3-20 characters, alphanumeric and underscore only';
        }

        if (formData.role === 'student' && !formData.rollNumber.trim()) {
          newErrors.rollNumber = 'Roll number is required for students';
        }

        if (formData.role === 'teacher' && !formData.subject.trim()) {
          newErrors.subject = 'Subject is required for teachers';
        }
        break;

      case 3:
        if (!formData.institution.trim()) {
          newErrors.institution = 'Institution name is required';
        }
        if (!formData.department.trim()) {
          newErrors.department = 'Department is required';
        }
        if (formData.role === 'student' && !formData.year) {
          newErrors.year = 'Year is required for students';
        }
        break;

      case 4:
        if (!formData.password) {
          newErrors.password = 'Password is required';
        } else if (!validatePassword(formData.password)) {
          newErrors.password = 'Password must be at least 8 characters with uppercase, lowercase, and number';
        }

        if (!formData.confirmPassword) {
          newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Passwords do not match';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const nextStep = () => {
    if (validateStep(step)) {
      if (step < totalSteps) setStep(step + 1);
    } else {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all required fields correctly",
      });
    }
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fix all errors before submitting",
      });
      return;
    }

    setLoading(true);
    try {
      await register({
        username: formData.username.toLowerCase().trim(),
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        fullName: formData.fullName.trim(),
        role: formData.role,
      });

      setStep(6); // Success step
      
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error.message || "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  // Password strength calculation
  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];

  // Get current illustration
  const getCurrentIllustration = () => {
    switch (step) {
      case 1:
        return <RoleSelection />;
      case 2:
        return formData.role === 'student' ? <StudentInfo /> : <TeacherInfo />;
      case 3:
        return <Institution />;
      case 4:
        return <Security />;
      case 6:
        return <Success />;
      default:
        return null;
    }
  };

  // Error component
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

  // Success indicator
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
      {/* Left Side - Dynamic Illustration */}
      <div className="hidden lg:flex lg:w-2/5 bg-secondary border-r relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.5 }}
            className="w-full"
          >
            {getCurrentIllustration()}
          </motion.div>
        </AnimatePresence>

        {/* Logo */}
        <div className="absolute top-8 left-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-foreground flex items-center justify-center">
              <span className="text-background font-bold">प</span>
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-bold text-xl">Pariksha</span>
              <span className="text-xs text-muted-foreground">परीक्षा</span>
            </div>
          </Link>
        </div>

        {/* Step indicator */}
        {step <= totalSteps && (
          <div className="absolute bottom-8 left-8 right-8">
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
              <span>Step {step} of {totalSteps}</span>
              <span>{Math.round((step / totalSteps) * 100)}%</span>
            </div>
            <div className="h-2 bg-background/20 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-foreground"
                initial={{ width: 0 }}
                animate={{ width: `${(step / totalSteps) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <Link to="/" className="flex lg:hidden items-center gap-2 justify-center mb-8">
            <div className="h-10 w-10 rounded-lg bg-foreground flex items-center justify-center">
              <span className="text-background font-bold">प</span>
            </div>
            <span className="font-bold text-xl">Pariksha</span>
          </Link>

          {/* Mobile Progress */}
          {step <= totalSteps && (
            <div className="lg:hidden mb-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                {[...Array(totalSteps)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 flex-1 rounded-full transition-colors ${
                      i < step ? 'bg-foreground' : 'bg-border'
                    }`}
                  />
                ))}
              </div>
              <p className="text-center text-sm text-muted-foreground">
                Step {step} of {totalSteps}
              </p>
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Step 1: Role Selection */}
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">Welcome to Pariksha</h1>
                    <p className="text-muted-foreground">Let's start by choosing your role</p>
                  </div>

                  <div className="space-y-3">
                    {[
                      { value: 'student', label: 'Student', desc: 'Take exams and track progress' },
                      { value: 'teacher', label: 'Teacher', desc: 'Create and manage exams' },
                      { value: 'admin', label: 'Admin', desc: 'Full platform access' },
                    ].map((role) => (
                      <button
                        key={role.value}
                        onClick={() => {
                          updateFormData('role', role.value);
                        }}
                        className={`w-full p-4 rounded-lg border-2 text-left transition-all hover:border-foreground hover:bg-accent ${
                          formData.role === role.value ? 'border-foreground bg-accent' : 'border-border'
                        }`}
                      >
                        <div className="font-semibold mb-1">{role.label}</div>
                        <div className="text-sm text-muted-foreground">{role.desc}</div>
                      </button>
                    ))}
                  </div>

                  {errors.role && <ErrorMessage message={errors.role} />}

                  <Button 
                    onClick={nextStep} 
                    className="w-full"
                    disabled={!formData.role}
                  >
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Step 2: Basic Info */}
              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">
                      {formData.role === 'student' ? 'Student' : 'Teacher'} Information
                    </h2>
                    <p className="text-muted-foreground">Tell us about yourself</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">
                        Full Name <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="fullName"
                          placeholder="John Doe"
                          value={formData.fullName}
                          onChange={(e) => updateFormData('fullName', e.target.value)}
                          onBlur={() => handleBlur('fullName')}
                          className={errors.fullName && touched.fullName ? 'border-red-500' : ''}
                          required
                        />
                        {formData.fullName && !errors.fullName && <SuccessIndicator />}
                      </div>
                      {errors.fullName && touched.fullName && <ErrorMessage message={errors.fullName} />}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">
                        Email <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="email"
                          type="email"
                          placeholder="john@university.edu"
                          value={formData.email}
                          onChange={(e) => updateFormData('email', e.target.value)}
                          onBlur={() => handleBlur('email')}
                          className={errors.email && touched.email ? 'border-red-500' : ''}
                          required
                        />
                        {formData.email && !errors.email && validateEmail(formData.email) && <SuccessIndicator />}
                      </div>
                      {errors.email && touched.email && <ErrorMessage message={errors.email} />}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="username">
                        Username <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="username"
                          placeholder="johndoe"
                          value={formData.username}
                          onChange={(e) => updateFormData('username', e.target.value.toLowerCase())}
                          onBlur={() => handleBlur('username')}
                          className={errors.username && touched.username ? 'border-red-500' : ''}
                          required
                        />
                        {formData.username && !errors.username && validateUsername(formData.username) && <SuccessIndicator />}
                      </div>
                      {errors.username && touched.username && <ErrorMessage message={errors.username} />}
                      <p className="text-xs text-muted-foreground">3-20 characters, letters, numbers, and underscore only</p>
                    </div>

                    {formData.role === 'student' && (
                      <div className="space-y-2">
                        <Label htmlFor="rollNumber">
                          Roll Number <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="rollNumber"
                          placeholder="2025001"
                          value={formData.rollNumber}
                          onChange={(e) => updateFormData('rollNumber', e.target.value)}
                          onBlur={() => handleBlur('rollNumber')}
                          className={errors.rollNumber && touched.rollNumber ? 'border-red-500' : ''}
                        />
                        {errors.rollNumber && touched.rollNumber && <ErrorMessage message={errors.rollNumber} />}
                      </div>
                    )}

                    {formData.role === 'teacher' && (
                      <div className="space-y-2">
                        <Label htmlFor="subject">
                          Subject <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="subject"
                          placeholder="Mathematics"
                          value={formData.subject}
                          onChange={(e) => updateFormData('subject', e.target.value)}
                          onBlur={() => handleBlur('subject')}
                          className={errors.subject && touched.subject ? 'border-red-500' : ''}
                        />
                        {errors.subject && touched.subject && <ErrorMessage message={errors.subject} />}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={prevStep} className="flex-1">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    <Button onClick={nextStep} className="flex-1">
                      Next
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Institution */}
              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Institution Details</h2>
                    <p className="text-muted-foreground">Where do you study/teach?</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="institution">
                        Institution Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="institution"
                        placeholder="Delhi University"
                        value={formData.institution}
                        onChange={(e) => updateFormData('institution', e.target.value)}
                        onBlur={() => handleBlur('institution')}
                        className={errors.institution && touched.institution ? 'border-red-500' : ''}
                      />
                      {errors.institution && touched.institution && <ErrorMessage message={errors.institution} />}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="department">
                        Department <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="department"
                        placeholder="Computer Science"
                        value={formData.department}
                        onChange={(e) => updateFormData('department', e.target.value)}
                        onBlur={() => handleBlur('department')}
                        className={errors.department && touched.department ? 'border-red-500' : ''}
                      />
                      {errors.department && touched.department && <ErrorMessage message={errors.department} />}
                    </div>

                    {formData.role === 'student' && (
                      <div className="space-y-2">
                        <Label htmlFor="year">
                          Year <span className="text-red-500">*</span>
                        </Label>
                        <select
                          id="year"
                          className={`w-full h-10 px-3 rounded-md border bg-background ${
                            errors.year && touched.year ? 'border-red-500' : 'border-input'
                          }`}
                          value={formData.year}
                          onChange={(e) => updateFormData('year', e.target.value)}
                          onBlur={() => handleBlur('year')}
                        >
                          <option value="">Select year</option>
                          <option value="1">1st Year</option>
                          <option value="2">2nd Year</option>
                          <option value="3">3rd Year</option>
                          <option value="4">4th Year</option>
                        </select>
                        {errors.year && touched.year && <ErrorMessage message={errors.year} />}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={prevStep} className="flex-1">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    <Button onClick={nextStep} className="flex-1">
                      Next
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 4: Security */}
             {step === 4 && (
            <div className="space-y-6">
    <div>
      <h2 className="text-2xl font-bold mb-2">Create Password</h2>
      <p className="text-muted-foreground">Secure your account with a strong password</p>
    </div>

    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="password">
          Password <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => updateFormData('password', e.target.value)}
            onBlur={() => handleBlur('password')}
            className={`pr-10 ${errors.password && touched.password ? 'border-red-500' : ''}`}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && touched.password && <ErrorMessage message={errors.password} />}
        
        {formData.password && (
          <div className="space-y-2 mt-2">
            <div className="flex gap-1">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    i < passwordStrength ? strengthColors[passwordStrength - 1] : 'bg-border'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Strength: {strengthLabels[passwordStrength - 1] || 'Too short'}
            </p>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">
          Confirm Password <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={(e) => updateFormData('confirmPassword', e.target.value)}
            onBlur={() => handleBlur('confirmPassword')}
            className={`${
              errors.confirmPassword && touched.confirmPassword 
                ? 'border-red-500 pr-10' 
                : formData.confirmPassword && formData.password === formData.confirmPassword 
                ? 'border-green-500 pr-10' 
                : ''
            }`}
            required
          />
          {/* Success/Error Indicator */}
          {formData.confirmPassword && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {formData.password === formData.confirmPassword ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
            </div>
          )}
        </div>
        
        {/* Real-time matching feedback */}
        {formData.confirmPassword && (
          formData.password === formData.confirmPassword ? (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-1 text-xs text-green-600"
            >
              <CheckCircle2 className="h-3 w-3" />
              <span>Passwords match!</span>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-1 text-xs text-red-500"
            >
              <AlertCircle className="h-3 w-3" />
              <span>Passwords do not match</span>
            </motion.div>
          )
        )}
        
        {errors.confirmPassword && touched.confirmPassword && <ErrorMessage message={errors.confirmPassword} />}
      </div>

      <div className="p-3 rounded-lg bg-secondary text-xs space-y-1">
        <p className="font-medium mb-2">Password requirements:</p>
        <div className="space-y-1">
          <p className={formData.password.length >= 8 ? 'text-green-600 flex items-center gap-1' : 'text-muted-foreground flex items-center gap-1'}>
            {formData.password.length >= 8 ? <CheckCircle2 className="h-3 w-3" /> : <span className="h-3 w-3 rounded-full border border-current" />}
            At least 8 characters
          </p>
          <p className={/[A-Z]/.test(formData.password) ? 'text-green-600 flex items-center gap-1' : 'text-muted-foreground flex items-center gap-1'}>
            {/[A-Z]/.test(formData.password) ? <CheckCircle2 className="h-3 w-3" /> : <span className="h-3 w-3 rounded-full border border-current" />}
            One uppercase letter
          </p>
          <p className={/[a-z]/.test(formData.password) ? 'text-green-600 flex items-center gap-1' : 'text-muted-foreground flex items-center gap-1'}>
            {/[a-z]/.test(formData.password) ? <CheckCircle2 className="h-3 w-3" /> : <span className="h-3 w-3 rounded-full border border-current" />}
            One lowercase letter
          </p>
          <p className={/\d/.test(formData.password) ? 'text-green-600 flex items-center gap-1' : 'text-muted-foreground flex items-center gap-1'}>
            {/\d/.test(formData.password) ? <CheckCircle2 className="h-3 w-3" /> : <span className="h-3 w-3 rounded-full border border-current" />}
            One number
          </p>
        </div>
      </div>
    </div>

    <div className="flex gap-3">
      <Button variant="outline" onClick={prevStep} className="flex-1">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
      <Button 
        onClick={handleSubmit} 
        className="flex-1"
        disabled={
          loading || 
          !validatePassword(formData.password) || 
          formData.password !== formData.confirmPassword ||
          !formData.confirmPassword
        }
      >
        {loading ? 'Creating...' : 'Create Account'}
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>

    {/* Button Status Indicator */}
    {formData.password && formData.confirmPassword && (
      <div className="text-center">
        {!validatePassword(formData.password) ? (
          <p className="text-xs text-muted-foreground">
            ⚠️ Complete all password requirements to continue
          </p>
        ) : formData.password !== formData.confirmPassword ? (
          <p className="text-xs text-red-500">
            ⚠️ Passwords must match to create account
          </p>
        ) : (
          <p className="text-xs text-green-600">
            ✓ Ready to create your account!
          </p>
        )}
      </div>
    )}
              </div>
            )}


              {/* Step 6: Success */}
              {step === 6 && (
                <div className="text-center space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-3xl font-bold">Account Created! </h2>
                    <p className="text-muted-foreground">
                      Welcome to our Platform "Pariksha"
                    </p>
                  </div>

                  <div className="p-6 rounded-lg bg-secondary space-y-2">
                    <p className="text-sm">Redirecting to login page...</p>
                    <div className="h-1 bg-background rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-foreground"
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 3 }}
                      />
                    </div>
                  </div>

                  <Button asChild className="w-full">
                    <Link to="/login">Go to Login</Link>
                  </Button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Login link */}
          {step <= totalSteps && (
            <p className="text-center text-sm text-muted-foreground mt-8">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-foreground hover:underline">
                Sign in
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
