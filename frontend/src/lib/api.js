const BASE_URL = import.meta.env.DEV
  ? ''
  : (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

function clearClientAuth() {
  // Cookies are cleared server-side via response.delete_cookie() in the logout route.
}

function redirectToAuth(scope = 'member', message = '') {
  const lowerMessage = (message || '').toLowerCase();
  const target = scope === 'admin'
    ? '/console-7x/login'
    : lowerMessage.includes('pending approval')
      ? '/pending'
      : '/login';

  if (window.location.pathname !== target) {
    window.location.assign(target);
  }
}

async function requestJson(path, {
  method = 'GET',
  headers = {},
  body,
  credentials = 'include',
  scope = 'member',
  redirectOnAuthFail = true,
} = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body,
    credentials,
  });

  let json = {};
  try {
    json = await res.json();
  } catch {
    json = {};
  }

  if ((res.status === 401 || res.status === 403) && redirectOnAuthFail) {
    const message = json?.message || json?.detail || 'Unauthorized';
    clearClientAuth();
    redirectToAuth(scope, message);
    throw new Error(message);
  }

  return { res, json };
}

export const api = {
  async register(data) {
    const { res, json } = await requestJson('/api/v1/auth/signup', {
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
        password: data.password,
        confirm_password: data.confirmPassword
      }),
      redirectOnAuthFail: false,
    });

    if (!res.ok || !json.success) throw new Error(json.detail || json.message || 'Registration failed');
    return json;
  },

  async verifyOtp({ uid, otp, otp_type }) {
    const { res, json } = await requestJson('/api/v1/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid, otp, otp_type }),
      redirectOnAuthFail: false,
    });

    if (!res.ok || !json.success) throw new Error(json.detail || json.message || 'Verification failed');
    return json;
  },

  async resendOtp({ email, otp_type }) {
    const { res, json } = await requestJson('/api/v1/auth/resend-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp_type }),
      redirectOnAuthFail: false,
    });

    if (!res.ok || !json.success) throw new Error(json.detail || json.message || 'Failed to resend OTP');
    return json;
  },

  async forgotPassword(email) {
    const { res, json } = await requestJson('/api/v1/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
      redirectOnAuthFail: false,
    });

    if (!res.ok || !json.success) throw new Error(json.detail || json.message || 'Failed to request reset code');
    return json;
  },

  async resetPassword({ reset_token, new_password }) {
    const { res, json } = await requestJson('/api/v1/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reset_token, new_password }),
      redirectOnAuthFail: false,
    });

    if (!res.ok || !json.success) throw new Error(json.detail || json.message || 'Password reset failed');
    return json;
  },

  async login(email, password) {
    const { res, json } = await requestJson('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      redirectOnAuthFail: false,
    });

    if (!res.ok || !json.success) throw new Error(json.detail || json.message || 'Invalid credentials');

    return {
      success: true,
      uid: json.data.uid,
      account_approved: json.data.account_approved,
      first_name: json.data.first_name,
      last_name: json.data.last_name,
    };
  },

  async adminLogin(email, password) {
    const { res, json } = await requestJson('/api/v1/auth/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      redirectOnAuthFail: false,
    });

    if (!res.ok || !json.success) throw new Error(json.detail || json.message || 'Invalid admin credentials');

    return {
      success: true,
      uid: json.data.uid,
      role: 'admin'
    };
  },

  async logout() {
    const { res, json } = await requestJson('/api/v1/auth/logout', {
      method: 'POST',
      scope: 'member',
      redirectOnAuthFail: false,
    });

    clearClientAuth();
    if (!res.ok || !json.success) return { success: false };
    return json;
  },

  async getMe() {
    const { res, json } = await requestJson('/api/v1/auth/me', {
      method: 'GET',
      scope: 'member',
    });

    if (!res.ok || !json.success) throw new Error(json.detail || json.message || 'Failed to fetch profile');
    return json.data;
  },

  async checkMemberSession() {
    const { res, json } = await requestJson('/api/v1/auth/me', {
      method: 'GET',
      scope: 'member',
      redirectOnAuthFail: false,
    });

    if (!res.ok || !json.success) throw new Error(json.detail || json.message || 'Not authenticated');
    return json.data;
  },

  async checkAdminSession() {
    const { res, json } = await requestJson('/api/v1/admin/stats', {
      method: 'GET',
      scope: 'admin',
      redirectOnAuthFail: false,
    });

    if (!res.ok || !json.success) throw new Error(json.detail || json.message || 'Not authorized');
    return json.data;
  },

  async getSubgroups() {
    const { res, json } = await requestJson('/api/v1/meta/subgroups', {
      method: 'GET',
      redirectOnAuthFail: false,
    });

    if (!res.ok) throw new Error('Failed to fetch subgroups');
    return json;
  },

  async getPosts() {
    const { res, json } = await requestJson('/api/v1/meta/posts', {
      method: 'GET',
      redirectOnAuthFail: false,
    });

    if (!res.ok) throw new Error('Failed to fetch posts');
    return json;
  },

  async updateProfile(id, data) {
    const { res, json } = await requestJson(`/api/v1/members/${id}/update-details`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        first_name: data.firstName,
        last_name: data.lastName,
        phone_number: data.phone,
        birth_day: parseInt(data.birthDay),
        birth_month: parseInt(data.birthMonth),
        title: data.title || null,
        status: data.member_type
      }),
      scope: 'member',
    });

    if (!res.ok || !json.success) throw new Error(json.detail || json.message || 'Update failed');
    return json.data;
  },

  async uploadProfilePicture(id, file) {
    const formData = new FormData();
    formData.append('file', file);

    const { res, json } = await requestJson(`/api/v1/members/${id}/upload-profile-picture`, {
      method: 'PATCH',
      body: formData,
      scope: 'member',
    });

    if (!res.ok || !json.success) throw new Error(json.detail || json.message || 'Profile upload failed');
    return json.data;
  },

  async uploadBirthdayPicture(id, file) {
    const formData = new FormData();
    formData.append('file', file);

    const { res, json } = await requestJson(`/api/v1/members/${id}/upload-birthday-picture`, {
      method: 'PATCH',
      body: formData,
      scope: 'member',
    });

    if (!res.ok || !json.success) throw new Error(json.detail || json.message || 'Birthday upload failed');
    return json.data;
  },

  async getPendingMembers({ search = '', limit = 25, offset = 0 } = {}) {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    params.append('limit', limit);
    params.append('offset', offset);
    const qs = params.toString() ? `?${params.toString()}` : '';

    const { res, json } = await requestJson(`/api/v1/admin/members/pending${qs}`, {
      scope: 'admin',
    });

    if (!res.ok || !json.success) throw new Error(json.detail || json.message || 'Failed to fetch pending members');
    return json;
  },

  async getApprovedMembers(filters = {}, limit = 50, offset = 0) {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.month) params.append('birth_month', filters.month);
    params.append('limit', limit);
    params.append('offset', offset);
    const qs = params.toString() ? `?${params.toString()}` : '';

    const { res, json } = await requestJson(`/api/v1/admin/members/approved${qs}`, {
      scope: 'admin',
    });

    if (!res.ok || !json.success) throw new Error(json.detail || json.message || 'Failed to fetch members');
    return json;
  },

  async getUpcomingBirthdays(limit = 5) {
    const { res, json } = await requestJson(`/api/v1/admin/members/upcoming-birthdays?limit=${limit}`, {
      scope: 'admin',
    });

    if (!res.ok || !json.success) throw new Error(json.detail || json.message || 'Failed to fetch upcoming birthdays');
    return json.data;
  },

  async getMemberDetails(uid) {
    const { res, json } = await requestJson(`/api/v1/admin/members/${uid}`, {
      scope: 'admin',
    });

    if (!res.ok || !json.success) throw new Error(json.detail || json.message || 'Failed to fetch member details');
    return json.data;
  },

  async approveMember(uid) {
    const { res, json } = await requestJson(`/api/v1/admin/members/${uid}/approve`, {
      method: 'PATCH',
      scope: 'admin',
    });

    if (!res.ok || !json.success) throw new Error(json.detail || json.message || 'Failed to approve member');
    return json;
  },

  async rejectMember(uid) {
    const { res, json } = await requestJson(`/api/v1/admin/members/${uid}/reject`, {
      method: 'DELETE',
      scope: 'admin',
    });

    if (!res.ok || !json.success) throw new Error(json.detail || json.message || 'Failed to reject member');
    return json;
  },

  async deleteMember(uid) {
    const { res, json } = await requestJson(`/api/v1/admin/members/${uid}`, {
      method: 'DELETE',
      scope: 'admin',
    });

    if (!res.ok || !json.success) throw new Error(json.detail || json.message || 'Failed to delete member');
    return json;
  },

  async editMember(uid, data) {
    const { res, json } = await requestJson(`/api/v1/admin/members/${uid}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      scope: 'admin',
    });

    if (!res.ok || !json.success) throw new Error(json.detail || json.message || 'Failed to update member');
    return json.data;
  },

  async getStats() {
    const { res, json } = await requestJson('/api/v1/admin/stats', {
      scope: 'admin',
    });

    if (!res.ok || !json.success) throw new Error(json.detail || json.message || 'Failed to fetch stats');
    return json.data;
  },

  async getLogs() {
    return [];
  },
};
