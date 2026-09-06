import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShieldAlert, Loader2, ArrowLeft } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { AuthModal } from "./AuthModal";

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  adminOnly = false 
}) => {
  const { user, loading, isAdmin } = useAuthStore();

  return (
    <AnimatePresence mode="wait">
      {/* 1. ESTADO DE CARGA */}
      {loading && (
        <motion.div
          key="auth-loading-state"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center"
        >
          <div className="p-8 rounded-[7px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] max-w-sm w-full flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-[var(--text-primary)]">
                Verificando credenciales...
              </p>
              <p className="text-xs text-[var(--text-secondary)]">
                Validando permisos de sesión y rol de usuario en el taller.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* 2. USUARIO NO AUTENTICADO: RENDERIZA MODAL DE ACCESO */}
      {!loading && !user && (
        <motion.div
          key="auth-required-state"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="min-h-[70vh] flex flex-col items-center justify-center p-6"
        >
          <div className="text-center max-w-md p-8 rounded-[7px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-4">
            <div className="w-12 h-12 rounded-[7px] bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h2 className="font-heading text-xl font-medium text-[var(--text-primary)]">
              Acceso Restringido
            </h2>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Esta sección requiere iniciar sesión en tu cuenta para acceder a la cola de pedidos o funciones del taller.
            </p>
          </div>
          <AuthModal isOpen={true} />
        </motion.div>
      )}

      {/* 3. REQUERIMIENTO DE ADMINISTRADOR NO CUMPLIDO */}
      {!loading && user && adminOnly && !isAdmin && (
        <motion.div
          key="admin-denied-state"
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: -10 }}
          transition={{ duration: 0.25 }}
          className="min-h-[70vh] flex flex-col items-center justify-center p-6"
        >
          <div className="p-8 sm:p-10 rounded-[7px] bg-[var(--bg-surface)] border border-red-800/40 max-w-md w-full text-center space-y-4 shadow-xl">
            <div className="w-14 h-14 rounded-[7px] bg-red-950/40 border border-red-800 text-red-400 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <h2 className="font-heading text-xl font-medium text-[var(--text-primary)]">
              Permiso de Administrador Requerido
            </h2>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              La cuenta <strong>{user.email}</strong> no cuenta con privilegios administrativos (Custom Claim <code className="px-1 py-0.5 bg-[var(--bg-surface-subtle)] rounded text-[11px]">admin: true</code>) para acceder al panel de producción y catálogo.
            </p>
            <div className="pt-2">
              <button
                onClick={() => window.location.reload()}
                className="w-full py-2.5 px-4 rounded-[7px] text-xs font-medium bg-[var(--bg-surface-subtle)] hover:bg-[var(--border-subtle)] border border-[var(--border-subtle)] text-[var(--text-primary)] transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Reintentar o Volver</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* 4. CONTENIDO PRIVADO AUTORIZADO CON ANIMACIÓN DE ENTRADA */}
      {!loading && user && (!adminOnly || isAdmin) && (
        <motion.div
          key="protected-content"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="w-full"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
