// Object monitor provides an inversion control between the core and UI logic.
//
// The idea is the following: both, a core component (logic) and UI component
// shares the same object (state), which is modified by the core component.
// Each time such modification occurs, the core component is required to
// notify the UI component about changes, and UI component should update the UI.
export interface ObjectMonitor {
  notifyChanged(): void;
}
