import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
  /** Changing this key resets the boundary (e.g. pass location.pathname) */
  resetKey?: string
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null })
    }
  }

  reset = () => this.setState({ error: null })

  render() {
    if (this.state.error) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#FF4757]/10 flex items-center justify-center mb-4">
            <AlertTriangle size={28} className="text-[#FF4757]" />
          </div>
          <h2 className="text-lg font-black text-white mb-2">Something went wrong</h2>
          <p className="text-sm text-[#555555] mb-1 max-w-xs leading-snug">
            {this.state.error.message || 'An unexpected error occurred.'}
          </p>
          <p className="text-xs text-[#444444] mb-6">Navigate away or tap retry to recover.</p>
          <button
            onClick={this.reset}
            className="flex items-center gap-2 bg-[#1A1A1A] hover:bg-[#222222] border border-[#2A2A2A] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all active:scale-95"
          >
            <RefreshCw size={14} />
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
