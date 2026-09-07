import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[Carteles.Click ErrorBoundary] Error no capturado en renderizado:", error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = "/";
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div
          id="error-boundary-screen"
          className="min-h-screen w-full flex items-center justify-center p-6 bg-[#F8FAFC] text-[#0F172A] font-sans"
        >
          <div className="w-full max-w-md bg-white border border-[#E2E8F0] shadow-xl rounded-2xl p-6 sm:p-8 text-center space-y-6">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl font-bold font-heading text-[#0F172A] tracking-tight">
                Disculpá las molestias
              </h1>
              <p className="text-sm text-[#475569] leading-relaxed">
                Ha ocurrido un imprevisto al procesar la vista. El taller digital sigue en línea. Podés recargar la ventana para reanudar tu sesión de trabajo.
              </p>
            </div>

            {this.state.error && process.env.NODE_ENV !== "production" && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-left text-xs font-mono text-red-700 overflow-x-auto max-h-32">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#0055FF] hover:bg-[#0044CC] text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-500/20 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Recargar Aplicación</span>
              </button>

              <button
                type="button"
                onClick={this.handleGoHome}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0F172A] font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>Ir al Inicio</span>
              </button>
            </div>

            <div className="pt-2 text-[11px] text-[#94A3B8]">
              Carteles.Click · Soporte técnico directo: carteles.ploteos@gmail.com
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
