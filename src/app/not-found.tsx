import Link from "next/link";

export default function NotFound() {
  return (
    <main className="wrap page">
      <h1>Not here</h1>
      <p className="prose">That page or piece doesn't exist anymore.</p>
      <p style={{ marginTop: 24 }}><Link className="btn" href="/work">See the work</Link></p>
    </main>
  );
}
