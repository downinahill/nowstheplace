"use client";

import { useAction } from "@/components/useAction";
import { login } from "../actions";

export function LoginForm() {
  const { pending, result, onSubmit } = useAction(login);
  return (
    <form onSubmit={onSubmit} className="form">
      <div className="field">
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" required autoFocus autoComplete="current-password" />
      </div>
      {result?.error && <p className="notice error">{result.error}</p>}
      <button className="btn block" disabled={pending}>{pending ? "Checking…" : "Log in"}</button>
    </form>
  );
}
