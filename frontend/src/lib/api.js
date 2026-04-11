const BASE_URL = (import.meta.env.VITE_API_URL || 'https://nlcfhub-65e7c825bac4.herokuapp.com').replace(/\/$/, '');

/** Helper for authenticated requests */
const authHeaders = () => {
  const token = window.localStorage.getItem('hub_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const api = {
  // ── Auth ──────────────────────────────────────────────────────────────
  async register(data) {
    const res = await fetch(`${BASE_URL}/api/v1/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone_number: data.phone,
        birth_day: parseInt(data.day),
        birth_month: parseInt(data.month),
        status: data.status,
        title: data.title || null,
        subgroup_ids: data.subgroupIds || [],
        post_ids: data.postIds || [],
        password: data.password
      })
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.detail || json.message || 'Registration failed');
    return json;
  },

  async verifyOtp({ uid, otp, otp_type }) {
    const res = await fetch(`${BASE_URL}/api/v1/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid, otp, otp_type })
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.detail || json.message || 'Verification failed');
    return json;
  },

  async resendOtp({ email, otp_type }) {
    const res = await fetch(`${BASE_URL}/api/v1/auth/resend-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp_type })
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.detail || json.message || 'Failed to resend OTP');
    return json;
  },

  async login(email, password) {
    const res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.detail || json.message || 'Invalid credentials');
    
    return {
      success: true,
      uid: json.data.uid,
      token: json.data.access_token,
      account_approved: json.data.account_approved,
      first_name: json.data.first_name,
      last_name: json.data.last_name,
    };
  },

  async adminLogin(email, password) {
    const res = await fetch(`${BASE_URL}/api/v1/auth/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.detail || json.message || 'Invalid admin credentials');
    
    return {
      success: true,
      uid: json.data.uid,
      token: json.data.access_token,
      role: 'admin'
    };
  },

  async getMe() {
    const res = await fetch(`${BASE_URL}/api/v1/auth/me`, {
      method: 'GET',
      credentials: 'include',
      headers: { ...authHeaders() },
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.detail || json.message || 'Failed to fetch profile');
    return json.data;
  },

  // ── Meta (public) ────────────────────────────────────────────────────
  async getSubgroups() {
    const res = await fetch(`${BASE_URL}/api/v1/meta/subgroups`);
    if (!res.ok) throw new Error("Failed to fetch subgroups");
    return res.json();
  },

  async getPosts() {
    const res = await fetch(`${BASE_URL}/api/v1/meta/posts`);
    if (!res.ok) throw new Error("Failed to fetch posts");
    return res.json();
  },

  // ── Member self-service ──────────────────────────────────────────────
  async updateProfile(id, data) {
    const res = await fetch(`${BASE_URL}/api/v1/members/${id}/update-details`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      credentials: 'include',
      body: JSON.stringify({
        first_name: data.firstName,
        last_name: data.lastName,
        phone_number: data.phone,
        birth_day: parseInt(data.birthDay),
        birth_month: parseInt(data.birthMonth),
        title: data.title || null,
        status: data.member_type
      })
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.detail || json.message || 'Update failed');
    return json.data;
  },

  async uploadProfilePicture(id, file) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${BASE_URL}/api/v1/members/${id}/upload-profile-picture`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { ...authHeaders() },
      body: formData
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.detail || json.message || 'Profile upload failed');
    return json.data;
  },

  async uploadBirthdayPicture(id, file) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${BASE_URL}/api/v1/members/${id}/upload-birthday-picture`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { ...authHeaders() },
      body: formData
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.detail || json.message || 'Birthday upload failed');
    return json.data;
  },

  // ── Admin: Member Management (LIVE) ──────────────────────────────────
  async getPendingMembers() {
    const res = await fetch(`${BASE_URL}/api/v1/admin/members/pending`, {
      credentials: 'include',
      headers: { ...authHeaders() },
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.detail || json.message || 'Failed to fetch pending members');
    return json.data;
  },

  async getApprovedMembers({ status, birth_month } = {}) {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (birth_month) params.set('birth_month', birth_month);
    const qs = params.toString() ? `?${params.toString()}` : '';

    const res = await fetch(`${BASE_URL}/api/v1/admin/members/approved${qs}`, {
      credentials: 'include',
      headers: { ...authHeaders() },
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.detail || json.message || 'Failed to fetch members');
    return json.data;
  },

  async getMemberDetails(uid) {
    const res = await fetch(`${BASE_URL}/api/v1/admin/members/${uid}`, {
      credentials: 'include',
      headers: { ...authHeaders() },
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.detail || json.message || 'Failed to fetch member details');
    return json.data;
  },

  async approveMember(uid) {
    const res = await fetch(`${BASE_URL}/api/v1/admin/members/${uid}/approve`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { ...authHeaders() },
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.detail || json.message || 'Failed to approve member');
    return json;
  },

  async rejectMember(uid) {
    const res = await fetch(`${BASE_URL}/api/v1/admin/members/${uid}/reject`, {
      method: 'DELETE',
      credentials: 'include',
      headers: { ...authHeaders() },
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.detail || json.message || 'Failed to reject member');
    return json;
  },

  async deleteMember(uid) {
    const res = await fetch(`${BASE_URL}/api/v1/admin/members/${uid}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: { ...authHeaders() },
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.detail || json.message || 'Failed to delete member');
    return json;
  },

  async editMember(uid, data) {
    const res = await fetch(`${BASE_URL}/api/v1/admin/members/${uid}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.detail || json.message || 'Failed to update member');
    return json.data;
  },

  // ── Admin: Dashboard & Notifications (NOT YET IMPLEMENTED — stubs) ──
  // These return empty states until backend routes are built

  async getStats() {
    const res = await fetch(`${BASE_URL}/api/v1/admin/stats`, {
      credentials: 'include',
      headers: { ...authHeaders() },
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.detail || json.message || 'Failed to fetch stats');
    return json.data;
  },

  async getLogs() {
    // TODO: Wire to backend when notification log endpoint is built
    return [];
  },
};
