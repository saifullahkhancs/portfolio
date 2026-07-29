export function HangingCardAnimation() {
  return (
    <div className="hanging-scene" aria-label="Animated card falling onto a nail and settling">
      <div className="nail" aria-hidden="true">
        <span className="nail-head" />
        <span className="nail-shaft" />
      </div>
      <div className="suspension" aria-hidden="true">
        <span className="strip strip-left" />
        <span className="strip strip-right" />
        <span className="card-drop">
          <span className="hanging-card">
            <b>BUILD</b>
            <small>with purpose</small>
          </span>
        </span>
      </div>
      <span className="impact-ring" aria-hidden="true" />
    </div>
  );
}
