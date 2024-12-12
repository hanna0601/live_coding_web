import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from './context/useAuth';
import LoginModal from './component/loginModal';
import SignupModal from './component/signupModal';
import { useTheme } from 'next-themes';

const defaultAvatarUrl = '/uploads/avatars/hacker.png';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
  };

  return (
    <nav className="bg-background border-b border-foreground/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold">
              Scriptorium
            </Link>
            <div className="hidden md:block ml-10">
              <div className="flex items-center space-x-4">
                <Link href="/editor" className="text-foreground/80 hover:text-foreground">
                  Editor
                </Link>
                <Link href="/templates" className="text-foreground/80 hover:text-foreground">
                  Templates
                </Link>
                <Link href="/blog" className="text-foreground/80 hover:text-foreground">
                  Blog Posts
                </Link>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Theme Toggle Button */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-full hover:bg-foreground/5"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
              </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
              </svg>
              )}
            </button>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden">
                    <Image
                      src={user.avatarUrl || defaultAvatarUrl}
                      alt={`${user.firstName} ${user.lastName}`}
                      width={32}
                      height={32}
                    />
                  </div>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-background border border-foreground/10">
                    <div className="py-1">
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm hover:bg-foreground/5"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Profile
                      </Link>
                      <Link
                        href="/my-posts"
                        className="block px-4 py-2 text-sm hover:bg-foreground/5"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        My Blog Posts
                      </Link>
                      <Link
                        href="/my-templates"
                        className="block px-4 py-2 text-sm hover:bg-foreground/5"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        My Templates
                      </Link>
                      {user.isAdmin && (
                        <Link
                          href="/admin"
                          className="block px-4 py-2 text-sm hover:bg-foreground/5"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          Manage Content
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm hover:bg-foreground/5"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="text-foreground/80 hover:text-foreground"
                >
                  Login
                </button>
                <button
                  onClick={() => setIsSignupModalOpen(true)}
                  className="bg-foreground text-background px-4 py-2 rounded-full text-sm hover:bg-foreground/90"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSwitchToSignup={() => {
          setIsLoginModalOpen(false);
          setIsSignupModalOpen(true);
        }}
      />
      <SignupModal
        isOpen={isSignupModalOpen}
        onClose={() => setIsSignupModalOpen(false)}
        onSwitchToLogin={() => {
          setIsSignupModalOpen(false);
          setIsLoginModalOpen(true);
        }}
      />
    </nav>
  );
}