// Skeleton shown while a signed-in page loads. Mirrors the feed layout so nothing jumps.
export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading">
      <div className="page-head">
        <span className="sk" style={{ width: 160, height: 32 }} />
      </div>
      <div className="feed" style={{ marginTop: 20 }}>
        {[0, 1, 2].map((i) => (
          <div key={i} className="mcard">
            <div className="mcard-head">
              <span className="sk" style={{ width: 28, height: 28, borderRadius: 8 }} />
              <span className="sk" style={{ width: 120, height: 12 }} />
            </div>
            <span className="sk" style={{ width: "70%", height: 16 }} />
            <span className="sk" style={{ width: "90%", height: 12 }} />
          </div>
        ))}
      </div>
    </div>
  );
}
