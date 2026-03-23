import React from "react";

type Props = {
  children: React.ReactNode;
};

type State = {
  hasError: boolean;
  message: string;
};

export default class AppErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      message: error?.message || "Something went wrong",
    };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[AppErrorBoundary]", error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="page-container"
          style={{ paddingTop: "3rem", textAlign: "center" }}
        >
          <h2>Something went wrong</h2>
          <p style={{ color: "var(--gray-600)", marginBottom: "1rem" }}>
            The page crashed while rendering. Please reload.
          </p>
          <p
            style={{
              color: "var(--gray-500)",
              fontSize: "0.9rem",
              marginBottom: "1.5rem",
            }}
          >
            {this.state.message}
          </p>
          <button className="btn btn-primary" onClick={this.handleReload}>
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
