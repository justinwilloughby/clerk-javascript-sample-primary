import './style.css'
import { Clerk } from '@clerk/clerk-js'

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!clerkPubKey) {
  throw new Error('VITE_CLERK_PUBLISHABLE_KEY is not set')
}

// Properly declare the Clerk type in the Window interface
declare global {
  interface Window {
    Clerk?: Clerk;
  }
}

const clerk = new Clerk(clerkPubKey);
window.Clerk = clerk;

// Wrap async code in a function instead of using top-level await
(async function initializeClerk() {
  await clerk.load();
  
  if (clerk.user) {
    document.getElementById('app')!.innerHTML = `
      <div id="user-button"></div>
    `
    
    const userButtonDiv = document.getElementById('user-button')
    
    clerk.mountUserButton(userButtonDiv as HTMLDivElement)
  } else {
    document.getElementById('app')!.innerHTML = `
      <div class="auth-container">
        <div id="sign-in"></div>
        <div class="divider">or</div>
        <div id="sign-up"></div>
      </div>
    `
    
    const signInDiv = document.getElementById('sign-in')
    const signUpDiv = document.getElementById('sign-up')
    
    clerk.mountSignIn(signInDiv as HTMLDivElement)
    clerk.mountSignUp(signUpDiv as HTMLDivElement)
  }
})().catch(error => {
  console.error("Failed to initialize Clerk:", error);
});
