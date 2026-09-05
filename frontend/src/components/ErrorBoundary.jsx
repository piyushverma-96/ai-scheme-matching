import React from 'react';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F7F9FB] flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-2xl shadow-xl border border-[#E5E7EB] p-6 sm:p-8 space-y-5 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#FDF2F2] text-[#B3261E] border border-[#B3261E]/20 flex items-center justify-center mx-auto">
              <AlertCircle className="w-7 h-7" />
            </div>

            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#0B3B60]">
                Something went wrong
              </h2>
              <p className="text-xs sm:text-sm text-[#6B7280] mt-1">
                The application encountered an unexpected runtime error.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3.5 bg-[#F7F9FB] rounded-xl border border-[#E5E7EB] text-left">
                <p className="text-xs font-mono font-semibold text-[#B3261E] break-words">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#0B3B60] hover:bg-[#07263F] text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-xs transition-base cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reload Application</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
