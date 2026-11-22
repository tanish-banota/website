import { Component } from 'react';
import type { ReactNode } from 'react';

type Props = { children: ReactNode; fallback: ReactNode };

export class WorldErrorBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() { return { failed: true }; }

  componentDidCatch(error: Error) { console.error('The 3D experience could not start.', error); }

  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}
