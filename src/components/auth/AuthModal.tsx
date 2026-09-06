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
  defaultMode?: "login" | "register" | "forgot";
  title?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen = true,
  onClose,
  defaultMode = "login",
  title,
}) => {
  const [mode, setMode] = useState<"login" | "register" | "forgot">(defaultMode);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { login, register, signInWithGoogle, signInWithGithub, forgotPassword } = useAuthStore();
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

    try {
      if (data.mode === "forgot") {
        await forgotPassword(data.email);
        setSuccessMessage("¡Enlace enviado! Revisa tu bandeja de entrada o spam para restablecer tu clave.");
        addNotification({
          type: "system",
          title: "Recuperación de Contraseña",
          message: `Se ha enviado un correo de restablecimiento a ${data.email}.`,
          priority: "normal",
        });
      } else if (data.mode === "register") {
        await register(data.email, data.password);
        addNotification({
          type: "system",
          title: "¡Cuenta creada exitosamente!",
          message: "Bienvenido a Carteles.Click. Ya puedes guardar tus cotizaciones y seguir tus pedidos.",
          priority: "normal",
        });
        if (onClose) onClose();
      } else {
        await login(data.email, data.password);
        addNotification({
          type: "system",
          title: "Sesión iniciada",
          message: "Has ingresado correctamente a tu panel.",
          priority: "normal",
        });
        if (onClose) onClose();
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
      if (onClose) onClose();
    } catch (err: any) {
      setSubmitError(err.message || "Error al autenticar con Google.");
    }
  };

  const handleGithubSignIn = async () => {
    setSubmitError(null);
    try {
      await signInWithGithub();
      addNotification({
        type: "system",
        title: "Sesión iniciada con GitHub",
        message: "Has ingresado correctamente.",
        priority: "normal",
      });
      if (onClose) onClose();
    } catch (err: any) {
      setSubmitError(err.message || "Error al autenticar con GitHub.");
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
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
          className="relative w-full max-w-md my-8 p-6 sm:p-8 rounded-[7px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-2xl text-[var(--text-primary)]"
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
              className="mb-4 p-3.5 rounded-[7px] bg-red-950/40 border border-red-800 text-red-300 text-xs flex items-start gap-2.5"
              role="alert"
            >
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{submitError}</div>
            </motion.div>
          )}

          {/* LOCAL SUCCESS ALERT */}
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3.5 rounded-[7px] bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs flex items-start gap-2.5"
              role="status"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
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
                placeholder="ej: taller@carteles.click"
              />

              {mode !== "forgot" && (
                <FormInput
                  name="password"
                  label="Contraseña"
                  type="password"
                  placeholder="••••••••"
                />
              )}

              {mode === "register" && (
                <FormInput
                  name="confirmPassword"
                  label="Confirmar Contraseña"
                  type="password"
                  placeholder="••••••••"
                />
              )}

              {/* ACTION BUTTON */}
              <button
                id="auth-modal-submit-btn"
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-[7px] text-sm font-medium bg-primary text-white hover:brightness-105 active:scale-[0.99] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
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
          <div className="mt-6 pt-5 border-t border-[var(--border-subtle)] space-y-3">
            {mode !== "forgot" ? (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    id="auth-google-btn"
                    type="button"
                    onClick={handleGoogleSignIn}
                    className="w-full py-2 px-3 rounded-[7px] text-xs font-medium border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] text-[var(--text-primary)] hover:bg-[var(--border-subtle)] transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                    <span>Google</span>
                  </button>

                  <button
                    id="auth-github-btn"
                    type="button"
                    onClick={handleGithubSignIn}
                    className="w-full py-2 px-3 rounded-[7px] text-xs font-medium border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] text-[var(--text-primary)] hover:bg-[var(--border-subtle)] transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                    <span>GitHub</span>
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => switchMode(mode === "login" ? "register" : "login")}
                    className="text-primary hover:underline font-medium"
                  >
                    {mode === "login"
                      ? "¿No tienes cuenta? Regístrate aquí"
                      : "¿Ya tienes cuenta? Iniciar sesión"}
                  </button>

                  {mode === "login" && (
                    <button
                      type="button"
                      onClick={() => switchMode("forgot")}
                      className="text-[var(--text-secondary)] hover:text-primary hover:underline"
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
                className="w-full flex items-center justify-center gap-1.5 text-xs text-primary hover:underline font-medium py-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Volver al formulario de acceso</span>
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
