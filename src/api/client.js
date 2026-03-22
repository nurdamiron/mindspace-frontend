// В продакшене: если VITE_API_URL не задан — используем тот же домен (proxy на Vercel)
const getBaseUrl = () => {
  const env = import.meta.env.VITE_API_URL;
  if (env && env !== 'http://localhost:3001/api') return env.replace(/\/$/, '');
  if (import.meta.env.PROD && typeof window !== 'undefined') {
    return `${window.location.origin}/api`;
  }
  return 'http://localhost:3001/api';
};
const BASE_URL = getBaseUrl();

function getToken() {
  return localStorage.getItem('token');
}

function setToken(token) {
  localStorage.setItem('token', token);
}

async function request(path, options = {}) {
  const token = getToken();
  const fetchOptions = {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  };

  const url = `${BASE_URL}${path.startsWith('/') ? path : '/' + path}`;
  let res = await fetch(url, fetchOptions);

  if (res.status === 401 && path !== '/auth/login' && path !== '/auth/refresh' && path !== '/auth/me') {
    try {
      const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include'
      });
      
      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        setToken(refreshData.token);
        fetchOptions.headers.Authorization = `Bearer ${refreshData.token}`;
        res = await fetch(`${BASE_URL}${path}`, fetchOptions);
      } else {
        localStorage.removeItem('token');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'; 
        }
        throw new Error('Session expired');
      }
    } catch (e) {
      localStorage.removeItem('token');
      throw e;
    }
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Ошибка запроса');
  return data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body }),
  patch: (path, body) => request(path, { method: 'PATCH', body }),
  delete: (path) => request(path, { method: 'DELETE' }),
};
