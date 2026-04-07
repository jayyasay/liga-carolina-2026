import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--bg-color, #0b1120)' }}>
      <SignIn routing="path" path="/sign-in" />
    </div>
  );
}
