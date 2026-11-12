// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

// Invoker commands: <button commandfor="contents" command="show-modal"> opens the Contents <dialog>
// with zero JavaScript (Chrome 135+, Firefox 144+, Safari 26.2+). React 19.2 passes these lowercase
// attributes straight through to the DOM, but its types don't list them yet.
import "react";

declare module "react" {
  // Declaration merging must repeat React's own type parameter name, even though this half doesn't use it.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ButtonHTMLAttributes<T> {
    command?: string;
    commandfor?: string;
  }
}
