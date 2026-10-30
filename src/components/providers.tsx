"use client";

import { HeroUIProvider } from "@heroui/react";
import type { ReactNode } from "react";

// HeroUI's provider uses React context, so it has to live in a client component.
export function Providers({ children }: { children: ReactNode }) {
  return <HeroUIProvider>{children}</HeroUIProvider>;
}
