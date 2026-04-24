import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Briefcase, LogOut, Menu, Search, User, X } from "lucide-react";
import { useState, useEffect } from "react";
import ThemeToggle from "@/components/theme-toggle";

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (location.pathname === "/") {
      setSearchQuery(searchParams.get("search") || "");
    } else {
      setSearchQuery("");
    }
  }, [location.pathname, searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate("/");
    }
  };

  const isActive = (path: string) => location.pathname === path;

  const navLinkClass = (path: string) =>
    `text-sm font-medium transition-colors ${
      isActive(path)
        ? "text-primary"
        : "text-muted-foreground hover:text-foreground"
    }`;

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md max-md:backdrop-blur-none max-md:bg-background/95">
      <div className="container mt-2 flex h-14 items-center justify-between gap-4">
        {/* Left Links */}
        <div className="flex items-center gap-6 shrink-0">
          <Link
            to="/"
            className="flex items-center gap-2 font-bold text-xl text-foreground"
          >
            <img
              src="/stackhire.svg"
              alt=""
              className="md:hidden h-10 w-10 text-primary"
            />
            {/* <Briefcase className="md:hidden h-5 w-5 text-primary" /> */}
            <span className="max-md:hidden sm:inline-block">StackHire</span>
          </Link>
        </div>

        {/* Global Center Search Bar */}
        <div className="flex-1 max-w-lg hidden md:block">
          <form
            onSubmit={handleSearch}
            className="relative flex items-center w-full border border-border rounded-full bg-card shadow-lg focus-within:border-primary/50 transition-colors overflow-hidden"
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search job title, company, keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 bg-transparent pl-9 pr-10 text-sm text-foreground focus:outline-none placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center p-1.5 text-white bg-gradient-to-br from-indigo-500 to-violet-500 focus:outline-none  rounded-full transition-colors"
              title="Search jobs"
            >
              <Search className="h-5 w-5" />
            </button>
          </form>
        </div>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          <div className="hidden md:flex items-center gap-6 mr-4">
            {isAuthenticated && user?.role === "CANDIDATE" && (
              <Link
                to="/candidate/profile"
                className={navLinkClass("/candidate/profile")}
              >
                My Profile
              </Link>
            )}
            {isAuthenticated && user?.role === "RECRUITER" && (
              <Link
                to="/recruiter/dashboard"
                className={navLinkClass("/recruiter/dashboard")}
              >
                Dashboard
              </Link>
            )}
          </div>
          {isAuthenticated ? (
            <>
              {/* <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                {user?.email}
              </span> */}
              <button
                className="flex items-center gap-2 px-4 py-2.5 bg-transparent text-muted-foreground border border-border text-sm font-semibold rounded-xl hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 hover:-translate-y-0.5 active:scale-95 transition-all duration-150 cursor-pointer"
                onClick={logout}
              >
                <LogOut className="h-4 w-4 mr-0" />
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login">
                <button className="flex items-center gap-2 px-6 py-2.5 bg-transparent text-indigo-600 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-500/40 text-sm font-semibold rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-500/15 hover:border-indigo-400 dark:hover:border-indigo-400/60 hover:-translate-y-0.5 active:scale-95 transition-all duration-150 cursor-pointer">
                  Sign in
                </button>
              </Link>
              <Link to="/register">
                <button className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-br from-indigo-500 to-violet-500 text-white text-sm font-semibold rounded-xl hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-200 dark:hover:shadow-indigo-900/40 active:scale-95 transition-all duration-150 cursor-pointer">
                  Post a job
                </button>
              </Link>
            </>
          )}
          <ThemeToggle />
        </div>

        <div className="md:hidden flex items-center gap-4">
          {isAuthenticated && user?.role === "CANDIDATE" && (
            <Link
              to="/candidate/profile"
              className="block text-sm font-medium text-foreground"
              onClick={() => setMobileOpen(false)}
            >
              My Profile
            </Link>
          )}
          {isAuthenticated && user?.role === "RECRUITER" && (
            <Link
              to="/recruiter/dashboard"
              className="block text-sm font-medium text-foreground"
              onClick={() => setMobileOpen(false)}
            >
              Dashboard
            </Link>
          )}
          {isAuthenticated ? (
            <button
              className="flex items-center gap-2 px-4 py-2.5 bg-transparent text-muted-foreground border border-border text-sm font-semibold rounded-xl hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 hover:-translate-y-0.5 active:scale-95 transition-all duration-150 cursor-pointer"
              onClick={() => {
                logout();
                setMobileOpen(false);
              }}
            >
              <LogOut className="h-4 w-4 mr-0" /> Sign out
            </button>
          ) : (
            <div className="flex gap-2">
              <Link
                to="/login"
                className="flex-1"
                onClick={() => setMobileOpen(false)}
              >
                <Button variant="outline" size="sm" className="w-full">
                  Sign in
                </Button>
              </Link>
              <Link
                to="/register"
                className="flex-1"
                onClick={() => setMobileOpen(false)}
              >
                <Button size="sm" className="w-full">
                  Post a job
                </Button>
              </Link>
            </div>
          )}
          <ThemeToggle />
        </div>

        {/* <button
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button> */}
      </div>

      {/* {mobileOpen && (
        <div className="md:hidden border-t p-4 space-y-3">
          {isAuthenticated && user?.role === "CANDIDATE" && (
            <Link
              to="/candidate/profile"
              className="block text-sm font-medium text-foreground"
              onClick={() => setMobileOpen(false)}
            >
              My Profile
            </Link>
          )}
          {isAuthenticated && user?.role === "RECRUITER" && (
            <Link
              to="/recruiter/dashboard"
              className="block text-sm font-medium text-foreground"
              onClick={() => setMobileOpen(false)}
            >
              Dashboard
            </Link>
          )}
          {isAuthenticated ? (
            <button
              className="flex items-center gap-2 px-4 py-2.5 bg-transparent text-slate-500 border border-slate-200 text-sm font-semibold rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-200 hover:-translate-y-0.5 active:scale-95 transition-all duration-150 cursor-pointer"
              onClick={() => {
                logout();
                setMobileOpen(false);
              }}
            >
              <LogOut className="h-4 w-4 mr-2" /> Sign out
            </button>
          ) : (
            <div className="flex gap-2">
              <Link
                to="/login"
                className="flex-1"
                onClick={() => setMobileOpen(false)}
              >
                <Button variant="outline" size="sm" className="w-full">
                  Sign in
                </Button>
              </Link>
              <Link
                to="/register"
                className="flex-1"
                onClick={() => setMobileOpen(false)}
              >
                <Button size="sm" className="w-full">
                  Post a job
                </Button>
              </Link>
            </div>
          )}
        </div>
      )} */}
    </nav>
  );
};

export default Navbar;
