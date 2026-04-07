import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--bg-color, #0b1120)' }}>
      <SignUp routing="path" path="/sign-up" />
    </div>
  );
}
