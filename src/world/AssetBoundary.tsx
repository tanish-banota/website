import { Component } from 'react';
import type { ReactNode } from 'react';

type Props = { children: ReactNode; fallback: ReactNode; onError: () => void };

export class AssetBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() { return { failed: true }; }

  componentDidCatch(error: Error) {
    console.error('World asset failed; showing navigable fallback.', error);
    this.props.onError();
  }

  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}
