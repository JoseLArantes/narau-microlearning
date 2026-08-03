"use client";

import * as React from "react";
import { markTodayViewed } from "@/server/actions/today";

export function MarkViewed({ itemId, enabled }: { itemId: string; enabled: boolean }): null {
  const fired = React.useRef(false);

  React.useEffect(() => {
    if (enabled && !fired.current) {
      fired.current = true;
      void markTodayViewed(itemId);
    }
  }, [enabled, itemId]);

  return null;
}
