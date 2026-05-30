const floatingSeals = [
  { left: "6%", top: "18%", delay: "0s", duration: "11s", size: "1.25rem" },
  { left: "18%", top: "72%", delay: "2.5s", duration: "13s", size: "1rem" },
  { left: "38%", top: "10%", delay: "1.2s", duration: "12s", size: "1.1rem" },
  { left: "62%", top: "66%", delay: "3.6s", duration: "14s", size: "1.35rem" },
  { left: "82%", top: "24%", delay: "1.8s", duration: "10s", size: "1rem" },
  { left: "91%", top: "78%", delay: "4.4s", duration: "15s", size: "1.2rem" },
];

export function FloatingSeals() {
  return (
    <div aria-hidden="true" className="floating-seals">
      {floatingSeals.map((seal, index) => (
        <span
          className="floating-seal"
          key={`${seal.left}-${seal.top}`}
          style={{
            animationDelay: seal.delay,
            animationDuration: seal.duration,
            fontSize: seal.size,
            left: seal.left,
            top: seal.top,
          }}
        >
          {index % 2 === 0 ? "🦭" : "🌊"}
        </span>
      ))}
    </div>
  );
}
