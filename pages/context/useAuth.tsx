import { useState, useEffect, createContext, useContext } from 'react';
import { useRouter } from 'next/router';

interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  avatarUrl?: string;
  authenticated: boolean;
  lastUpdate?: number;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {},
  logout: () => {},
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 添加刷新token的函数
  const refreshAccessToken = async () => {
    try {
      const response = await fetch('/api/token/refresh', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        const { accessToken } = await response.json();
        localStorage.setItem('token', accessToken);
        return accessToken;
      }
      return null;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      return null;
    }
  };

  const checkAuth = async () => {
    try {
      let token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      // 验证token
      const verifyResponse = await fetch('/api/auth/verify', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (!verifyResponse.ok) {
        // Token 无效，尝试刷新
        const newToken = await refreshAccessToken();
        if (!newToken) {
          localStorage.removeItem('token');
          setUser(null);
          setLoading(false);
          return;
        }
        token = newToken;
      }

      // 使用有效的token获取用户信息
      const userResponse = await fetch('/api/users/self', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
      });
      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();

    // 设置定时刷新token
    const refreshInterval = setInterval(async () => {
      if (user) {
        await refreshAccessToken();
      }
    }, 20 * 60 * 1000); // 每20分钟刷新一次

    return () => clearInterval(refreshInterval);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }

    const { token } = await response.json();
    localStorage.setItem('token', token);
    await checkAuth();
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

export default useAuth;