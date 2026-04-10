const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const BASE_URL = (import.meta.env.VITE_API_URL || 'https://nlcfhub-65e7c825bac4.herokuapp.com').replace(/\/$/, '');




export const api = {
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
    
    // Login returns lightweight routing data only
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
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.detail || json.message || 'Failed to fetch profile');
    return json.data;
  },

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

  async updateProfile(id, data) {
    const res = await fetch(`${BASE_URL}/api/v1/members/${id}/update-details`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
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
      body: formData
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.detail || json.message || 'Birthday upload failed');
    return json.data;
  },
  async getStats() {
    await delay(600);
    return {
      totalMembers: 400,
      activeMembers: 350,
      alumni: 50,
    };
  },
  async getLogs() {
    await delay(700);
    return [
      { id: 1, timestamp: new Date().toISOString(), memberName: 'Tunde Bakare', trigger: '1-day', channel: 'whatsapp', status: 'sent' },
      { id: 2, timestamp: new Date(Date.now() - 86400000).toISOString(), memberName: 'Ngozi Eze', trigger: '7-day', channel: 'email', status: 'failed', error: 'Email service unavailable' },
    ];
  },
  async getActiveMembers() {
    await delay(800);
    return [
      { id: 1, full_name: 'Aanuoluwapo Aladeniyi', birthday: '2026-04-10', subgroup: 'Technical', member_type: 'active', photoUrl: null },
      { id: 2, full_name: 'Eniola Davies', birthday: '2026-04-15', subgroup: 'Music', member_type: 'active', photoUrl: null },
      { id: 3, full_name: 'Samuel Adekola', birthday: '2026-04-20', subgroup: 'Ushering', member_type: 'alumni', photoUrl: null },
    ];
  },

  async getPendingMembers() {
    await delay(800);
    return [
      { id: '1', full_name: 'Boluwatife Oke', email: 'bolu@gmail.com', subgroup: 'Ushering', phone: '08123456789' },
      { id: '2', full_name: 'Chisom Okoro', email: 'chisom@outlook.com', subgroup: 'Technical', phone: '07098765432' },
    ];
  },

  async approveMember(id) {
    await delay(1000);
    return { success: true };
  },

  async denyMember(id) {
    await delay(1000);
    return { success: true };
  }
};
