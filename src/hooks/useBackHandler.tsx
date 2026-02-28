import { useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export const useBackHandler = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const backCountRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const neverAskRef = useRef(localStorage.getItem("tv3_never_ask_exit") === "true");

  const handlePopState = useCallback(
    (e: PopStateEvent) => {
      e.preventDefault();

      // If not on home, go home
      if (location.pathname !== "/") {
        navigate("/", { replace: true });
        return;
      }

      // On home page
      if (neverAskRef.current) {
        // User chose never ask again - just let them leave
        return;
      }

      backCountRef.current += 1;

      if (backCountRef.current >= 2) {
        const neverAsk = window.confirm(
          "Are you sure you want to exit?\n\nPress OK to exit, Cancel to stay."
        );
        if (neverAsk) {
          const dontAsk = window.confirm("Never ask again?");
          if (dontAsk) {
            localStorage.setItem("tv3_never_ask_exit", "true");
            neverAskRef.current = true;
          }
        }
        backCountRef.current = 0;
      } else {
        // Push state back so user can press again
        window.history.pushState(null, "", window.location.href);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          backCountRef.current = 0;
        }, 2000);
      }
    },
    [location.pathname, navigate]
  );

  useEffect(() => {
    // Push initial state
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [handlePopState]);
};
