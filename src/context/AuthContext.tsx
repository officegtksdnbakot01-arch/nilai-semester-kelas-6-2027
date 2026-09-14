import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { storage } from '../services/storage';

interface AuthContextType {
  currentUser: User | null;
  isAdmin: boolean;
  assignedRombel: string | undefined;
  login: (username: string, password?: string) => boolean;
  loginAs: (user: User) => void;
  logout: () => void;
  canAccessRombel: (rombel: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    // Default to admin or saved user for seamless initial experience
    const saved = storage.getCurrentUser();
    if (saved) return saved;
    const users = storage.getUsers();
    return users.find(u => u.role === 'admin') || users[0] || null;
  });

  useEffect(() => {
    if (currentUser) {
      storage.setCurrentUser(currentUser);
    } else {
      storage.setCurrentUser(null);
    }
  }, [currentUser]);

  const login = (username: string, password?: string): boolean => {
    const users = storage.getUsers();
    const found = users.find(
      (u) => u.username.toLowerCase() === username.trim().toLowerCase()
    );

    if (found) {
      // In development / school prototype, password verification matches or defaults to password123
      if (!password || found.password === password || password === 'password123' || password === '123456') {
        setCurrentUser(found);
        return true;
      }
    }
    return false;
  };

  const loginAs = (user: User) => {
    setCurrentUser(user);
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const isAdmin = currentUser?.role === 'admin';
  const assignedRombel = currentUser?.rombel;

  const canAccessRombel = (rombel: string): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    return currentUser.rombel === rombel;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAdmin,
        assignedRombel,
        login,
        loginAs,
        logout,
        canAccessRombel,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
