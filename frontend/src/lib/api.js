const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const api = {
  async register(data) {
    await delay(1200);
    return { success: true, ...data };
  },
  async updateProfile(id, data) {
    await delay(1200);
    return { success: true, ...data };
  },
  async getMembers() {
    await delay(800);
    const today = new Date();
    // Helper to get formatted string for N days from now in 1900
    const getBd = (daysOffset) => {
      const d = new Date();
      d.setDate(today.getDate() + daysOffset);
      return `1900-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}T00:00:00Z`;
    };

    return [
      { id: '1', first_name: 'Adewale', last_name: 'Johnson', full_name: 'Adewale Johnson', subgroup: 'Media', member_type: 'active', status: 'active', birthday: getBd(3), phone: '08012345678', photoUrl: null },
      { id: '2', first_name: 'Chioma', last_name: 'Okafor', full_name: 'Chioma Okafor', subgroup: 'Choir', member_type: 'active', status: 'active', birthday: getBd(0), phone: '08087654321', photoUrl: null },
      { id: '5', first_name: 'Samuel', last_name: 'Peters', full_name: 'Samuel Peters', subgroup: 'Media', member_type: 'active', status: 'active', birthday: getBd(0), phone: '08011112222', photoUrl: null },
      { id: '3', first_name: 'Tunde', last_name: 'Bakare', full_name: 'Tunde Bakare', subgroup: 'Exco', member_type: 'alumni', status: 'active', birthday: '1900-11-20T00:00:00Z', phone: '08055555555', photoUrl: null },
      { id: '4', first_name: 'Ngozi', last_name: 'Eze', full_name: 'Ngozi Eze', subgroup: 'Ushers', member_type: 'active', status: 'inactive', birthday: '1900-02-14T00:00:00Z', phone: '08099999999', photoUrl: null },
      { id: '101', first_name: 'Jane', last_name: 'Doe', full_name: 'Jane Doe', subgroup: 'General', member_type: 'active', status: 'pending', birthday: getBd(5), phone: '08022223333', photoUrl: null, email: 'pending@nlcf.org' },
      { id: '102', first_name: 'John', last_name: 'Smith', full_name: 'John Smith', subgroup: 'Choir', member_type: 'active', status: 'pending', birthday: getBd(12), phone: '08044445555', photoUrl: null, email: 'john@nlcf.org' }
    ];
  },
  async getActiveMembers() {
    const all = await this.getMembers();
    return all.filter(m => m.status === 'active' || m.status === 'inactive'); // Only fully approved members
  },
  async getPendingMembers() {
    const all = await this.getMembers();
    return all.filter(m => m.status === 'pending');
  },
  async approveMember(id) {
    await delay(600);
    return { success: true };
  },
  async denyMember(id) {
    await delay(600);
    return { success: true };
  },
  async login(email, password) {
    await delay(1000);
    if (email === 'admin@nlcf.org' && password === 'password') {
      return { success: true, token: 'dummy-admin-token', role: 'admin' };
    }
    if (email === 'pending@nlcf.org') {
      return { success: true, token: 'dummy-pending-token', role: 'pending', member: { first_name: 'Jane' } };
    }
    if (email === 'user@nlcf.org') {
      return { success: true, token: 'dummy-user-token', role: 'member', member: { first_name: 'Chioma', id: '2' } };
    }
    throw new Error('Invalid credentials');
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
  }
};
