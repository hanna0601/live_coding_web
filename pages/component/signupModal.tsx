import { useState } from 'react';
import Modal from '../modal';

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  password?: string;
  phoneNumber?: string;
}

export default function SignupModal({ isOpen, onClose, onSwitchToLogin }: SignupModalProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    phoneNumber: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

const validateField = (field: keyof typeof formData, value: string): string => {
  switch (field) {
    case 'firstName':
      return !value.trim() ? 'First name is required' : '';
    case 'lastName':
      return !value.trim() ? 'Last name is required' : '';
    case 'username':
      return !value.trim() ? 'Username is required' : '';
    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value.trim()) return 'Email is required';
      return !emailRegex.test(value) ? 'Please enter a valid email address' : '';
    case 'password':
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
      if (!value) return 'Password is required';
      return !passwordRegex.test(value) 
        ? 'Password must be at least 8 characters and contain uppercase, lowercase, and numbers' 
        : '';
    case 'phoneNumber':
      return !value.trim() ? 'Phone number is required' : '';
    default:
      return '';
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    // First Name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    // Last Name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!passwordRegex.test(formData.password)) {
      newErrors.password = 'Password must be at least 8 characters and contain uppercase, lowercase, and numbers';
    }

    // Phone number validation
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setErrors({});

    if (!validateForm()) {
      return;
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) {
        // Handle specific error cases
        if (data.error === 'Email already in use') {
          setErrors(prev => ({ ...prev, email: 'Email is already in use' }));
        } else if (data.error === 'Username already taken') {
          setErrors(prev => ({ ...prev, username: 'Username is already taken' }));
        } else {
          setSubmitError(data.error);
        }
        return;
      }
      onSwitchToLogin();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Signup failed');
    }
  };

  const handleInputChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    const error = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Sign Up">
      <form onSubmit={handleSubmit} className="space-y-4">
        {submitError && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 rounded-lg p-3 text-sm">
            {submitError}
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground/70 mb-1">
              First Name
            </label>
            <input
              type="text"
              required
              className={`w-full px-3 py-2 rounded-lg border ${
                errors.firstName ? 'border-red-500' : 'border-foreground/10'
              } bg-background text-foreground focus:outline-none focus:border-foreground/30`}
              value={formData.firstName}
              onChange={handleInputChange('firstName')}
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground/70 mb-1">
              Last Name
            </label>
            <input
              type="text"
              required
              className={`w-full px-3 py-2 rounded-lg border ${
                errors.lastName ? 'border-red-500' : 'border-foreground/10'
              } bg-background text-foreground focus:outline-none focus:border-foreground/30`}
              value={formData.lastName}
              onChange={handleInputChange('lastName')}
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>
            )}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground/70 mb-1">
            Username
          </label>
          <input
            type="text"
            required
            className={`w-full px-3 py-2 rounded-lg border ${
              errors.username ? 'border-red-500' : 'border-foreground/10'
            } bg-background text-foreground focus:outline-none focus:border-foreground/30`}
            value={formData.username}
            onChange={handleInputChange('username')}
          />
          {errors.username && (
            <p className="mt-1 text-sm text-red-500">{errors.username}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground/70 mb-1">
            Email
          </label>
          <input
            type="email"
            required
            className={`w-full px-3 py-2 rounded-lg border ${
              errors.email ? 'border-red-500' : 'border-foreground/10'
            } bg-background text-foreground focus:outline-none focus:border-foreground/30`}
            value={formData.email}
            onChange={handleInputChange('email')}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email}</p>
          )}
        </div>
        <div>
  <label className="block text-sm font-medium text-foreground/70 mb-1">
    Password
  </label>
  <div className="relative">
    <input
      type={showPassword ? "text" : "password"}
      required
      className={`w-full px-3 py-2 rounded-lg border ${
        errors.password ? 'border-red-500' : 'border-foreground/10'
      } bg-background text-foreground focus:outline-none focus:border-foreground/30`}
      value={formData.password}
      onChange={handleInputChange('password')}
    />
    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/70 hover:text-foreground"
      >
        {showPassword ? (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-500">{errors.password}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground/70 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            required
            className={`w-full px-3 py-2 rounded-lg border ${
              errors.phoneNumber ? 'border-red-500' : 'border-foreground/10'
            } bg-background text-foreground focus:outline-none focus:border-foreground/30`}
            value={formData.phoneNumber}
            onChange={handleInputChange('phoneNumber')}
          />
          {errors.phoneNumber && (
            <p className="mt-1 text-sm text-red-500">{errors.phoneNumber}</p>
          )}
        </div>
        <button
          type="submit"
          className="w-full py-2 px-4 bg-foreground text-background rounded-lg hover:bg-foreground/90"
        >
          Sign Up
        </button>
        <div className="text-center text-sm text-foreground/70">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-foreground hover:underline"
          >
            Login
          </button>
        </div>
      </form>
    </Modal>
  );
}