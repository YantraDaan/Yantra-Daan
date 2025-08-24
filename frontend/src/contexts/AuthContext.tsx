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
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, userRole: string) => Promise<{ success: boolean; error?: string; message?: string }>;
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

  useEffect(() => {
    // Check for stored auth on mount
    const storedUser = localStorage.getItem('authUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, userRole?: string): Promise<{ success: boolean; error?: string; message?: string }> => {
    try {
      setIsLoading(true);
      const response = await fetch(`${config.apiUrl}${config.endpoints.auth}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, userRole }),
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
      console.log("apiUser",apiUser);
      
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
        profilePhoto: apiUser.profilePhoto
      };
      setUser(mappedUser);
      localStorage.setItem('authUser', JSON.stringify(mappedUser));
      localStorage.setItem('authToken', token);
      setIsLoading(false);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return { success: false, error: (error as Error).message };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('authUser');
    localStorage.removeItem('authToken');
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