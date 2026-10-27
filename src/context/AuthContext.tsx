import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { User, UserRole, Permission } from "../types/auth";
import { MOCK_USERS } from "../data/mockData";
import { INITIAL_PERMISSIONS, DEFAULT_ROLE_PERMISSIONS } from "../data/initialConfig";
import {
  getSupabaseClient,
  supabaseSignIn,
  supabaseSignOut,
  supabaseResetPassword,
  fetchRemoteUserProfile,
  upsertRemoteUserProfile,
} from "../services/supabaseService";

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  isAuthenticated: boolean;
  isDemoMode: boolean;
  isSupabaseConfigured: boolean;
  rolePermissions: Record<UserRole, string[]>;
  allPermissions: Permission[];
  hasPermission: (permissionId: string) => boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginAsDemoUser: (user: User) => void;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  switchUser: (userId: string) => void;
  updateUserRole: (userId: string, newRole: UserRole) => void;
  updateRolePermissions: (role: UserRole, permissions: string[]) => void;
  updateCurrentUserProfile: (profile: Partial<User>) => void;
  addUser: (newUser: Omit<User, "id" | "createdAt">) => Promise<User>;
  updateUser: (userId: string, updates: Partial<User>) => void;
  deleteUser: (userId: string) => { success: boolean; error?: string };
  toggleUserStatus: (userId: string) => void;
  updateUserPermissions: (userId: string, permissions: string[]) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const OLD_MOCK_IDS = ["usr-2", "usr-3", "usr-4", "usr-5", "usr-6", "usr-7"];

// Utility to sanitize user objects ensuring passwords are NEVER saved in state or storage
function sanitizeUser(u: any): User {
  const { password, ...safeUser } = u;
  return {
    ...safeUser,
    organizationId: safeUser.organizationId || "",
    status: safeUser.status || "active",
    customPermissions: safeUser.customPermissions || [],
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [supabaseClient] = useState(() => getSupabaseClient());
  const isSupabaseConfigured = !!supabaseClient;

  // Safe users list without plaintext passwords
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem("yorvar_crm_users");
    if (saved) {
      try {
        const parsed: any[] = JSON.parse(saved);
        const cleaned = parsed
          .filter((u) => !OLD_MOCK_IDS.includes(u.id))
          .map(sanitizeUser);

        const hasSuperAdmin = cleaned.some((u) => u.role === "super_admin");
        if (!hasSuperAdmin) {
          return [sanitizeUser(MOCK_USERS[0]), ...cleaned];
        }
        return cleaned;
      } catch (e) {
        console.error("Error parsing stored users", e);
      }
    }
    return [sanitizeUser(MOCK_USERS[0])];
  });

  const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
    // Only restore if user was previously authenticated in a valid session
    const isAuthed = localStorage.getItem("yorvar_crm_is_authenticated") === "true";
    if (!isAuthed) return null;
    return localStorage.getItem("yorvar_crm_current_user_id");
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem("yorvar_crm_is_authenticated") === "true";
  });

  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    return !isSupabaseConfigured || localStorage.getItem("yorvar_crm_demo_mode") === "true";
  });

  const [rolePermissions, setRolePermissions] = useState<Record<UserRole, string[]>>(() => {
    const saved = localStorage.getItem("yorvar_crm_role_permissions");
    return saved ? JSON.parse(saved) : DEFAULT_ROLE_PERMISSIONS;
  });

  // Listen to remote Supabase Auth state changes if Supabase is connected
  useEffect(() => {
    if (!supabaseClient) return;

    // Verify initial session immediately on mount
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        // No valid remote session; reset any stale or tampered local auth state
        setIsAuthenticated(false);
        setCurrentUserId(null);
        localStorage.removeItem("yorvar_crm_is_authenticated");
        localStorage.removeItem("yorvar_crm_current_user_id");
      }
    });

    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setIsAuthenticated(true);
        setIsDemoMode(false);
        localStorage.setItem("yorvar_crm_is_authenticated", "true");
        localStorage.setItem("yorvar_crm_demo_mode", "false");

        // Try to fetch remote profile
        const profile = await fetchRemoteUserProfile(session.user.id);
        if (profile) {
          const userObj: User = {
            id: profile.id,
            name: profile.name || session.user.email?.split("@")[0] || "Usuario",
            lastName: profile.last_name || "",
            email: session.user.email || profile.email,
            role: (profile.role as UserRole) || "vendedor",
            jobTitle: profile.job_title || "Colaborador",
            avatar: profile.avatar || "",
            status: profile.status || "active",
            organizationId: profile.organization_id || (session.user.user_metadata?.organizationId as string) || "",
            authSource: "supabase",
            customPermissions: profile.custom_permissions || [],
            createdAt: profile.created_at || new Date().toISOString(),
          };

          setCurrentUserId(userObj.id);
          setUsers((prev) => {
            const exists = prev.find((u) => u.id === userObj.id);
            if (exists) {
              return prev.map((u) => (u.id === userObj.id ? userObj : u));
            }
            return [userObj, ...prev];
          });
        } else {
          // Fallback to auth metadata
          const meta = session.user.user_metadata || {};
          const userObj: User = {
            id: session.user.id,
            name: meta.name || session.user.email?.split("@")[0] || "Usuario",
            lastName: meta.lastName || "",
            email: session.user.email || "",
            role: (meta.role as UserRole) || "super_admin",
            jobTitle: meta.jobTitle || "Administrador",
            avatar: meta.avatar || "",
            status: "active",
            organizationId: (meta.organizationId as string) || (session.user.app_metadata?.organizationId as string) || "",
            authSource: "supabase",
            createdAt: session.user.created_at || new Date().toISOString(),
          };
          setCurrentUserId(userObj.id);
        }
      } else if (event === "SIGNED_OUT") {
        setIsAuthenticated(false);
        setCurrentUserId(null);
        localStorage.removeItem("yorvar_crm_is_authenticated");
        localStorage.removeItem("yorvar_crm_current_user_id");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabaseClient]);

  // Persist sanitized users (no passwords stored)
  useEffect(() => {
    const sanitized = users.map(sanitizeUser);
    localStorage.setItem("yorvar_crm_users", JSON.stringify(sanitized));
  }, [users]);

  useEffect(() => {
    if (currentUserId) {
      localStorage.setItem("yorvar_crm_current_user_id", currentUserId);
    } else {
      localStorage.removeItem("yorvar_crm_current_user_id");
    }
  }, [currentUserId]);

  useEffect(() => {
    localStorage.setItem("yorvar_crm_is_authenticated", isAuthenticated ? "true" : "false");
    localStorage.setItem("yorvar_crm_demo_mode", isDemoMode ? "true" : "false");
  }, [isAuthenticated, isDemoMode]);

  useEffect(() => {
    localStorage.setItem("yorvar_crm_role_permissions", JSON.stringify(rolePermissions));
  }, [rolePermissions]);

  // Determine active user safely
  const currentUser: User | null = React.useMemo(() => {
    if (!isAuthenticated) return null;
    if (currentUserId) {
      const found = users.find((u) => u.id === currentUserId);
      if (found) return found;
    }
    // If in demo mode and user list has members, fallback to first available active user
    if (isDemoMode && users.length > 0) {
      return users[0];
    }
    return null;
  }, [isAuthenticated, currentUserId, users, isDemoMode]);

  // Synchronize state and self-heal invalid sessions
  useEffect(() => {
    if (isAuthenticated) {
      if (!currentUser) {
        // Invalid or orphaned session: reset to prevent infinite crash loop
        setIsAuthenticated(false);
        setCurrentUserId(null);
        localStorage.removeItem("yorvar_crm_is_authenticated");
        localStorage.removeItem("yorvar_crm_current_user_id");
      } else if (currentUserId !== currentUser.id) {
        setCurrentUserId(currentUser.id);
      }
    }
  }, [isAuthenticated, currentUser, currentUserId]);

  const hasPermission = useCallback(
    (permissionId: string): boolean => {
      if (!isAuthenticated || !currentUser) return false;
      if (currentUser.status === "inactive") return false;

      // Super admin has unrestricted permission
      if (currentUser.role === "super_admin") return true;

      // Check custom overrides
      if (currentUser.customPermissions && Array.isArray(currentUser.customPermissions)) {
        if (currentUser.customPermissions.includes(permissionId)) return true;
      }

      // Default permissions corresponding to role
      const allowed = rolePermissions[currentUser.role] || DEFAULT_ROLE_PERMISSIONS[currentUser.role] || [];
      return allowed.includes(permissionId);
    },
    [isAuthenticated, currentUser, rolePermissions]
  );

  // Authentication Flow
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      return { success: false, error: "Ingresa un correo electrónico válido." };
    }
    if (!password) {
      return { success: false, error: "Ingresa tu contraseña." };
    }

    // 1. If Supabase is configured, authenticate securely against Supabase Auth
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabaseSignIn(cleanEmail, password);
        if (error) {
          return { success: false, error: error.message || "Error al autenticar con Supabase." };
        }
        if (data?.session) {
          setIsAuthenticated(true);
          setIsDemoMode(false);
          return { success: true };
        }
      } catch (err: any) {
        return { success: false, error: err.message || "Error de red al conectar con el servidor de autenticación." };
      }
    }

    // 2. Fallback / Sandbox Demo Mode (Explicit local demonstration)
    const targetUser = users.find((u) => {
      const uEmail = u.email.toLowerCase();
      if (uEmail === cleanEmail) return true;
      if (
        u.role === "super_admin" &&
        (cleanEmail === "admin@yorvar.com" ||
          cleanEmail === "admin@yorvar.co" ||
          cleanEmail === "yorleidys.navarro@yorvar.co")
      ) {
        return true;
      }
      return false;
    });

    if (!targetUser) {
      return {
        success: false,
        error: "No existe ningún usuario registrado con este correo electrónico en el CRM.",
      };
    }

    if (targetUser.status === "inactive") {
      return {
        success: false,
        error: "Esta cuenta de usuario se encuentra inactiva. Contacta al Super Administrador.",
      };
    }

    // Security Notice: Local sandbox validation without hardcoded plaintext bypass
    // Require minimum password complexity in demo mode
    if (password.length < 6) {
      return {
        success: false,
        error: "La contraseña debe contener al menos 6 caracteres.",
      };
    }

    setCurrentUserId(targetUser.id);
    setIsAuthenticated(true);
    setIsDemoMode(true);
    return { success: true };
  };

  // Explicit demo switch for testing roles in sandbox environment
  const loginAsDemoUser = (user: User) => {
    if (isSupabaseConfigured) {
      console.warn("Inicio de sesión de demostración deshabilitado cuando Supabase está activo.");
      return;
    }
    setCurrentUserId(user.id);
    setIsAuthenticated(true);
    setIsDemoMode(true);
  };

  const logout = async () => {
    if (isSupabaseConfigured) {
      try {
        await supabaseSignOut();
      } catch (e) {
        console.warn("Supabase sign out warning:", e);
      }
    }
    setIsAuthenticated(false);
    setCurrentUserId(null);
    localStorage.removeItem("yorvar_crm_is_authenticated");
    localStorage.removeItem("yorvar_crm_current_user_id");
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    if (!email.trim()) {
      return { success: false, error: "Ingresa un correo electrónico para recuperar tu acceso." };
    }
    if (isSupabaseConfigured) {
      const { error } = await supabaseResetPassword(email);
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    }
    return {
      success: true,
      error: "En modo sandbox local, la recuperación requiere configurar el servidor de correo o Supabase Auth.",
    };
  };

  const switchUser = (userId: string) => {
    if (isSupabaseConfigured) {
      console.warn("El cambio manual de usuario está deshabilitado en modo producción con Supabase.");
      return;
    }
    const target = users.find((u) => u.id === userId);
    if (target) {
      setCurrentUserId(userId);
      setIsAuthenticated(true);
    }
  };

  const updateUserRole = (userId: string, newRole: UserRole) => {
    if (currentUser?.role !== "super_admin") {
      console.warn("Acceso denegado: solo Super Administradores pueden cambiar roles.");
      return;
    }
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          return {
            ...u,
            role: newRole,
            customPermissions: DEFAULT_ROLE_PERMISSIONS[newRole] || [],
          };
        }
        return u;
      })
    );
  };

  const updateRolePermissions = (role: UserRole, permissions: string[]) => {
    if (currentUser?.role !== "super_admin") {
      console.warn("Acceso denegado: solo Super Administradores pueden modificar la matriz de permisos.");
      return;
    }
    setRolePermissions((prev) => ({
      ...prev,
      [role]: permissions,
    }));
  };

  const updateCurrentUserProfile = (profile: Partial<User>) => {
    if (!currentUser) return;
    // Disallow self-escalation of role or organizationId through client profile update
    const { role, organizationId, customPermissions, ...safeProfile } = profile as any;
    setUsers((prev) =>
      prev.map((u) => (u.id === currentUser.id ? { ...u, ...safeProfile } : u))
    );
    if (isSupabaseConfigured && currentUser.id) {
      upsertRemoteUserProfile({
        ...currentUser,
        ...safeProfile,
      } as any);
    }
  };

  const addUser = async (newUser: Omit<User, "id" | "createdAt">): Promise<User> => {
    if (currentUser && currentUser.role !== "super_admin") {
      throw new Error("Acceso denegado: solo Super Administradores pueden crear empleados.");
    }

    if (!currentUser?.organizationId) {
      throw new Error("Acceso denegado: La sesión del usuario no tiene una organización asignada.");
    }

    const defaultPerms = DEFAULT_ROLE_PERMISSIONS[newUser.role] || [];
    const generatedId = `usr-${Date.now()}`;
    const user: User = sanitizeUser({
      ...newUser,
      id: generatedId,
      organizationId: currentUser.organizationId,
      authSource: isSupabaseConfigured ? "supabase" : "demo",
      customPermissions:
        newUser.customPermissions && newUser.customPermissions.length > 0
          ? newUser.customPermissions
          : defaultPerms,
      createdAt: new Date().toISOString(),
      dealsWonCount: 0,
      revenueGenerated: 0,
    });

    setUsers((prev) => [...prev, user]);

    // If Supabase is active, sync remote profile
    if (isSupabaseConfigured) {
      await upsertRemoteUserProfile({
        id: user.id,
        email: user.email,
        name: user.name,
        lastName: user.lastName,
        role: user.role,
        jobTitle: user.jobTitle,
        organizationId: user.organizationId,
        avatar: user.avatar,
        customPermissions: user.customPermissions,
      });
    }

    return user;
  };

  const updateUser = (userId: string, updates: Partial<User>) => {
    if (currentUser?.role !== "super_admin" && currentUser?.id !== userId) {
      console.warn("Acceso denegado para modificar este usuario.");
      return;
    }
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? sanitizeUser({ ...u, ...updates }) : u))
    );
  };

  const deleteUser = (userId: string): { success: boolean; error?: string } => {
    if (currentUser?.role !== "super_admin") {
      return { success: false, error: "Acceso denegado: solo Super Administradores pueden eliminar empleados." };
    }
    const target = users.find((u) => u.id === userId);
    if (!target) {
      return { success: false, error: "Usuario no encontrado" };
    }
    if (target.role === "super_admin") {
      return { success: false, error: "No es posible eliminar la cuenta principal de Super Administrador." };
    }

    setUsers((prev) => prev.filter((u) => u.id !== userId));

    if (currentUserId === userId) {
      logout();
    }

    return { success: true };
  };

  const toggleUserStatus = (userId: string) => {
    if (currentUser?.role !== "super_admin") {
      console.warn("Acceso denegado: solo Super Administradores pueden cambiar el estado de empleados.");
      return;
    }
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          if (u.role === "super_admin") return u; // Super Admin cannot be deactivated
          return {
            ...u,
            status: u.status === "active" ? "inactive" : "active",
          };
        }
        return u;
      })
    );
  };

  const updateUserPermissions = (userId: string, permissions: string[]) => {
    if (currentUser?.role !== "super_admin") {
      console.warn("Acceso denegado: solo Super Administradores pueden actualizar permisos específicos.");
      return;
    }
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, customPermissions: permissions } : u))
    );
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        isAuthenticated,
        isDemoMode,
        isSupabaseConfigured,
        rolePermissions,
        allPermissions: INITIAL_PERMISSIONS,
        hasPermission,
        login,
        loginAsDemoUser,
        logout,
        resetPassword,
        switchUser,
        updateUserRole,
        updateRolePermissions,
        updateCurrentUserProfile,
        addUser,
        updateUser,
        deleteUser,
        toggleUserStatus,
        updateUserPermissions,
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
