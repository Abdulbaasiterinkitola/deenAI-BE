const { execSync } = require('child_process');
const path = require('path');

const testModules = [
  'auth',
  'users', 
  'health',
  'waitlist',
  'contact',
  'reflections',
  'notification-settings'
];

console.log('🚀 Running all E2E tests...\n');

let totalPassed = 0;
let totalFailed = 0;
const results = [];

for (const module of testModules) {
  console.log(`📋 Running ${module} tests...`);
  
  try {
    const testPath = path.join(__dirname, module, `${module}.e2e-spec.ts`);
    const output = execSync(
      `npx jest --testPathPattern=${testPath} --verbose --detectOpenHandles`,
      { 
        encoding: 'utf8',
        cwd: path.join(__dirname, '..'),
        stdio: 'pipe'
      }
    );
    
    console.log(`✅ ${module} tests PASSED`);
    results.push({ module, status: 'PASSED', output });
    totalPassed++;
    
  } catch (error) {
    console.log(`❌ ${module} tests FAILED`);
    results.push({ module, status: 'FAILED', error: error.message });
    totalFailed++;
  }
  
  console.log(''); // Empty line for readability
}

console.log('📊 Test Results Summary:');
console.log('========================');
console.log(`✅ Passed: ${totalPassed}`);
console.log(`❌ Failed: ${totalFailed}`);
console.log(`📈 Total: ${totalPassed + totalFailed}`);
console.log('');

if (totalFailed > 0) {
  console.log('❌ Failed Modules:');
  results
    .filter(r => r.status === 'FAILED')
    .forEach(r => {
      console.log(`  - ${r.module}`);
    });
  
  process.exit(1);
} else {
  console.log('🎉 All tests passed!');
  process.exit(0);
}