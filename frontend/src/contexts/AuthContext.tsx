import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { config } from "@/config/env";

export interface User {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  contact?: string;
  userRole?: string;
  categoryType?: string;
  isOrganization?: boolean;
  about?: string;
  profession?: string;
  linkedIn?: string;
  instagram?: string;
  facebook?: string;
  address?: string;
  emailUpdates?: boolean;
  document?: {
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
    uploadDate: string;
  };
  profilePhoto?: {
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
    uploadDate: string;
  };
  isVerified?: boolean;
  verificationStatus?: 'unverified' | 'pending' | 'verified' | 'rejected';
  verificationDocuments?: Array<{
    type: 'id_proof' | 'address_proof' | 'income_proof' | 'education_proof' | 'other';
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
    uploadDate: string;
  }>;
  verificationNotes?: string;
  verifiedAt?: string;
  verifiedBy?: string;
}

interface AuthContextType {
  user: User | null;
  //User login
  login: (email: string, password: string, userRole?: string) => Promise<{ success: boolean; user?: any; error?: string; message?: string }>;
  //Admin login
  adminLogin: (email: string, password: string) => Promise<{ success: boolean; user?: any; error?: string; message?: string }>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};



export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastActivity, setLastActivity] = useState<number>(Date.now());

  // Update last activity on user interactions
  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    const updateActivity = () => {
      setLastActivity(Date.now());
    };

    events.forEach(event => {
      window.addEventListener(event, updateActivity, { passive: true });
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, updateActivity);
      });
    };
  }, []);

  // Check for inactivity and auto-logout
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const inactiveTime = now - lastActivity;
      const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds

      if (inactiveTime > oneHour && user) {
        console.log('User inactive for more than 1 hour, logging out automatically');
        logout();
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [lastActivity, user]);

  useEffect(() => {
    const validateStoredAuth = async () => {
      const storedUser = localStorage.getItem('authUser');
      const storedToken = localStorage.getItem('authToken');
      if (storedUser && storedToken) {
        try {
          // Validate token with backend
          const response = await fetch(`${config.apiUrl}/api/auth/validate`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${storedToken}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const data = await response.json();
            if (data.valid) {
              // Token is valid, fetch latest user data to ensure verification status is up to date
              try {
                const userResponse = await fetch(`${config.apiUrl}/api/users/me`, {
                  method: 'GET',
                  headers: {
                    'Authorization': `Bearer ${storedToken}`,
                    'Content-Type': 'application/json',
                  },
                });
                
                if (userResponse.ok) {
                  const userData = await userResponse.json();
                  if (userData.user) {
                    setUser(userData.user);
                    localStorage.setItem('authUser', JSON.stringify(userData.user));
                  } else {
                    setUser(JSON.parse(storedUser));
                  }
                } else {
                  // If user fetch fails, use stored user data
                  setUser(JSON.parse(storedUser));
                }
              } catch (userFetchError) {
                // If user fetch fails, use stored user data
                setUser(JSON.parse(storedUser));
              }
            } else {
              // Token is invalid, clear storage
              localStorage.removeItem('authUser');
              localStorage.removeItem('authToken');
              setUser(null);
            }
          } else if (response.status === 404) {
            // Endpoint not found - backend might not be running
            // Don't clear storage when backend is not available - assume token is valid
            setUser(JSON.parse(storedUser));
          } else {
            // Validation failed, but don't clear storage immediately - might be temporary
            // Keep the stored user to prevent unnecessary logout
            setUser(JSON.parse(storedUser));
          }
        } catch (error) {
          // On network error, don't clear storage - assume token is valid
          setUser(JSON.parse(storedUser));
        }
      }
      setIsLoading(false);
    };

    validateStoredAuth();
  }, []);

  const login = async (email: string, password: string, userRole?: string): Promise<{ success: boolean; user?: any; error?: string; message?: string }> => {
    try {
      setIsLoading(true);
      
      const requestBody = { email, password, userRole };      
      const response = await fetch(`${config.apiUrl}${config.endpoints.auth}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        setIsLoading(false);
        return { 
          success: false, 
          error: errorData.error || 'Login failed',
          message: errorData.message
        };
      }
      
      const data = await response.json();      
      const apiUser = data.user;
      const token = data.token as string;
      
      // Map backend user data to frontend User interface
      const mappedUser: User = {
        id: apiUser.id || apiUser._id,
        name: apiUser.name,
        email: apiUser.email,
        profileImage: undefined,
        contact: apiUser.contact || apiUser.phone,
        userRole: apiUser.userRole,
        categoryType: apiUser.categoryType,
        isOrganization: apiUser.isOrganization,
        about: apiUser.about,
        profession: apiUser.profession,
        linkedIn: apiUser.linkedIn,
        instagram: apiUser.instagram,
        facebook: apiUser.facebook,
        address: apiUser.address,
        emailUpdates: apiUser.emailUpdates,
        document: apiUser.document,
        profilePhoto: apiUser.profilePhoto,
        isVerified: apiUser.isVerified,
        verificationStatus: apiUser.verificationStatus,
        verificationDocuments: apiUser.verificationDocuments,
        verificationNotes: apiUser.verificationNotes,
        verifiedAt: apiUser.verifiedAt,
        verifiedBy: apiUser.verifiedBy,
      };
      
      console.log('AuthContext: Mapped user:', mappedUser);
      
      setUser(mappedUser);
      localStorage.setItem('authUser', JSON.stringify(mappedUser));
      localStorage.setItem('authToken', token);
      setIsLoading(false);
      return { success: true, user: mappedUser };
    } catch (error) {
      console.error('AuthContext: Login error:', error);
      setIsLoading(false);
      return { success: false, error: (error as Error).message };
    }
  };

  const adminLogin = async (email: string, password: string): Promise<{ success: boolean; user?: any; error?: string; message?: string }> => {
    try {
      console.log('AuthContext: Admin login attempt with:', { email, passwordLength: password?.length });
      setIsLoading(true);
      
      const response = await fetch(`${config.apiUrl}${config.endpoints.auth}/admin-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.log('AuthContext: Admin login error response:', errorData);
        setIsLoading(false);
        return { 
          success: false, 
          error: errorData.error || 'Admin login failed',
          message: errorData.message
        };
      }
      
      const data = await response.json();
      console.log('AuthContext: Admin login success response:', data);
      
      const apiUser = data.user;
      const token = data.token as string;
      
      if (!apiUser || !token) {
        console.error('AuthContext: Invalid response structure from admin login');
        setIsLoading(false);
        return { 
          success: false, 
          error: 'Invalid response from server',
          message: 'Server returned invalid data'
        };
      }
      
      // Map backend user data to frontend User interface
      const mappedUser: User = {
        id: apiUser.id || apiUser._id,
        name: apiUser.name,
        email: apiUser.email,
        profileImage: undefined,
        contact: apiUser.contact || apiUser.phone,
        userRole: apiUser.userRole,
        categoryType: apiUser.categoryType,
        isOrganization: apiUser.isOrganization,
        about: apiUser.about,
        profession: apiUser.profession,
        linkedIn: apiUser.linkedIn,
        instagram: apiUser.instagram,
        facebook: apiUser.facebook,
        address: apiUser.address,
        emailUpdates: apiUser.emailUpdates,
        document: apiUser.document,
        profilePhoto: apiUser.profilePhoto
      };
      
      console.log('AuthContext: Mapped admin user:', mappedUser);
      
      // Set user state and store in localStorage
      setUser(mappedUser);
      localStorage.setItem('authUser', JSON.stringify(mappedUser));
      localStorage.setItem('authToken', token);
      
      setIsLoading(false);
      return { success: true, user: mappedUser };
    } catch (error) {
      console.error('AuthContext: Admin login error:', error);
      setIsLoading(false);
      return { success: false, error: (error as Error).message };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('authUser');
    localStorage.removeItem('authToken');
    
    // Clear all cookies
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('authUser', JSON.stringify(updatedUser));
    }
  };

  const value = {
    user,
    login,
    adminLogin,
    logout,
    updateUser,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};