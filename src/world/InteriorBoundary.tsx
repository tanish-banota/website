import { Component } from 'react';
import type { ReactNode } from 'react';

type Props = { children: ReactNode; fallback: ReactNode; onError: () => void };
type State = { failed: boolean };

export class InteriorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(): void {
    this.props.onError();
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
