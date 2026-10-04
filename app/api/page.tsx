export default function HomePage() {
  return (
    <main style={{ padding: 32, fontFamily: "system-ui" }}>
      <h1>Cinema City</h1>
      <p>Provider-backed cinema API is ready.</p>
      <ul>
        <li><code>/api/catalog</code></li>
        <li><code>/api/search?q=inception</code></li>
        <li><code>/api/meta?id=...&provider=...</code></li>
        <li><code>/api/episodes?id=...&season=1&provider=...</code></li>
        <li><code>/api/streams?link=...&type=movie&provider=...</code></li>
      </ul>
    </main>
  );
}
