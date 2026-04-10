"use client";

import { useEffect, useMemo } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type AuthSessionRedirectProps = {
  to: string;
};

export function AuthSessionRedirect({ to }: AuthSessionRedirectProps) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  useEffect(() => {
    let isMounted = true;

    async function syncSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!isMounted || !session) {
        return;
      }

      window.location.replace(to);
    }

    void syncSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted || !session) {
        return;
      }

      if (event === "SIGNED_IN" || event === "INITIAL_SESSION") {
        window.location.replace(to);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, to]);

  return null;
}
