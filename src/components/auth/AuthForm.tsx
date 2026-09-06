import React, { useState } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { useAuthStore } from "../../store/useAuthStore";

export const AuthForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState("");
  const login = useAuthStore((state) => state.loginAsClient); // This will need updating

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      // Handle success (e.g., redirect or update store)
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded shadow">
      <h2 className="text-xl font-bold mb-4">{isRegister ? "Registro" : "Login"}</h2>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="block w-full mb-2 p-2 border" required />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="block w-full mb-2 p-2 border" required />
      <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">{isRegister ? "Registrarse" : "Entrar"}</button>
      <button type="button" onClick={() => setIsRegister(!isRegister)} className="w-full mt-2 text-sm text-blue-500">{isRegister ? "¿Ya tienes cuenta? Login" : "¿No tienes cuenta? Registro"}</button>
    </form>
  );
};
