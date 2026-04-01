import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Briefcase, LogOut, User, Menu, X } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navLinkClass = (path: string) =>
    `text-sm font-medium transition-colors ${
      isActive(path) ? "text-primary" : "text-muted-foreground hover:text-foreground"
    }`;

  return (
    <nav className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur-md">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg text-foreground">
            <Briefcase className="h-5 w-5 text-primary" />
            <span>JobFlow</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/jobs" className={navLinkClass("/jobs")}>
              Offers
            </Link>
            {isAuthenticated && user?.role === "CANDIDATE" && (
              <Link to="/candidate/profile" className={navLinkClass("/candidate/profile")}>
                My Profile
              </Link>
            )}
            {isAuthenticated && user?.role === "RECRUITER" && (
              <Link to="/recruiter/dashboard" className={navLinkClass("/recruiter/dashboard")}>
                Dashboard
              </Link>
            )}
          </div>
        </div>

        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                {user?.email}
              </span>
              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4 mr-1" />
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">Sign in</Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="font-semibold">Post a job</Button>
              </Link>
            </>
          )}
        </div>

        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t bg-card p-4 space-y-3">
          <Link to="/jobs" className="block text-sm font-medium text-foreground" onClick={() => setMobileOpen(false)}>
            Offers
          </Link>
          {isAuthenticated && user?.role === "CANDIDATE" && (
            <Link to="/candidate/profile" className="block text-sm font-medium text-foreground" onClick={() => setMobileOpen(false)}>
              My Profile
            </Link>
          )}
          {isAuthenticated && user?.role === "RECRUITER" && (
            <Link to="/recruiter/dashboard" className="block text-sm font-medium text-foreground" onClick={() => setMobileOpen(false)}>
              Dashboard
            </Link>
          )}
          {isAuthenticated ? (
            <Button variant="ghost" size="sm" onClick={() => { logout(); setMobileOpen(false); }} className="w-full justify-start">
              <LogOut className="h-4 w-4 mr-2" /> Sign out
            </Button>
          ) : (
            <div className="flex gap-2">
              <Link to="/login" className="flex-1" onClick={() => setMobileOpen(false)}>
                <Button variant="outline" size="sm" className="w-full">Sign in</Button>
              </Link>
              <Link to="/register" className="flex-1" onClick={() => setMobileOpen(false)}>
                <Button size="sm" className="w-full">Post a job</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
