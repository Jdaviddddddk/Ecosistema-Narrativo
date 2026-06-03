import { Component, type ReactNode } from "react";

interface Props { children: ReactNode; }
interface State { error: Error | null; }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px", fontFamily: "'Montserrat', sans-serif", background: "#fafafa" }}>
          <p style={{ fontSize: "40px", marginBottom: "16px" }}>⚠️</p>
          <h2 style={{ fontFamily: "'Sono', sans-serif", fontSize: "22px", color: "#1a1a1a", marginBottom: "8px" }}>Algo salió mal</h2>
          <p style={{ fontSize: "13px", color: "#888", marginBottom: "24px", maxWidth: "400px", textAlign: "center" }}>
            {this.state.error.message || "Error inesperado al cargar la página."}
          </p>
          <button
            onClick={() => window.location.href = "/"}
            style={{ padding: "10px 24px", borderRadius: "100px", background: "#004FCD", color: "#fff", border: "none", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}
          >
            Volver al inicio
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
