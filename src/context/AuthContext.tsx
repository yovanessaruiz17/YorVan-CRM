import React, { createContext, useContext, useState, useEffect } from "react";
import { User, UserRole, Permission } from "../types/auth";
import { MOCK_USERS } from "../data/mockData";
import { INITIAL_PERMISSIONS, DEFAULT_ROLE_PERMISSIONS } from "../data/initialConfig";

interface AuthContextType {
  currentUser: User;
  users: User[];
  rolePermissions: Record<UserRole, string[]>;
  allPermissions: Permission[];
  hasPermission: (permissionId: string) => boolean;
  switchUser: (userId: string) => void;
  updateUserRole: (userId: string, newRole: UserRole) => void;
  updateRolePermissions: (role: UserRole, permissions: string[]) => void;
  updateCurrentUserProfile: (profile: Partial<User>) => void;
  addUser: (newUser: Omit<User, "id" | "createdAt">) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem("yorvar_crm_users");
    return saved ? JSON.parse(saved) : MOCK_USERS;
  });

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    return localStorage.getItem("yorvar_crm_current_user_id") || "usr-1";
  });

  const [rolePermissions, setRolePermissions] = useState<Record<UserRole, string[]>>(() => {
    const saved = localStorage.getItem("yorvar_crm_role_permissions");
    return saved ? JSON.parse(saved) : DEFAULT_ROLE_PERMISSIONS;
  });

  useEffect(() => {
    localStorage.setItem("yorvar_crm_users", JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem("yorvar_crm_current_user_id", currentUserId);
  }, [currentUserId]);

  useEffect(() => {
    localStorage.setItem("yorvar_crm_role_permissions", JSON.stringify(rolePermissions));
  }, [rolePermissions]);

  const currentUser = users.find((u) => u.id === currentUserId) || users[0];

  const hasPermission = (permissionId: string): boolean => {
    if (currentUser.role === "super_admin") return true;

    // Check user specific overrides
    if (currentUser.customPermissions?.includes(permissionId)) return true;

    // Check role default matrix
    const allowed = rolePermissions[currentUser.role] || [];
    return allowed.includes(permissionId);
  };

  const switchUser = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (target) {
      setCurrentUserId(userId);
    }
  };

  const updateUserRole = (userId: string, newRole: UserRole) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
  };

  const updateRolePermissions = (role: UserRole, permissions: string[]) => {
    setRolePermissions((prev) => ({
      ...prev,
      [role]: permissions,
    }));
  };

  const updateCurrentUserProfile = (profile: Partial<User>) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === currentUser.id ? { ...u, ...profile } : u))
    );
  };

  const addUser = (newUser: Omit<User, "id" | "createdAt">) => {
    const user: User = {
      ...newUser,
      id: `usr-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setUsers((prev) => [...prev, user]);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        rolePermissions,
        allPermissions: INITIAL_PERMISSIONS,
        hasPermission,
        switchUser,
        updateUserRole,
        updateRolePermissions,
        updateCurrentUserProfile,
        addUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
