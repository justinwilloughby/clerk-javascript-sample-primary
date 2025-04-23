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
  await window.Clerk?.load({
    allowedRedirectOrigins: ["https://www.securitysaas.xyz"]
  });
  
  if (clerk.user) {
    document.getElementById('app')!.innerHTML = `
      <div id="user-button"></div>
    `
    
    const userButtonDiv = document.getElementById('user-button')
    
    clerk.mountUserButton(userButtonDiv as HTMLDivElement)
  } else {
    document.getElementById('app')!.innerHTML = `
      <button id="sign-in">Sign In</button>
    `
    
    const signInButton = document.getElementById('sign-in')

    signInButton?.addEventListener('click', async () => {
      const phoneNumber = "+17652024451";

      await window.Clerk?.client?.signIn.create({
        strategy: "phone_code",
        identifier: phoneNumber,
      })

      // Prompt for code
      const code = prompt("Enter the code you received:")

      if (!code) {
        console.error("No code provided")
        return
      }

      await window.Clerk?.client?.signIn.attemptFirstFactor({
        strategy: "phone_code",
        code,
      });

      console.log("Signed in")
    })
    
  }
})().catch(error => {
  console.error("Failed to initialize Clerk:", error);
});
