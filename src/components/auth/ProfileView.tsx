import React, { useState } from "react";
import { updateProfile } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { useAuthStore } from "../../store/useAuthStore";

export const ProfileView: React.FC = () => {
  const { user, logout } = useAuthStore();
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [message, setMessage] = useState("");

  const handleUpdate = async () => {
    if (auth.currentUser) {
      await updateProfile(auth.currentUser, { displayName });
      setMessage("Perfil actualizado");
    }
  };

  return (
    <div className="p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Perfil de Usuario</h2>
      <p className="mb-4">Email: {user?.email}</p>
      <input 
        value={displayName} 
        onChange={(e) => setDisplayName(e.target.value)} 
        placeholder="Nombre" 
        className="w-full p-2 border rounded mb-4" 
      />
      <button onClick={handleUpdate} className="w-full bg-blue-500 text-white p-2 rounded mb-2">Actualizar Nombre</button>
      <button onClick={logout} className="w-full bg-red-500 text-white p-2 rounded">Cerrar Sesión</button>
      {message && <p className="mt-2 text-green-500">{message}</p>}
    </div>
  );
};
