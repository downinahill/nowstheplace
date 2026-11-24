import { LoginForm } from "./LoginForm";

export const metadata = { title: "Admin login", robots: { index: false } };

export default function LoginPage() {
  return (
    <main className="admin">
      <div className="wrap" style={{ paddingTop: 80, maxWidth: 480 }}>
        <h1>Dashboard</h1>
        <LoginForm />
      </div>
    </main>
  );
}
