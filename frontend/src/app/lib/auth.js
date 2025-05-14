"use client";
import { getPocketBase } from './pocketbase';

export async function signUp(email, password, name) {
  try {
    const pb = getPocketBase();
    
    // Create a new user record
    const user = await pb.collection('users').create({
      email,
      password,
      passwordConfirm: password, // PocketBase requires password confirmation
      name,
    });
    
    return { success: true, user };
  } catch (error) {
    console.error('Signup error:', error);
    return { 
      success: false, 
      message: error?.response?.message || error.message || 'Failed to create account' 
    };
  }
}

export async function logIn(email, password) {
    try {
      const pb = getPocketBase();
      
      // Authenticate the user
      const authData = await pb.collection('users').authWithPassword(email, password);
      
      return { success: true, user: authData.record };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: error?.response?.message || error.message || 'Invalid credentials' 
      };
    }
  }
  
  export function logOut() {
    const pb = getPocketBase();
    pb.authStore.clear();
    return { success: true };
  }
  
  export function getCurrentUser() {
    const pb = getPocketBase();
    return pb.authStore.isValid ? pb.authStore.model : null;
  }
  
  export function isAuthenticated() {
    const pb = getPocketBase();
    return pb.authStore.isValid;
  }
  