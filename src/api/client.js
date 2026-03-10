const BASE_URL = 'http://localhost:3001/api';

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

  let res = await fetch(`${BASE_URL}${path}`, fetchOptions);

  if (res.status === 401 && path !== '/auth/login' && path !== '/auth/refresh') {
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
