import axios from 'axios';

const BASE_URL = 'http://localhost:3001';
const API_BASE = `${BASE_URL}/api`;

interface TestUser {
  email: string;
  password: string;
  name: string;
  role?: string;
  adminCode?: string;
}

interface AuthResponse {
  success: boolean;
  data?: {
    user: any;
    token: string;
  };
  error?: string;
}

class AuthTester {
  private tokens: Map<string, string> = new Map();

  async testHealthCheck() {
    console.log('🔍 Testing health check...');
    try {
      const response = await axios.get(`${BASE_URL}/health`);
      console.log('✅ Health check passed:', response.data);
      return true;
    } catch (error: any) {
      console.error('❌ Health check failed:', error.message);
      return false;
    }
  }

  async testRegistration() {
    console.log('\n🔐 Testing user registration...');

    const testUsers: TestUser[] = [
      {
        email: 'citizen@example.com',
        password: 'securepassword123',
        name: 'John Citizen',
        role: 'CITIZEN'
      },
      {
        email: 'admin@example.com',
        password: 'adminpassword123',
        name: 'Admin User',
        role: 'ADMIN',
        adminCode: process.env.ADMIN_REGISTRATION_CODE || 'GOV2024MALAYSIA'
      },
      {
        email: 'gov@example.com',
        password: 'govpassword123',
        name: 'Government Official',
        role: 'GOVERNMENT',
        adminCode: process.env.ADMIN_REGISTRATION_CODE || 'GOV2024MALAYSIA'
      }
    ];

    for (const user of testUsers) {
      try {
        const response = await axios.post(`${API_BASE}/auth/register`, user);
        const result: AuthResponse = response.data;

        if (result.success && result.data) {
          console.log(`✅ Registration successful for ${user.role}:`, {
            email: result.data.user.email,
            name: result.data.user.name,
            role: result.data.user.role,
            hasToken: !!result.data.token
          });
          this.tokens.set(user.email, result.data.token);
        } else {
          console.error(`❌ Registration failed for ${user.role}:`, result.error);
        }
      } catch (error: any) {
        console.error(`❌ Registration error for ${user.role}:`, 
          error.response?.data?.error || error.message);
      }
    }
  }

  async testLogin() {
    console.log('\n🔑 Testing user login...');

    const loginTests = [
      { email: 'citizen@example.com', password: 'securepassword123' },
      { email: 'admin@example.com', password: 'adminpassword123' },
      { email: 'gov@example.com', password: 'govpassword123' }
    ];

    for (const loginData of loginTests) {
      try {
        const response = await axios.post(`${API_BASE}/auth/login`, loginData);
        const result: AuthResponse = response.data;

        if (result.success && result.data) {
          console.log(`✅ Login successful for ${loginData.email}:`, {
            email: result.data.user.email,
            role: result.data.user.role,
            hasToken: !!result.data.token
          });
          this.tokens.set(loginData.email, result.data.token);
        } else {
          console.error(`❌ Login failed for ${loginData.email}:`, result.error);
        }
      } catch (error: any) {
        console.error(`❌ Login error for ${loginData.email}:`, 
          error.response?.data?.error || error.message);
      }
    }
  }

  async testInvalidLogin() {
    console.log('\n🚫 Testing invalid login scenarios...');

    const invalidTests = [
      { email: 'nonexistent@example.com', password: 'password123', desc: 'Non-existent user' },
      { email: 'citizen@example.com', password: 'wrongpassword', desc: 'Wrong password' },
      { email: '', password: 'password123', desc: 'Empty email' },
      { email: 'citizen@example.com', password: '', desc: 'Empty password' }
    ];

    for (const test of invalidTests) {
      try {
        const response = await axios.post(`${API_BASE}/auth/login`, {
          email: test.email,
          password: test.password
        });
        console.error(`❌ ${test.desc} should have failed but succeeded`);
      } catch (error: any) {
        if (error.response?.status === 400 || error.response?.status === 401) {
          console.log(`✅ ${test.desc} correctly rejected:`, 
            error.response.data.error);
        } else {
          console.error(`❌ ${test.desc} failed with unexpected error:`, error.message);
        }
      }
    }
  }

  async testProtectedRoutes() {
    console.log('\n🛡️  Testing protected routes...');

    const citizenToken = this.tokens.get('citizen@example.com');
    const adminToken = this.tokens.get('admin@example.com');

    if (!citizenToken || !adminToken) {
      console.error('❌ Missing tokens for protected route testing');
      return;
    }

    try {
      const response = await axios.get(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${citizenToken}` }
      });
      console.log('✅ /auth/me with valid token:', response.data);
    } catch (error: any) {
      console.error('❌ /auth/me failed:', error.response?.data?.error || error.message);
    }

    try {
      await axios.get(`${API_BASE}/auth/me`);
      console.error('❌ /auth/me without token should have failed');
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.log('✅ /auth/me correctly rejected without token');
      } else {
        console.error('❌ Unexpected error:', error.message);
      }
    }
  }

  async testLogout() {
    console.log('\n🚪 Testing logout...');

    const citizenToken = this.tokens.get('citizen@example.com');
    if (!citizenToken) {
      console.error('❌ No citizen token for logout test');
      return;
    }

    try {
      const response = await axios.post(`${API_BASE}/auth/logout`, {}, {
        headers: { Authorization: `Bearer ${citizenToken}` }
      });
      console.log('✅ Logout successful:', response.data);

      try {
        await axios.get(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${citizenToken}` }
        });
        console.error('❌ Token should be invalid after logout');
      } catch (error: any) {
        if (error.response?.status === 401) {
          console.log('✅ Token correctly invalidated after logout');
        }
      }
    } catch (error: any) {
      console.error('❌ Logout failed:', error.response?.data?.error || error.message);
    }
  }

  async testRolesEndpoint() {
    console.log('\n📋 Testing roles endpoint...');

    try {
      const response = await axios.get(`${API_BASE}/auth/roles`);
      console.log('✅ Roles endpoint successful:', response.data);

      const roles = response.data.data.roles;
      if (Array.isArray(roles) && roles.length === 3) {
        console.log('✅ Correct number of roles returned');
      } else {
        console.error('❌ Unexpected roles structure');
      }
    } catch (error: any) {
      console.error('❌ Roles endpoint failed:', error.response?.data?.error || error.message);
    }
  }

  async runAllTests() {
    console.log('🚀 Starting comprehensive auth flow test...\n');

    const healthOk = await this.testHealthCheck();
    if (!healthOk) {
      console.log('❌ Server not responding. Make sure the server is running on port 3001');
      return;
    }

    await this.testRolesEndpoint();
    await this.testRegistration();
    await this.testLogin();
    await this.testInvalidLogin();
    await this.testProtectedRoutes();
    await this.testLogout();

    console.log('\n✨ Auth flow testing completed!');
  }
}

if (require.main === module) {
  const tester = new AuthTester();
  tester.runAllTests().catch(console.error);
}

export default AuthTester;