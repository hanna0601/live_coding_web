import { useState, useEffect } from 'react';
import { useAuth } from './context/useAuth';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Navbar from './Navbar';
import AvatarUploadModal from './component/avatarUploadModal';
import ChangePasswordModal from './component/changePasswordModal';
import Link from 'next/link';

const defaultAvatarUrl = '/uploads/avatars/hacker.png';
const MAX_FILE_SIZE = 512 * 1024; // 512KB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

export default function Profile() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
  });
  const [uploadError, setUploadError] = useState<string>('');
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const handleAvatarUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
  
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users/me/avatar', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
  
      if (response.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    } else if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber || '',
      });
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch('/api/users/self', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsEditing(false);
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  if (loading || !user) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-4xl mx-auto p-8">
          <div className="flex items-start gap-8">
            <div className="relative w-40 h-40">
              <div className="absolute inset-0 rounded-full overflow-hidden">
                <Image
                  src={user.avatarUrl || defaultAvatarUrl}
                  alt="Profile"
                  fill
                  className="object-cover"
                />
              </div>
              <button
                onClick={() => setIsAvatarModalOpen(true)}
                className="absolute bottom-0 right-0 p-1.5 bg-background/80 hover:bg-background rounded-lg border border-foreground/10 z-10"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-2.5 h-2.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"
                  />
                </svg>
              </button>
            </div>

            <div className="flex-1 space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  {user.username}
                </h1>
              </div>

              <div className="bg-foreground/5 rounded-lg p-6 space-y-4">
                <div>
                  <h2 className="text-sm font-medium text-foreground/70">Full Name</h2>
                  <p className="mt-1 text-lg">
                    {isEditing ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          className="flex-1 bg-background border border-foreground/10 rounded px-3 py-1"
                          placeholder="First Name"
                        />
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          className="flex-1 bg-background border border-foreground/10 rounded px-3 py-1"
                          placeholder="Last Name"
                        />
                      </div>
                    ) : (
                      `${user.firstName} ${user.lastName}`
                    )}
                  </p>
                </div>

                <div>
                  <h2 className="text-sm font-medium text-foreground/70">Email</h2>
                  <p className="mt-1 text-lg">{user.email}</p>
                </div>

                <div>
                  <h2 className="text-sm font-medium text-foreground/70">Phone</h2>
                  <p className="mt-1 text-lg">
                    {isEditing ? (
                      <input
                        type="text"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                        className="w-full bg-background border border-foreground/10 rounded px-3 py-1"
                        placeholder="Phone Number"
                      />
                    ) : (
                      user.phoneNumber || '-'
                    )}
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
              {isEditing ? (
  <div className="space-x-3">
    <button
      onClick={() => setIsEditing(false)}
      className="px-4 py-2 border border-foreground/10 rounded-md text-foreground/70 hover:bg-foreground/5"
    >
      Cancel
    </button>
    <button
      onClick={handleSubmit}
      className="px-4 py-2 bg-foreground text-background rounded-md hover:bg-foreground/90"
    >
      Save Changes
    </button>
  </div>
) : (
  <div className="flex space-x-3">
    <Link href="/my-templates">
      <button
        className="px-4 py-2 border border-foreground/10 rounded-md text-foreground/70 hover:bg-foreground/5"
      >
        My Templates
      </button>
    </Link>
    <Link href="/my-posts">
      <button
        className="px-4 py-2 border border-foreground/10 rounded-md text-foreground/70 hover:bg-foreground/5"
      >
        My Blog Posts
      </button>
    </Link>
    {user.isAdmin && (
      <Link href="/admin">
        <button
          className="px-4 py-2 border border-foreground/10 rounded-md text-foreground/70 hover:bg-foreground/5"
        >
          Manage Content
        </button>
      </Link>
    )}
    <button
      onClick={() => setIsEditing(true)}
      className="px-4 py-2 border border-foreground/10 rounded-md text-foreground/70 hover:bg-foreground/5"
    >
      Edit Profile
    </button>
    <button
      onClick={() => setIsChangePasswordModalOpen(true)}
      className="px-4 py-2 border border-foreground/10 rounded-md text-foreground/70 hover:bg-foreground/5"
    >
                      Change Password
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <AvatarUploadModal
            isOpen={isAvatarModalOpen}
            onClose={() => setIsAvatarModalOpen(false)}
            onUpload={handleAvatarUpload}
          />
          <ChangePasswordModal
            isOpen={isChangePasswordModalOpen}
            onClose={() => setIsChangePasswordModalOpen(false)}
          />
        </div>
      </div>
    </> 
  );
}