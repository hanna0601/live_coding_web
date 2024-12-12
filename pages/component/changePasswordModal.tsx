import { useState } from 'react';
import Modal from '../modal';
import { useAuth } from '../context/useAuth';
import { useRouter } from 'next/router';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { logout } = useAuth();
  const router = useRouter();  const [passwordErrors, setPasswordErrors] = useState({
    newPassword: '',
    confirmPassword: ''
  });


  const validatePassword = (password: string): string => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/\d/.test(password)) {
      return 'Password must contain at least one number';
    }
    return '';
  };

  const validatePasswordRealTime = (password: string): string => {
    if (password.length === 0) return '';
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/\d/.test(password)) {
      return 'Password must contain at least one number';
    }
    return '';
  };

  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewPassword(value);
    setPasswordErrors(prev => ({
      ...prev,
      newPassword: validatePasswordRealTime(value)
    }));
    
    // 如果确认密码已经输入，检查是否匹配
    if (confirmPassword) {
      setPasswordErrors(prev => ({
        ...prev,
        confirmPassword: value !== confirmPassword ? 'Passwords do not match' : ''
      }));
    }
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setConfirmPassword(value);
    setPasswordErrors(prev => ({
      ...prev,
      confirmPassword: value !== newPassword ? 'Passwords do not match' : ''
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 检查是否有任何验证错误
    if (passwordErrors.newPassword || passwordErrors.confirmPassword) {
      setError('Please fix the password errors before submitting');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/changePassword', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error);
        return;
      }

      // Show success message
      alert('Password changed successfully! Please login again.');
      
      // Logout and redirect
      logout();
      router.push('/');
    } catch (err) {
      setError('Failed to change password. Please try again.');
    }
  };

  const EyeIcon = ({ show }: { show: boolean }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-5 h-5"
    >
      {show ? (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
        />
      ) : (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
      )}
    </svg>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Change Password">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 rounded-lg p-3 text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-foreground/70 mb-1">
            Current Password
          </label>
          <div className="relative">
            <input
              type={showCurrentPassword ? "text" : "password"}
              required
              className="w-full px-3 py-2 rounded-lg border border-foreground/10 bg-background text-foreground focus:outline-none focus:border-foreground/30"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/70 hover:text-foreground"
            >
              <EyeIcon show={showCurrentPassword} />
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground/70 mb-1">
            New Password
          </label>
          <div className="relative">
            <input
              type={showNewPassword ? "text" : "password"}
              required
              className="w-full px-3 py-2 rounded-lg border border-foreground/10 bg-background text-foreground focus:outline-none focus:border-foreground/30"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/70 hover:text-foreground"
            >
              <EyeIcon show={showNewPassword} />
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground/70 mb-1">
            Confirm New Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              required
              className="w-full px-3 py-2 rounded-lg border border-foreground/10 bg-background text-foreground focus:outline-none focus:border-foreground/30"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/70 hover:text-foreground"
            >
              <EyeIcon show={showConfirmPassword} />
            </button>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-foreground/10 rounded-md text-foreground/70 hover:bg-foreground/5"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-foreground text-background rounded-md hover:bg-foreground/90"
          >
            Change Password
          </button>
        </div>
      </form>
    </Modal>
  );
}