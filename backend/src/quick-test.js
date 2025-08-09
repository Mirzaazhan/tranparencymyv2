const axios = require('axios');

const BASE_URL = 'http://localhost:3001';
const API_BASE = `${BASE_URL}/api`;

async function testAuth() {
  console.log('🚀 Quick Auth Test Starting...\n');

  // Test 1: Health Check
  try {
    const response = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health Check:', response.data.status);
  } catch (error) {
    console.log('❌ Server not running. Start with: npm run dev');
    return;
  }

  // Test 2: Get available roles
  try {
    const response = await axios.get(`${API_BASE}/auth/roles`);
    console.log('✅ Available roles:', response.data.data.roles.map(r => r.value));
  } catch (error) {
    console.log('❌ Failed to get roles:', error.response?.data?.error);
  }

  // Test 3: Register new user
  try {
    const registerData = {
      email: `test${Date.now()}@example.com`,
      password: 'testpass123',
      name: 'Test User',
      role: 'CITIZEN'
    };
    
    const response = await axios.post(`${API_BASE}/auth/register`, registerData);
    const { token, user } = response.data.data;
    console.log('✅ Registration successful for:', user.email, '- Role:', user.role);

    // Test 4: Get current user with token
    const meResponse = await axios.get(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Token validation successful for:', meResponse.data.data.user.email);

    // Test 5: Login with same credentials
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: registerData.email,
      password: registerData.password
    });
    console.log('✅ Login successful, got new token');

    // Test 6: Logout
    await axios.post(`${API_BASE}/auth/logout`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Logout successful');

    // Test 7: Verify token is invalidated
    try {
      await axios.get(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('❌ Token should be invalid after logout');
    } catch (error) {
      console.log('✅ Token correctly invalidated after logout');
    }

  } catch (error) {
    console.log('❌ Auth flow failed:', error.response?.data?.error || error.message);
  }

  console.log('\n🎉 Quick test completed!');
}

testAuth();