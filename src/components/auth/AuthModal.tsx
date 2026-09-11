import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Lock, 
  Mail, 
  KeyRound, 
  ArrowLeft, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  ShieldCheck
} from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { useNotificationStore } from "../../store/useNotificationStore";
import { FormInput } from "../ui/FormInput";

/* ========================================================================= */
/* 📋 STRICT VALIDATION SCHEMAS (ZOD)                                       */
/* ========================================================================= */

const authValidationSchema = z.discriminatedUnion("mode", [
  // 1. INICIAR SESIÓN
  z.object({
    mode: z.literal("login"),
    email: z
      .string()
      .trim()
      .min(1, "El correo electrónico es obligatorio.")
      .email("Por favor, ingresa un correo electrónico válido (ej: cliente@taller.com).")
      .max(100, "El correo no puede exceder los 100 caracteres."),
    password: z
      .string()
      .min(1, "La contraseña es obligatoria.")
      .min(6, "La contraseña debe contener al menos 6 caracteres.")
      .max(128, "La contraseña no puede exceder los 128 caracteres."),
    confirmPassword: z.string().optional(),
  }),

  // 2. REGISTRO DE NUEVA CUENTA
  z.object({
    mode: z.literal("register"),
    email: z
      .string()
      .trim()
      .min(1, "El correo electrónico es obligatorio.")
      .email("Por favor, ingresa un correo electrónico corporativo o personal válido.")
      .max(100, "El correo no puede exceder los 100 caracteres."),
    password: z
      .string()
      .min(1, "Debes definir una contraseña.")
      .min(6, "Por seguridad, la contraseña debe tener como mínimo 6 caracteres.")
      .max(128, "La contraseña no puede exceder los 128 caracteres."),
    confirmPassword: z
      .string()
      .min(1, "Confirma la contraseña para verificar que coincidan."),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden. Verifícalas con atención.",
    path: ["confirmPassword"],
  }),

  // 3. RECUPERACIÓN DE CONTRASEÑA
  z.object({
    mode: z.literal("forgot"),
    email: z
      .string()
      .trim()
      .min(1, "El correo electrónico es obligatorio para enviarte el enlace.")
      .email("Ingresa un correo electrónico con formato válido.")
      .max(100, "El correo no puede exceder los 100 caracteres."),
    password: z.string().optional(),
    confirmPassword: z.string().optional(),
  }),
]);

type AuthFormData = z.infer<typeof authValidationSchema>;

interface AuthModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
  defaultMode?: "login" | "register" | "forgot";
  title?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen = true,
  onClose,
  onSuccess,
  defaultMode = "login",
  title,
}) => {
  const [mode, setMode] = useState<"login" | "register" | "forgot">(defaultMode);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { login, register, signInWithGoogle, forgotPassword } = useAuthStore();
  const { addNotification } = useNotificationStore();

  const methods = useForm<AuthFormData>({
    resolver: zodResolver(authValidationSchema),
    defaultValues: {
      mode: defaultMode,
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onBlur",
  });

  const {
    handleSubmit,
    setValue,
    reset,
    formState: { isSubmitting },
  } = methods;

  // React to defaultMode prop updates
  useEffect(() => {
    if (defaultMode && defaultMode !== mode) {
      setMode(defaultMode);
      setValue("mode", defaultMode);
    }
  }, [defaultMode, setValue]);

  // Sync mode with react-hook-form state
  useEffect(() => {
    setValue("mode", mode);
    setSubmitError(null);
    setSuccessMessage(null);
  }, [mode, setValue]);

  const switchMode = (newMode: "login" | "register" | "forgot") => {
    setMode(newMode);
    setSubmitError(null);
    setSuccessMessage(null);
    reset({
      mode: newMode,
      email: methods.getValues("email") || "",
      password: "",
      confirmPassword: "",
    });
  };

  const onSubmit = async (data: AuthFormData) => {
    setSubmitError(null);
    setSuccessMessage(null);

    const cleanEmail = data.email.trim().toLowerCase();

    try {
      if (data.mode === "forgot") {
        await forgotPassword(cleanEmail);
        setSuccessMessage("¡Enlace enviado! Revisa tu bandeja de entrada o spam para restablecer tu clave.");
        addNotification({
          type: "system",
          title: "Recuperación de Contraseña",
          message: `Se ha enviado un correo de restablecimiento a ${cleanEmail}.`,
          priority: "normal",
        });
      } else if (data.mode === "register") {
        await register(cleanEmail, data.password);
        addNotification({
          type: "system",
          title: "¡Cuenta creada exitosamente!",
          message: "Bienvenido a Carteles.Click. Ya puedes guardar tus cotizaciones y seguir tus pedidos.",
          priority: "normal",
        });
        if (onSuccess) {
          onSuccess();
        } else if (onClose) {
          onClose();
        }
      } else {
        await login(cleanEmail, data.password);
        addNotification({
          type: "system",
          title: "Sesión iniciada",
          message: "Has ingresado correctamente a tu panel.",
          priority: "normal",
        });
        if (onSuccess) {
          onSuccess();
        } else if (onClose) {
          onClose();
        }
      }
    } catch (err: any) {
      const msg = err.message || "No se pudo completar la operación. Por favor intenta nuevamente.";
      setSubmitError(msg);
    }
  };

  const handleGoogleSignIn = async () => {
    setSubmitError(null);
    try {
      await signInWithGoogle();
      addNotification({
        type: "system",
        title: "Sesión iniciada con Google",
        message: "Has ingresado correctamente a tu cuenta de Carteles.Click.",
        priority: "normal",
      });
      if (onSuccess) {
        onSuccess();
      } else if (onClose) {
        onClose();
      }
    } catch (err: any) {
      const code = err?.code || "";
      if (code.includes("auth/popup-closed-by-user")) {
        return;
      }
      setSubmitError(err.message || "Error al autenticar con Google.");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          id="auth-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget && onClose) onClose();
          }}
        >
          <motion.div
            id="auth-modal-card"
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative w-full max-w-md my-8 p-6 sm:p-8 rounded-2xl liquid-glass-modal shadow-2xl text-[var(--text-primary)]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* CLOSE BUTTON */}
          {onClose && (
            <button
              id="auth-modal-close-btn"
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-[7px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)] transition-colors"
              aria-label="Cerrar modal de autenticación"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {/* HEADER ICON & TITLE */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-[7px] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              {mode === "forgot" ? (
                <KeyRound className="w-5 h-5" />
              ) : mode === "register" ? (
                <ShieldCheck className="w-5 h-5" />
              ) : (
                <Lock className="w-5 h-5" />
              )}
            </div>
            <div>
              <h2 className="font-heading text-xl font-medium tracking-tight text-[var(--text-primary)]">
                {title || (mode === "forgot"
                  ? "Recuperar Contraseña"
                  : mode === "register"
                  ? "Crear Cuenta de Taller"
                  : "Acceso a Carteles.Click")}
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                {mode === "forgot"
                  ? "Te enviaremos un correo con las instrucciones de acceso."
                  : mode === "register"
                  ? "Regístrate para guardar cotizaciones y consultar estados de producción."
                  : "Ingresa tus credenciales para acceder a tus pedidos y presupuestos."}
              </p>
            </div>
          </div>

          {/* LOCAL ERROR ALERT */}
          {submitError && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3.5 rounded-[7px] bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-start gap-2.5"
              role="alert"
            >
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{submitError}</div>
            </motion.div>
          )}

          {/* LOCAL SUCCESS ALERT */}
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3.5 rounded-[7px] bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-start gap-2.5"
              role="status"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{successMessage}</div>
            </motion.div>
          )}

          {/* AUTH FORM */}
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <FormInput
                name="email"
                label="Correo Electrónico"
                type="email"
                autoComplete="email"
                placeholder="ej: taller@carteles.click"
              />

              {mode !== "forgot" && (
                <FormInput
                  name="password"
                  label="Contraseña"
                  type="password"
                  autoComplete={mode === "register" ? "new-password" : "current-password"}
                  placeholder="••••••••"
                />
              )}

              {mode === "login" && (
                <div className="flex items-center justify-between text-xs pt-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      methods.setValue("email", "carteles.ploteos@gmail.com", { shouldValidate: true });
                      methods.setValue("password", "cartelesclick2026", { shouldValidate: true });
                    }}
                    className="text-[11px] text-primary hover:underline flex items-center gap-1.5 cursor-pointer py-1 font-medium transition-colors"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Rellenar con credenciales de Administrador</span>
                  </button>
                </div>
              )}

              {mode === "register" && (
                <FormInput
                  name="confirmPassword"
                  label="Confirmar Contraseña"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                />
              )}

              {/* ACTION BUTTON */}
              <button
                id="auth-modal-submit-btn"
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-[7px] text-sm font-medium bg-primary text-white hover:brightness-105 active:scale-[0.99] disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Procesando...</span>
                  </>
                ) : mode === "forgot" ? (
                  <>
                    <Mail className="w-4 h-4" />
                    <span>Enviar Correo de Recuperación</span>
                  </>
                ) : mode === "register" ? (
                  <span>Registrar Cuenta</span>
                ) : (
                  <span>Iniciar Sesión</span>
                )}
              </button>
            </form>
          </FormProvider>

          {/* SOCIAL LOGIN & SECONDARY CONTROLS */}
          <div className="mt-6 pt-5 border-t border-[var(--border-subtle)] space-y-4">
            {mode !== "forgot" ? (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[var(--border-subtle)]" />
                  </div>
                  <div className="relative flex justify-center text-[11px] uppercase tracking-wider text-[var(--text-secondary)]">
                    <span className="bg-[var(--bg-surface)] px-2">o continuar con</span>
                  </div>
                </div>

                <button
                  id="auth-google-btn"
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="w-full py-2.5 px-4 rounded-[7px] text-xs font-semibold border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] text-[var(--text-primary)] hover:bg-[var(--border-subtle)] transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-sm active:scale-[0.99]"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.14z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.36 7.34 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.98 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.25 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span>Continuar con Google</span>
                </button>

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => switchMode(mode === "login" ? "register" : "login")}
                    className="text-primary hover:underline font-medium cursor-pointer"
                  >
                    {mode === "login"
                      ? "¿No tienes cuenta? Regístrate aquí"
                      : "¿Ya tienes cuenta? Iniciar sesión"}
                  </button>

                  {mode === "login" && (
                    <button
                      type="button"
                      onClick={() => switchMode("forgot")}
                      className="text-[var(--text-secondary)] hover:text-primary hover:underline cursor-pointer"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  )}
                </div>
              </>
            ) : (
              <button
                type="button"
                onClick={() => switchMode("login")}
                className="w-full flex items-center justify-center gap-1.5 text-xs text-primary hover:underline font-medium py-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Volver al formulario de acceso</span>
              </button>
            )}

            {onClose && (
              <div className="pt-2 text-center border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={onClose}
                  className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>Cerrar y volver a la tienda</span>
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
      )}
    </AnimatePresence>
  );
};
