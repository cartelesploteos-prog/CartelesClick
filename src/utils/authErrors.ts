/**
 * Firebase Auth Error Mapper for Carteles.Click
 * Translates Firebase error codes into clear, accessible, and user-friendly messages.
 */

export function getFirebaseAuthErrorMessage(error: any): string {
  if (!error) return "Ocurrió un error inesperado al procesar la autenticación.";

  const code = typeof error === "string" 
    ? error 
    : error.code || error.message || "";

  if (code.includes("auth/invalid-credential")) {
    return "El correo electrónico o la contraseña ingresados son incorrectos. Por favor, verifica tus datos.";
  }
  if (code.includes("auth/user-not-found")) {
    return "No encontramos ninguna cuenta registrada con este correo electrónico. ¿Deseas registrarte?";
  }
  if (code.includes("auth/wrong-password")) {
    return "La contraseña ingresada es incorrecta. Si la olvidaste, utiliza la opción de recuperación.";
  }
  if (code.includes("auth/email-already-in-use")) {
    return "Ya existe una cuenta registrada con este correo. Puedes iniciar sesión o recuperar tu contraseña.";
  }
  if (code.includes("auth/weak-password")) {
    return "La contraseña debe tener al menos 6 caracteres y una combinación segura.";
  }
  if (code.includes("auth/invalid-email")) {
    return "El formato del correo electrónico no es válido. Verifica que no tenga espacios ni errores tipográficos.";
  }
  if (code.includes("auth/user-disabled")) {
    return "Esta cuenta ha sido suspendida o deshabilitada. Por favor contáctanos para más información.";
  }
  if (code.includes("auth/too-many-requests")) {
    return "Demasiados intentos fallidos. Por seguridad, el acceso se ha bloqueado temporalmente. Intenta en unos minutos o restablece tu clave.";
  }
  if (code.includes("auth/popup-closed-by-user")) {
    return "El inicio de sesión fue cancelado porque se cerró la ventana emergente.";
  }
  if (code.includes("auth/popup-blocked")) {
    return "Tu navegador bloqueó la ventana emergente de inicio de sesión. Por favor, permite popups para este sitio.";
  }
  if (code.includes("auth/network-request-failed")) {
    return "Error de conexión de red. Comprueba tu conexión a Internet y vuelve a intentarlo.";
  }
  if (code.includes("auth/account-exists-with-different-credential")) {
    return "Ya existe una cuenta asociada a este correo mediante otro método de acceso (ej. Google o correo).";
  }
  if (code.includes("auth/operation-not-allowed")) {
    return "Este método de autenticación no está habilitado actualmente en el servidor.";
  }
  if (code.includes("auth/unauthorized-domain")) {
    return "El dominio actual no está autorizado en la consola de Firebase Authentication.";
  }

  // If there's an error message that is already human-readable
  if (error.message && !error.message.startsWith("Firebase:") && !error.message.includes("auth/")) {
    return error.message;
  }

  return "No se pudo completar la autenticación. Por favor, intenta de nuevo en unos momentos.";
}
