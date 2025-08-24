const fetch = require('node-fetch');

async function testEndpoints() {
  console.log('Testing backend endpoints...\n');

  try {
    // Test device donations stats endpoint
    console.log('1. Testing /api/device-donations/stats...');
    const statsResponse = await fetch('http://localhost:5000/api/device-donations/stats');
    console.log('Status:', statsResponse.status);
    if (statsResponse.ok) {
      const statsData = await statsResponse.json();
      console.log('Data received:', Object.keys(statsData));
    } else {
      const error = await statsResponse.text();
      console.log('Error:', error);
    }

    console.log('\n2. Testing /api/users...');
    const usersResponse = await fetch('http://localhost:5000/api/users');
    console.log('Status:', usersResponse.status);
    if (usersResponse.ok) {
      const usersData = await usersResponse.json();
      console.log('Data received:', Object.keys(usersData));
    } else {
      const error = await usersResponse.text();
      console.log('Error:', error);
    }

  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testEndpoints();
