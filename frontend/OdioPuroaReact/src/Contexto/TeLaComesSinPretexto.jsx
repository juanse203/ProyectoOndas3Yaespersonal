import { createContext, useContext, useEffect, useState } from "react"
import { signInWithEmailAndPassword, signOut } from "firebase/auth"
import { auth } from '../firebase/firebase'

const TeLaComesSinPretexto = createContext();

export const useAuth = () => useContext(TeLaComesSinPretexto);

export const AuthProvider = ({ children }) => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedUser = localStorage.getItem("usuario");
        if (savedUser) {
            setUserData(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const res = await fetch("http://localhost:5000/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || "Error al iniciar sesión");
            }

            const data = await res.json();
            setUserData(data.user); // data.user viene del backend
            localStorage.setItem("usuario", JSON.stringify(data.user));
        } catch (err) {
            console.error("Error al iniciar sesión:", err);
            throw err;
        }
    };

    const logout = () => {
        setUserData(null);
        localStorage.removeItem("usuario");
    };

    return (
        <TeLaComesSinPretexto.Provider value={{ userData, setUserData, login, logout }}>
            {!loading && children}
        </TeLaComesSinPretexto.Provider>
    )
}