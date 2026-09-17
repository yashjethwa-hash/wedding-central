/**
 * The record itself, drawn rather than exported.
 *
 * Kept in its own file so it can be swapped for a real `vinyl.png` later: the
 * only change needed is replacing the <svg> below with an <img>. Nothing about
 * the spin, the hover pause or the orbiting covers lives in here.
 */
export default function VinylRecord({ className = "" }: { className?: string }) {
  // Groove radii as fractions of the viewBox, tightening toward the label the
  // way they do on a real pressing.
  const grooves = [46, 43.5, 41, 38.5, 36, 33.5, 31, 28.5, 26];

  return (
    <svg viewBox="0 0 100 100" className={className} role="img" aria-label="Spinning record">
      <defs>
        {/* The sheen that makes it read as vinyl rather than a flat disc. */}
        <linearGradient id="vinyl-sheen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6b2340" />
          <stop offset="38%" stopColor="#2c0917" />
          <stop offset="55%" stopColor="#4a0f28" />
          <stop offset="100%" stopColor="#1d0610" />
        </linearGradient>
      </defs>

      <circle cx="50" cy="50" r="49" fill="url(#vinyl-sheen)" />
      <circle cx="50" cy="50" r="49" fill="none" stroke="#fef5dc" strokeWidth="0.6" opacity="0.35" />

      {grooves.map((r, index) => (
        <circle
          key={r}
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="#fef5dc"
          strokeWidth="0.35"
          opacity={index % 2 === 0 ? 0.16 : 0.09}
        />
      ))}

      {/* Centre label */}
      <circle cx="50" cy="50" r="19" fill="#b2be85" />
      <circle cx="50" cy="50" r="19" fill="none" stroke="#fef5dc" strokeWidth="0.5" opacity="0.5" />

      <text
        x="50"
        y="44"
        textAnchor="middle"
        fill="#4a0f28"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="6.4"
        fontStyle="italic"
      >
        Wedding
      </text>
      <text
        x="50"
        y="52"
        textAnchor="middle"
        fill="#4a0f28"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="6.4"
        fontStyle="italic"
      >
        Central
      </text>
      <text
        x="50"
        y="60.5"
        textAnchor="middle"
        fill="#4a0f28"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fontSize="3"
        letterSpacing="0.6"
        opacity="0.75"
      >
        SANGEET SIDE A
      </text>

      {/* Spindle hole, punched through to the dark centre. */}
      <circle cx="50" cy="50" r="2.6" fill="#1d0610" />
    </svg>
  );
}
