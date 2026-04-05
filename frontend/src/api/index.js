const BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

const getHeaders = (token) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`,
});

export const api = {
  getApplications: async (token) => {
    const res = await fetch(`${BASE_URL}/applications`, { headers: getHeaders(token) });
    return res.json();
  },
  addApplication: async (token, data) => {
    return fetch(`${BASE_URL}/applications`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(data),
    });
  },
  updateStatus: async (token, id, status) => {
    return fetch(`${BASE_URL}/applications/${id}/status`, {
      method: 'PUT',
      headers: getHeaders(token),
      body: JSON.stringify({ status }),
    });
  },
  getInterviews: async (token) => {
    const res = await fetch(`${BASE_URL}/interviews`, { headers: getHeaders(token) });
    return res.json();
  },
  saveInterview: async (token, id, data, isEdit) => {
    const method = isEdit ? 'PUT' : 'POST';
    const url = isEdit ? `${BASE_URL}/interviews/${id}` : `${BASE_URL}/interviews`;
    return fetch(url, {
      method,
      headers: getHeaders(token),
      body: JSON.stringify(data),
    });
  },
  deleteResource: async (token, type, id) => {
    const url = type === 'app' ? `${BASE_URL}/applications/${id}` : `${BASE_URL}/interviews/${id}`;
    return fetch(url, { method: 'DELETE', headers: getHeaders(token) });
  }
};