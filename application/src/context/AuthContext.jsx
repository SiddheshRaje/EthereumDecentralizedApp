import React, { createContext, useContext, useState } from "react";

export const AuthContext = createContext();

const USERS_KEY = "cognitensor_users";
const SESSION_KEY = "cognitensor_current_user";

const loadUsers = () => {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  } catch (error) {
    return [];
  }
};

const saveUsers = (users) => localStorage.setItem(USERS_KEY, JSON.stringify(users));

const loadSession = () => {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY));
  } catch (error) {
    return null;
  }
};

const bytesToHex = (bytes) => Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");

const generateSalt = () => bytesToHex(crypto.getRandomValues(new Uint8Array(16)));

const hashPassword = async (password, salt) => {
  const data = new TextEncoder().encode(salt + password);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return bytesToHex(new Uint8Array(digest));
};

const toSession = (user) => ({ id: user.id, name: user.name, email: user.email });

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(loadSession);

  const signup = async ({ name, email, password }) => {
    const normalizedEmail = email.trim().toLowerCase();
    const users = loadUsers();

    if (users.some((user) => user.email === normalizedEmail)) {
      throw new Error("An account with this email already exists.");
    }

    const salt = generateSalt();
    const passwordHash = await hashPassword(password, salt);
    const newUser = { id: Date.now().toString(), name: name.trim(), email: normalizedEmail, salt, passwordHash };

    saveUsers([...users, newUser]);

    const session = toSession(newUser);
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setCurrentUser(session);

    return session;
  };

  const login = async ({ email, password }) => {
    const normalizedEmail = email.trim().toLowerCase();
    const user = loadUsers().find((u) => u.email === normalizedEmail);

    if (!user) throw new Error("No account found with this email.");

    const passwordHash = await hashPassword(password, user.salt);
    if (passwordHash !== user.passwordHash) throw new Error("Incorrect password.");

    const session = toSession(user);
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setCurrentUser(session);

    return session;
  };

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
