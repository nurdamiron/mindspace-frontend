// createContext, useContext, useState, useEffect — React контекст және хуктар
import { createContext, useContext, useState, useEffect } from 'react';
// api — серверге HTTP сұраныстар жіберу үшін
import { api } from '../api/client';

// AuthContext — аутентификация деректерін бүкіл қосымшаға жеткізетін контекст
const AuthContext = createContext(null);

// AuthProvider — пайдаланушы күйін басқаратын провайдер компоненті
export function AuthProvider({ children }) {
  // user — ағымдағы кірген пайдаланушы деректері
  const [user, setUser] = useState(null);
  // loading — бастапқы аутентификация тексерісінің жүктелу күйі
  const [loading, setLoading] = useState(true);

  // Қосымша жүктелгенде пайдаланушы сессиясын тексеру
  useEffect(() => {
    api.get('/auth/me')
      .then(setUser)
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false));
  }, []);

  // login — email мен құпиясөз арқылы кіру функциясы
  async function login(email, password) {
    const data = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    setUser(data.user);
    return data.user;
  }

  // logout — жүйеден шығу және токенді тазалау функциясы
  async function logout() {
    await api.post('/auth/logout').catch(() => {});
    localStorage.removeItem('token');
    setUser(null);
  }

  // Контекст мәнін балалар компоненттерге беру
  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// useAuth — AuthContext мәнін компоненттерден оңай алуға арналған хук
export function useAuth() {
  return useContext(AuthContext);
}
