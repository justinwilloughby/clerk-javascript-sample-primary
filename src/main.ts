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

// Helper function to get URL parameters
function getUrlParameter(name: string): string | null {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

(async function initializeClerk() {
  await window.Clerk?.load({
    allowedRedirectOrigins: ["https://www.securitysaas.xyz", "https://securitysaas.xyz"]
  });
  
  const redirectUrl = getUrlParameter('redirect_url');
  
  if (clerk.user) {
    document.getElementById('app')!.innerHTML = `
      <div id="user-button"></div>
    `
    
    const userButtonDiv = document.getElementById('user-button')
    
    clerk.mountUserButton(userButtonDiv as HTMLDivElement)
    
    if (redirectUrl) {
      clerk.navigate(redirectUrl);
    }
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

      try {
        // Attempt to sign in
        await window.Clerk?.client?.signIn.attemptFirstFactor({
          strategy: "phone_code",
          code,
        });

        console.log("Signed in successfully");

        if (redirectUrl) {
          clerk.navigate(redirectUrl);
        }
      } catch (error) {
        console.error("Sign in failed:", error);
      }
    })
  }
})().catch(error => {
  console.error("Failed to initialize Clerk:", error);
});