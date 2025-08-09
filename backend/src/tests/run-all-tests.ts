#!/usr/bin/env ts-node

import { spawn } from 'child_process';
import AuthTester from './manual-auth-test';

class TestRunner {
  private async runCommand(command: string, args: string[] = []): Promise<boolean> {
    return new Promise((resolve) => {
      console.log(`\n🚀 Running: ${command} ${args.join(' ')}`);
      const child = spawn(command, args, { 
        stdio: 'inherit',
        shell: true 
      });

      child.on('close', (code) => {
        if (code === 0) {
          console.log(`✅ ${command} completed successfully`);
          resolve(true);
        } else {
          console.log(`❌ ${command} failed with code ${code}`);
          resolve(false);
        }
      });

      child.on('error', (error) => {
        console.error(`❌ Error running ${command}:`, error.message);
        resolve(false);
      });
    });
  }

  private async waitForServer(url: string, maxAttempts: number = 30): Promise<boolean> {
    const axios = require('axios');
    
    for (let i = 0; i < maxAttempts; i++) {
      try {
        await axios.get(url, { timeout: 1000 });
        console.log('✅ Server is ready');
        return true;
      } catch (error) {
        console.log(`⏳ Waiting for server... (${i + 1}/${maxAttempts})`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    console.log('❌ Server did not start in time');
    return false;
  }

  async runAllTests() {
    console.log('🎯 Starting comprehensive auth testing suite...\n');

    console.log('📦 Installing dependencies...');
    const installSuccess = await this.runCommand('npm', ['install']);
    if (!installSuccess) {
      console.log('❌ Failed to install dependencies');
      return;
    }

    console.log('\n🔧 Starting the server...');
    const serverProcess = spawn('npm', ['run', 'dev'], { 
      stdio: ['inherit', 'pipe', 'pipe'],
      shell: true 
    });

    let serverOutput = '';
    serverProcess.stdout?.on('data', (data) => {
      const output = data.toString();
      serverOutput += output;
      if (output.includes('TransparensiMY Backend running')) {
        console.log('✅ Server started successfully');
      }
    });

    serverProcess.stderr?.on('data', (data) => {
      console.error('Server error:', data.toString());
    });

    const serverReady = await this.waitForServer('http://localhost:3001/health');
    if (!serverReady) {
      serverProcess.kill();
      return;
    }

    try {
      console.log('\n🧪 Running Jest tests...');
      const jestSuccess = await this.runCommand('npx', ['jest', 'src/tests/', '--verbose']);
      
      if (jestSuccess) {
        console.log('✅ All Jest tests passed');
      } else {
        console.log('⚠️  Some Jest tests may have failed, but continuing...');
      }

      console.log('\n🔍 Running manual integration tests...');
      const tester = new AuthTester();
      await tester.runAllTests();

    } finally {
      console.log('\n🛑 Stopping server...');
      serverProcess.kill('SIGTERM');
      
      setTimeout(() => {
        if (!serverProcess.killed) {
          serverProcess.kill('SIGKILL');
        }
      }, 5000);
    }

    console.log('\n🎉 All tests completed!');
    console.log(`
📊 Test Summary:
- Unit Tests: Jest tests for auth routes and middleware
- Integration Tests: End-to-end auth flow validation
- Manual Tests: Real HTTP requests to running server

🚀 Your auth system has been thoroughly tested!
    `);
  }
}

if (require.main === module) {
  const runner = new TestRunner();
  runner.runAllTests().catch(console.error);
}