import "@testing-library/jest-dom";

// Global Mock for Firebase Auth Hooks
jest.mock("react-firebase-hooks/auth", () => ({
  useAuthState: jest.fn(() => [null, false, null]),
  useSignInWithEmailAndPassword: jest.fn(() => [jest.fn(), false, null]),
  useCreateUserWithEmailAndPassword: jest.fn(() => [
    jest.fn(),
    null,
    false,
    null,
  ]),
  useSendPasswordResetEmail: jest.fn(() => [jest.fn(), false, null]),
  useSignOut: jest.fn(() => [jest.fn(), false, null]),
}));

// Global Mock for Firebase Configuration
jest.mock("@/firebase/firebase", () => ({
  auth: { currentUser: null },
  firestore: {},
  storage: {},
}));

// To ignore warning messages of fetchPriority
const originalError = console.error;
const hideNoise = (...args: any[]) => {
  const message = args.join(" "); // Combine all arguments into one string
  // Check for the fetchPriority/fetchpriority prop warning
  if (message.toLowerCase().includes("fetchpriority")) {
    return;
  }
  // Optional: Also hide the "act" warning if it's cluttering your success
  if (message.includes("not wrapped in act(...)")) {
    return;
  }
  originalError.call(console, ...args);
};

// Apply to both error and warn to be safe
console.error = hideNoise;
console.warn = hideNoise;
