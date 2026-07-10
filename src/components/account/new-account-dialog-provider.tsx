"use client";

// NewAccountDialogProvider — exposes openNewAccountDialog() to anywhere in the
// dashboard tree (sidebar switcher, /accounts page, empty-state CTAs).
//
// The dialog itself is mounted ONCE here, so it doesn't get re-mounted as the
// user navigates between pages and lose mid-form state.
//
// The dialog uses useSearchParams() (to scope the URL after creating an
// account), so we wrap it in <Suspense> — otherwise prerender of /_not-found
// fails the production build.

import {
  createContext,
  Suspense,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { NewAccountDialog } from "./new-account-dialog";

type Ctx = {
  open: () => void;
  close: () => void;
  isOpen: boolean;
};

const NewAccountDialogCtx = createContext<Ctx | null>(null);

export function NewAccountDialogProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  return (
    <NewAccountDialogCtx.Provider value={{ open, close, isOpen }}>
      {children}
      <Suspense fallback={null}>
        <NewAccountDialog open={isOpen} onOpenChange={setIsOpen} />
      </Suspense>
    </NewAccountDialogCtx.Provider>
  );
}

export function useNewAccountDialog(): Ctx {
  const v = useContext(NewAccountDialogCtx);
  if (!v) {
    throw new Error(
      "useNewAccountDialog must be used inside <NewAccountDialogProvider>"
    );
  }
  return v;
}
