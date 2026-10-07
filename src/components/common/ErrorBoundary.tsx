import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl text-center">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#0066FF] flex items-center justify-center font-black text-2xl mx-auto mb-4">
              SE
            </div>
            <h2 className="text-xl font-black text-slate-900 mb-2">
              SWAHILI EARN
            </h2>
            <p className="text-xs text-slate-600 mb-6 leading-relaxed">
              Kuna hitilafu imetokea wakati wa kupakia. Tafadhali bonyeza kitufe hapa chini kufungua upya.
            </p>
            <button
              onClick={() => {
                localStorage.removeItem('swahili_earn_token');
                window.location.reload();
              }}
              className="w-full py-3 rounded-xl bg-[#0066FF] hover:bg-[#0052CC] text-white text-xs font-bold transition shadow-md shadow-blue-500/20 cursor-pointer"
            >
              Fungua Upya Ukurasa (Refresh)
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
