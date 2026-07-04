type EmblemProps = {
  className?: string;
  color?: "white" | "blue";
  showMotto?: boolean;
};

export default function AshokaEmblem({
  className = "h-16 w-16",
  color = "blue",
  showMotto = false,
}: EmblemProps) {
  const fill = color === "white" ? "#FFFFFF" : "#0a2a6e";
  const mottoColor = color === "white" ? "text-white/90" : "text-[#0a2a6e]";

  return (
    <div className="flex flex-col items-center">
      <svg
        viewBox="0 0 96 112"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-hidden="true"
      >
        <path d="M48 4c-10.8 0-19.5 8.5-19.5 19 0 4.7 1.7 9 4.5 12.3H63c2.8-3.3 4.5-7.6 4.5-12.3C67.5 12.5 58.8 4 48 4Z" fill={fill} />
        <path d="M20 17.8c-8.2 1.8-13.8 9-13.8 17.4 0 8.7 6.1 16.2 14.5 17.8l7.2-15.9c-3.9-3.8-6.3-9.1-6.3-14.9 0-1.5.1-3 .4-4.4ZM76 17.8c.3 1.4.4 2.9.4 4.4 0 5.8-2.4 11.1-6.3 14.9L77.3 53c8.4-1.6 14.5-9.1 14.5-17.8 0-8.4-5.6-15.6-13.8-17.4Z" fill={fill} />
        <path d="M36.2 36.6h23.6l7.4 16.2H28.8l7.4-16.2Z" fill={fill} />
        <path d="M26.1 55.8h43.8l-3.8 7.6H29.9l-3.8-7.6ZM25.5 67.2h45v5.1h-45v-5.1Z" fill={fill} />
        <path d="M17.6 76.4h60.8v5.4H17.6v-5.4ZM11.4 86h73.2v4.8H11.4V86Z" fill={fill} />
        <path d="M22.8 93.7h50.4v4.7H22.8v-4.7ZM30.4 101.1h35.2v4.4H30.4v-4.4Z" fill={fill} />
        <circle cx="48" cy="82.7" r="8.5" fill="#fff" opacity=".92" />
        <circle cx="48" cy="82.7" r="7.1" stroke={fill} strokeWidth="1.8" />
        {Array.from({ length: 16 }).map((_, index) => {
          const angle = (index * 22.5 * Math.PI) / 180;
          const x = 48 + Math.cos(angle) * 6.6;
          const y = 82.7 + Math.sin(angle) * 6.6;
          return <path key={index} d={`M48 82.7L${x.toFixed(2)} ${y.toFixed(2)}`} stroke={fill} strokeWidth=".8" />;
        })}
        <circle cx="48" cy="82.7" r="1.5" fill={fill} />
        <path d="M31 82.3c-4.2-3.1-7.9-3-11.2 0 3.3 3 7 3.1 11.2 0ZM65 82.3c4.2-3.1 7.9-3 11.2 0-3.3 3-7 3.1-11.2 0Z" fill={fill} />
        <path d="M40 15.8c1.9-2.9 4.5-4.4 8-4.4s6.1 1.5 8 4.4c-2.1-.8-4.8-1.2-8-1.2s-5.9.4-8 1.2Z" fill="#fff" opacity=".72" />
        <path d="M39 23.8c1.9 2.4 4.9 3.8 9 3.8s7.1-1.4 9-3.8" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity=".72" />
        <path d="M35.3 46.4h25.4M32.6 52h30.8M33.5 62.9h29M31.2 72.3h33.6" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" opacity=".34" />
      </svg>
      {showMotto && (
        <p className={`mt-2 text-[11px] font-medium tracking-wide ${mottoColor}`}>
          Satyameva Jayate
        </p>
      )}
    </div>
  );
}
