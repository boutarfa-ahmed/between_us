export default function Spinner({ size = "32px", color = "#ffffff" }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        border: `3px solid rgba(255,255,255,0.15)`,
        borderTopColor: color,
        borderRightColor: "transparent",
        borderBottomColor: "rgba(255,255,255,0.3)",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
        boxShadow: `0 0 10px rgba(255,255,255,0.2)`,
      }}
    />
  );
}
