"use client";

// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import { Component, type ErrorInfo, type ReactNode } from "react";

type GuardProps = { fallback: ReactNode; children: ReactNode };
type GuardState = { broken: boolean };

/**
 * Error boundary around WebGL. If a GPU refuses a context or an asset fails, the
 * visitor sees a composed still-life note instead of a blank hole or a crashed page.
 */
export class SceneGuard extends Component<GuardProps, GuardState> {
  state: GuardState = { broken: false };

  static getDerivedStateFromError(): GuardState {
    return { broken: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (process.env.NODE_ENV !== "production") console.warn("[Aetheria 3D]", error, info.componentStack);
  }

  render() {
    return this.state.broken ? this.props.fallback : this.props.children;
  }
}
