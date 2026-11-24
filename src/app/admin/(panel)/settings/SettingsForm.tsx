"use client";

import type { Settings } from "@prisma/client";
import { useAction } from "@/components/useAction";
import { saveSettings } from "../../actions";

export function SettingsForm({ s }: { s: Settings }) {
  const { pending, result, onSubmit } = useAction(saveSettings);
  return (
    <form onSubmit={onSubmit} className="form">
      <div className="row2">
        <div className="field"><label htmlFor="siteName">Site name</label><input id="siteName" name="siteName" defaultValue={s.siteName} required /></div>
        <div className="field"><label htmlFor="artistName">Artist name</label><input id="artistName" name="artistName" defaultValue={s.artistName} required /></div>
      </div>
      <div className="field"><label htmlFor="tagline">Tagline</label><input id="tagline" name="tagline" defaultValue={s.tagline} /><span className="hint">Shown under the big name on the home page.</span></div>
      <div className="field"><label htmlFor="bio">About / bio</label><textarea id="bio" name="bio" defaultValue={s.bio} rows={8} /></div>
      <div className="row2">
        <div className="field"><label htmlFor="contactEmail">Public email</label><input id="contactEmail" name="contactEmail" type="email" defaultValue={s.contactEmail} /></div>
        <div className="field"><label htmlFor="instagram">Instagram handle</label><input id="instagram" name="instagram" defaultValue={s.instagram} placeholder="yourname" /></div>
      </div>
      <div className="field" style={{ maxWidth: 240 }}>
        <label htmlFor="shipping">Shipping per order ($)</label>
        <input id="shipping" name="shipping" inputMode="decimal" defaultValue={(s.shippingCents / 100).toString()} />
        <span className="hint">Flat rate added at checkout. 0 for free shipping.</span>
      </div>
      {result?.error && <p className="notice error">{result.error}</p>}
      {result?.ok && <p className="notice">Saved. The site is updated.</p>}
      <div><button className="btn" disabled={pending}>{pending ? "Saving…" : "Save settings"}</button></div>
    </form>
  );
}
