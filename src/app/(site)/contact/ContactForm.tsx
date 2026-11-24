"use client";

import { useAction } from "@/components/useAction";
import { sendInquiry } from "./actions";

export function ContactForm({ artworkId, artTitle }: { artworkId?: string; artTitle?: string }) {
  const { pending, result, onSubmit } = useAction(sendInquiry);

  if (result?.ok) {
    return <p className="notice">Thanks, your message is in. You'll hear back by email.</p>;
  }

  return (
    <form onSubmit={onSubmit} className="form">
      {artworkId && <input type="hidden" name="artworkId" value={artworkId} />}
      <div style={{ position: "absolute", left: "-9999px" }} aria-hidden="true">
        <label htmlFor="website">Leave this empty</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="row2">
        <div className="field">
          <label htmlFor="name">Your name</label>
          <input id="name" name="name" required autoComplete="name" />
        </div>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required autoComplete="email" />
        </div>
      </div>
      <div className="field">
        <label htmlFor="message">Message</label>
        <textarea id="message" name="message" required defaultValue={artTitle ? `Hi, I'm interested in "${artTitle}". ` : ""} />
      </div>
      {result?.error && <p className="notice error">{result.error}</p>}
      <div>
        <button className="btn" type="submit" disabled={pending}>{pending ? "Sending…" : "Send message"}</button>
      </div>
    </form>
  );
}
