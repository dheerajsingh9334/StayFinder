interface LoaderProps {
  size?: "sm" | "md" | "lg";
  variant?: "spinner" | "dots";
  text?: string;
  fullScreen?: boolean;
}

export function Loader({
  size = "md",
  variant = "spinner",
  text,
  fullScreen = false,
}: LoaderProps) {
  const sizeClass = size !== "md" ? `loader-${size}` : "";

  const content = (
    <div
      className="loader-container"
      style={fullScreen ? { minHeight: "100vh" } : {}}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "var(--space-4)",
        }}
      >
        {variant === "spinner" ? (
          <div className={`loader ${sizeClass}`} />
        ) : (
          <div className="loader-dots">
            <div className="loader-dot" />
            <div className="loader-dot" />
            <div className="loader-dot" />
          </div>
        )}
        {text && (
          <p style={{ color: "var(--gray-500)", fontSize: "var(--text-sm)" }}>
            {text}
          </p>
        )}
      </div>
    </div>
  );

  return content;
}

export default Loader;

export function PageLoader() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "var(--space-4)",
        }}
      >
        <div className="loader loader-lg" />
        <p style={{ color: "var(--gray-500)" }}>Loading...</p>
      </div>
    </div>
  );
}

export function ButtonLoader() {
  return (
    <span
      className="loader loader-sm"
      style={{ borderTopColor: "currentColor" }}
    />
  );
}
