import { ReactNode, useEffect, useRef, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { User } from "@/lib/api";
import { resolveOnboardingPath } from "@/lib/onboarding";

interface ProtectedRouteProps {
  children: ReactNode;
  roles?: User["role"][];
  enforceOnboarding?: boolean;
}

const defaultPathByRole: Record<User["role"], string> = {
  ADMIN: "/",
  CANDIDATE: "/candidate/profile",
  RECRUITER: "/recruiter/dashboard",
};

const incompleteOnboardingPaths = new Set([
  "/candidate/profile",
  "/recruiter/profile",
  "/recruiter/create-company",
]);

const LoadingLine = ({
  animationKey,
  onAnimationEnd,
}: {
  animationKey: number;
  onAnimationEnd: () => void;
}) => (
  <div className="fixed left-0 right-0 top-0 z-50 h-1 rounded-full overflow-hidden bg-muted/40">
    <div
      key={animationKey}
      className="h-full bg-gradient-to-br from-indigo-500 to-violet-500"
      style={{
        width: "0%",
        animation: "protected-route-loading-line 1s linear forwards",
        transformOrigin: "left center",
      }}
      onAnimationEnd={onAnimationEnd}
    />
    <style>{`
      @keyframes protected-route-loading-line {
        0% {
          width: 0%;
        }
        100% {
          width: 100%;
        }
      }
    `}</style>
  </div>
);

const ProtectedRoute = ({
  children,
  roles,
  enforceOnboarding = false,
}: ProtectedRouteProps) => {
  const { isAuthenticated, user, isAuthReady } = useAuth();
  const location = useLocation();
  const [checking, setChecking] = useState(enforceOnboarding);
  const [redirectTo, setRedirectTo] = useState<string | null>(null);
  const [showLoadingLine, setShowLoadingLine] = useState(false);
  const [loadingLineFinished, setLoadingLineFinished] = useState(false);
  const [loadingLineAnimationKey, setLoadingLineAnimationKey] = useState(0);
  const previousShouldShowLoadingLine = useRef(false);

  const shouldShowLoadingLine = !isAuthReady || checking;

  useEffect(() => {
    const wasShowing = previousShouldShowLoadingLine.current;
    previousShouldShowLoadingLine.current = shouldShowLoadingLine;

    if (shouldShowLoadingLine && !wasShowing) {
      setShowLoadingLine(true);
      setLoadingLineFinished(false);
      setLoadingLineAnimationKey((current) => current + 1);
      return;
    }

    if (!shouldShowLoadingLine && loadingLineFinished) {
      setShowLoadingLine(false);
    }
  }, [loadingLineFinished, shouldShowLoadingLine]);

  useEffect(() => {
    let cancelled = false;

    const runChecks = async () => {
      if (!enforceOnboarding || !isAuthenticated || !user) {
        setChecking(false);
        setRedirectTo(null);
        return;
      }

      setChecking(true);
      const nextPath = await resolveOnboardingPath(user);
      if (cancelled) return;

      const isIncomplete = incompleteOnboardingPaths.has(nextPath);

      if (isIncomplete && nextPath !== location.pathname) {
        setRedirectTo(nextPath);
      } else {
        setRedirectTo(null);
      }

      setChecking(false);
    };

    void runChecks();

    return () => {
      cancelled = true;
    };
  }, [enforceOnboarding, isAuthenticated, location.pathname, user]);

  const handleLoadingLineAnimationEnd = () => {
    setLoadingLineFinished(true);

    if (!shouldShowLoadingLine) {
      setShowLoadingLine(false);
    }
  };

  if (shouldShowLoadingLine || showLoadingLine) {
    return (
      <>
        <LoadingLine
          animationKey={loadingLineAnimationKey}
          onAnimationEnd={handleLoadingLineAnimationEnd}
        />
        <div className="container py-10" />
      </>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to={defaultPathByRole[user.role]} replace />;
  }

  if (redirectTo) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
