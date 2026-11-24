"use client";

import { useState } from "react";

/** Submits a form to a server action and tracks pending/result state. */
export function useAction<R extends object>(action: (fd: FormData) => Promise<R>) {
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<R | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    try {
      setResult(await action(new FormData(e.currentTarget)));
    } catch (err) {
      // Let Next.js handle redirects thrown by the action.
      if (err && typeof err === "object" && "digest" in err && String((err as { digest: unknown }).digest).startsWith("NEXT_REDIRECT")) throw err;
      setResult({ error: "Something went wrong. Try again." } as unknown as R);
    } finally {
      setPending(false);
    }
  }

  return { pending, result, onSubmit };
}
