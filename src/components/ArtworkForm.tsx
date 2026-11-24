"use client";

import { useState } from "react";
import type { Artwork } from "@prisma/client";
import { saveArtwork } from "@/app/admin/actions";

/** Shrinks a phone photo in the browser (max 2000px JPEG) so uploads are fast and small. */
async function shrink(file: File): Promise<{ blob: Blob; width: number; height: number }> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, 2000 / Math.max(bmp.width, bmp.height));
  const width = Math.round(bmp.width * scale);
  const height = Math.round(bmp.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d")!.drawImage(bmp, 0, 0, width, height);
  const blob = await new Promise<Blob>((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error("Couldn't read that image"))), "image/jpeg", 0.86));
  return { blob, width, height };
}

export function ArtworkForm({ art }: { art?: Artwork }) {
  const [preview, setPreview] = useState<string | null>(art?.imageUrl ?? null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const fd = new FormData(e.currentTarget);
      const file = fd.get("image");
      if (file instanceof File && file.size > 0) {
        const { blob, width, height } = await shrink(file);
        fd.set("image", new File([blob], "art.jpg", { type: "image/jpeg" }));
        fd.set("imageWidth", String(width));
        fd.set("imageHeight", String(height));
      } else {
        fd.delete("image");
      }
      const res = await saveArtwork(fd); // redirects on success
      if (res?.error) setError(res.error);
    } catch (err) {
      // A redirect from the server action is reported as a thrown value; let Next handle it.
      if (err && typeof err === "object" && "digest" in err && String((err as { digest: string }).digest).startsWith("NEXT_REDIRECT")) throw err;
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="form">
      {art && <input type="hidden" name="id" value={art.id} />}
      <div className="field">
        <label htmlFor="image">{art ? "Replace photo (optional)" : "Photo"}</label>
        {preview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="preview" src={preview} alt="" />
        )}
        <input
          id="image"
          name="image"
          type="file"
          accept="image/*"
          required={!art}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) setPreview(URL.createObjectURL(f));
          }}
        />
        <span className="hint">Straight-on photo in daylight, cropped to the edges of the piece.</span>
      </div>
      <div className="field"><label htmlFor="title">Title</label><input id="title" name="title" defaultValue={art?.title} required /></div>
      <div className="field"><label htmlFor="medium">Medium</label><input id="medium" name="medium" defaultValue={art?.medium} placeholder="Graphite on paper" required /></div>
      <div className="row2">
        <div className="field"><label htmlFor="size">Size</label><input id="size" name="size" defaultValue={art?.size ?? ""} placeholder="18 × 24 in" /></div>
        <div className="field"><label htmlFor="year">Year</label><input id="year" name="year" inputMode="numeric" defaultValue={art?.year ?? ""} placeholder="2025" /></div>
      </div>
      <div className="row2">
        <div className="field">
          <label htmlFor="price">Price ($)</label>
          <input id="price" name="price" inputMode="decimal" defaultValue={art?.priceCents != null ? String(art.priceCents / 100) : ""} placeholder="450" />
          <span className="hint">Leave empty for “Price on request”.</span>
        </div>
        <div className="field">
          <label htmlFor="status">Status</label>
          <select id="status" name="status" defaultValue={art?.status ?? "AVAILABLE"}>
            <option value="AVAILABLE">Available</option>
            <option value="SOLD">Sold</option>
          </select>
        </div>
      </div>
      <div className="field"><label htmlFor="description">Description</label><textarea id="description" name="description" defaultValue={art?.description} placeholder="The story behind it, framing, materials…" /></div>
      <label className="check"><input type="checkbox" name="published" defaultChecked={art?.published ?? true} /> Show on the site</label>
      <label className="check"><input type="checkbox" name="featured" defaultChecked={art?.featured ?? false} /> Feature on the home page</label>
      {error && <p className="notice error">{error}</p>}
      <div><button className="btn" disabled={busy}>{busy ? "Saving…" : art ? "Save changes" : "Add piece"}</button></div>
    </form>
  );
}
