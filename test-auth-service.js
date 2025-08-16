// Test script for authService.ts
import { signUpUser, getUserProfile, updateUserProfile } from './client/lib/authService.js';

// Test user data
const testUser = {
  email: `test-${Date.now()}@example.com`,
  password: 'Password123!',
  fullName: 'Test User',
  phoneNumber: '555-123-4567',
  address: '123 Test St',
  profilePhoto: '',
  userType: '0' // Consumer
};

let userId;

async function runTests() {
  console.log('Starting auth service tests...');
  
  try {
    // Test 1: Sign up a new user
    console.log('\nTest 1: Signing up a new user...');
    const user = await signUpUser(testUser);
    console.log('User created successfully:', user.id);
    userId = user.id;
    
    // Test 2: Get user profile
    console.log('\nTest 2: Getting user profile...');
    const profile = await getUserProfile();
    console.log('Profile retrieved successfully:', profile);
    
    // Test 3: Update user profile
    console.log('\nTest 3: Updating user profile...');
    const updatedProfile = await updateUserProfile({
      name: 'Updated Test User',
      phone: '555-987-6543',
      address: '456 Updated St',
      avatar_url: 'https://example.com/avatar.jpg'
    });
    console.log('Profile updated successfully:', updatedProfile);
    
    console.log('\nAll tests completed successfully!');
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

runTests();