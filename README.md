# Clerk + Xano Next.js Template

This is a reusable Next.js template designed to provide a robust authentication and backend solution by integrating Clerk for user authentication and Xano for backend data and API functionality. It features a public landing page and a protected application area, ensuring a clear separation between public content and authenticated user experiences.

## ✨ Features

*   **Clerk Authentication**: Seamless user sign-up, sign-in, and session management using Clerk.
*   **Xano Backend Integration**: Automatically syncs Clerk user data to your Xano backend upon first login/signup.
*   **HTTP-Only Xano Auth Token**: Securely stores the Xano authentication token as an HTTP-only cookie.
*   **Automated Xano Token Clearing**: Clears the Xano token cookie automatically upon Clerk logout.
*   **Public Landing Page**: A dedicated root (`/`) route for public content and calls to action.
*   **Protected Application Area**: All authenticated content resides under the `/app` route, with sub-routes automatically protected.
*   **Reusable AuthGuard Component**: An easy way to protect any React component or page.


## 🚀 Getting Started

Follow these steps to set up and run the project locally or deploy it.

### 1. Environment Variables

You need to configure the following environment variables. Create a `.env.local` file in the root of your project for local development, and set them in your Vercel project settings for deployment.

**Quick Start**: Copy `.env.example` to `.env.local` and update the values:

```bash
cp .env.example .env.local
```

```
# Clerk.com API Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY=sk_test_YOUR_CLERK_SECRET_KEY

# Clerk Redirect URLs (Crucial for app routing)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/app
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/app

# Xano Backend Configuration
XANO_API_BASE_URL=https://your-instance-id.xano.io/api:your-api-key # Replace with your Xano API base URL
XANO_USERS_API_ROUTE=users # The specific API route for user POST requests (e.g., 'users', 'auth/signup')
XANO_AUTH_COOKIE_NAME=xano_auth_token # Name for the HTTP-only cookie
XANO_API_KEY=your_xano_api_key_here # Secret API key for authenticating server-to-Xano requests
```


### 2. Clerk Dashboard Configuration

Go to your Clerk Dashboard (clerk.com) and navigate to your applicatsion settings.

*   **Redirect URLs**: Under "Authentication" -> "Redirect URLs", ensure that "After sign in" and "After sign up" URLs are set to `YOUR_APP_DOMAIN/app`. For local development, this might be `http://localhost:3000/app`.

### 3. Xano Backend Setup

Ensure your Xano instance has an API endpoint (e.g., the one specified by `XANO_USERS_API_ROUTE`) that:

*   Accepts a `POST` request with a JSON payload containing `clerk_user_id`, `first_name`, `last_name`, `username`, `created_at`, `updated_at`, and `email`, `authtoken_max_age`.
*   We recommend sending your `XANO_API_KEY` as a Bearer token in the `Authorization` header from your server-side code. This ensures only your backend can sync users and prevents unauthorized access.
*   **On the Xano side:**
    *   Set up an environment variable in Xano (e.g., `XANO_API_KEY`) with the same value as in your `.env.local`.
    *   In your Xano API endpoint's Function Stack, add a step at the top to validate the incoming `Authorization` header:
        1. Use the "Get Header" function to extract the `Authorization` header.
        2. Use the "Condition" function to check if the header value matches `Bearer {XANO_API_KEY}` (using the environment variable).
        3. If it does not match, return a 401 Unauthorized response and stop the stack.
    *   This ensures only requests with the correct API key are processed.
*   Returns an authentication token. This template expects the token to be either:
    *   A raw string (e.g., `"eyJhbG..."`)
    *   A JSON object with an `authToken` property (e.g., `{ "authToken": "eyJhbGc..." }`)

### 4. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

**Note**: This template includes only the minimal dependencies required for the core functionality:
- **@clerk/nextjs**: Authentication
- **@radix-ui/react-slot**: Button component foundation  
- **lucide-react**: Icons used in the interface
- **class-variance-authority & clsx & tailwind-merge**: Styling utilities
- **tailwindcss-animate**: Animation utilities

You can add additional shadcn/ui components or other libraries as needed for your specific use case.

### 5. Run the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the public landing page.

## 💡 How It Works

1.  **Public Landing Page (`/`)**: The root route (`app/page.tsx`) serves as a public entry point. It does not require authentication.
2.  **Authentication Flow**:
    *   Users navigate to `/sign-in` or `/sign-up` (Clerk's hosted pages).
    *   Upon successful authentication, Clerk redirects the user to the `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` (which is `/app`).
3.  **Protected Application Area (`/app` and sub-routes)**:
    *   The `app/app/page.tsx` and any other pages under `app/app/` (e.g., `app/app/dashboard/page.tsx`) are wrapped with `AuthGuard`.
    *   `AuthGuard` is a client component that checks `useUser().isSignedIn`. If the user is not signed in, it redirects them to `/sign-in`.
4.  **Xano User Sync**:
    *   When an authenticated user first lands on `/app`, the `useEffect` hook in `app/app/page.tsx` checks for the Xano authentication cookie.
    *   If the cookie is missing, it triggers the `syncUserWithXano` Server Action.
    *   `syncUserWithXano` sends the Clerk user's details to your Xano backend at `XANO_API_BASE_URL/XANO_USERS_API_ROUTE` with a server-side API key for security.
    *   The returned Xano token is then securely stored as an HTTP-only cookie using `setXanoAuthCookie`.
5.  **Logout**:
    *   Clicking the `UserButton` (Clerk's logout component) redirects to `/api/logout`.
    *   The `app/api/logout/route.ts` API route executes the `logoutAndClearXanoToken` Server Action, which deletes the Xano cookie and then redirects the user to `/sign-in`.

## 📁 Project Structure

```
.
├── app/
│   ├── api/
│   │   ├── get-xano-cookie/  # API route to get Xano token (client-side access)
│   │   └── logout/           # API route to handle Clerk logout and clear Xano token
│   ├── app/                  # Protected application routes
│   │   ├── dashboard/        # Example protected sub-route
│   │   └── page.tsx          # Main authenticated app page (Xano sync logic here)
│   ├── layout.tsx            # Root layout for ClerkProvider
│   ├── page.tsx              # Public landing page
│   ├── sign-in/              # Clerk sign-in page
│   └── sign-up/              # Clerk sign-up page
├── components/
│   ├── layouts/
│   │   ├── AuthGuard.tsx     # Reusable component for protecting routes
│   │   └── AppSidebar.tsx    # Sidebar for the app
│   └── ui/                   # shadcn/ui components
├── lib/
│   └── xano/                 # Xano integration logic
├── .env.example              # Environment variables template
├── LICENSE                   # MIT License
├── README.md                 # This file
└── SECURITY.md               # Security policy and guidelines
```

## 🛠️ Usage and Extension

*   **Adding Protected Pages**: To add a new protected page (e.g., `/app/profile`), create `app/app/profile/page.tsx` and wrap its content with `<AuthGuard>`.
*   **Adding Public Pages**: To add a new public page (e.g., `/about`), create `app/about/page.tsx`. No wrapper is needed.
*   **Xano API Calls**: Use the `getXanoAuthCookie` function (from `lib/xano/auth.ts`) in your Server Components or Server Actions to retrieve the Xano token and make authenticated requests to your Xano backend.
*   **Adding UI Components**: This template includes only Button and Card components. You can easily add more shadcn/ui components using:
    ```bash
    npx shadcn@latest add [component-name]
    ```
*   **Styling**: Built with Tailwind CSS and ShadCN for rapid UI development and customization.


### Development Setup

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/clerk-xano-nextjs-template.git`
3. Install dependencies: `npm install` (or `yarn install` or `pnpm install`)
4. Copy environment variables: `cp .env.example .env.local`
5. Set up your Clerk and Xano credentials in `.env.local`
6. Run the development server: `npm run dev`

## 📄 License

This project is open-sourced under the MIT License.
