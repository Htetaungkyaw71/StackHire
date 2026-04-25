import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, ChevronLeft } from "lucide-react";

type Step = "email" | "otp" | "password" | "success";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState<Step>("email");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.auth.forgotPassword(email);
      toast({
        title: "Code sent",
        description: "Check your email for the reset code",
      });
      setStep("otp");
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast({
        title: "Invalid code",
        description: "Please enter a 6-digit code",
        variant: "destructive",
      });
      return;
    }
    setStep("password");
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Please make sure both password fields are the same",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await api.auth.resetPassword(email, otp, newPassword);
      toast({
        title: "Success",
        description: "Your password has been reset",
      });
      setStep("success");
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    try {
      await api.auth.forgotPassword(email);
      toast({
        title: "Code resent",
        description: "Check your email for the new code",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (step) {
      case "email":
        return "Reset your password";
      case "otp":
        return "Verify your identity";
      case "password":
        return "Create new password";
      case "success":
        return "Password reset";
      default:
        return "Reset your password";
    }
  };

  const getDescription = () => {
    switch (step) {
      case "email":
        return "Enter the email address associated with your account";
      case "otp":
        return "Enter the code we sent to your email";
      case "password":
        return "Create a new strong password";
      case "success":
        return "Your password has been successfully reset";
      default:
        return "";
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 bg-background">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground">{getTitle()}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {getDescription()}
          </p>
        </div>

        <div className="bg-card border rounded-lg p-6">
          {step === "success" ? (
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-green-600 dark:text-green-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-4">
                  You can now sign in with your new password
                </p>
                <Button onClick={() => navigate("/login")} className="w-full">
                  Back to login
                </Button>
              </div>
            </div>
          ) : (
            <form
              onSubmit={
                step === "email"
                  ? handleEmailSubmit
                  : step === "otp"
                    ? handleOTPSubmit
                    : handlePasswordSubmit
              }
              className="space-y-4"
            >
              {step === "email" && (
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    disabled={step !== "email"}
                  />
                </div>
              )}

              {step === "otp" && (
                <div className="space-y-2">
                  <Label htmlFor="otp">Verification Code</Label>
                  <Input
                    id="otp"
                    type="text"
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    required
                    placeholder="000000"
                    maxLength={6}
                    className="text-center text-2xl font-bold tracking-widest"
                  />
                  <p className="text-xs text-muted-foreground text-center">
                    Check your email for the 6-digit code
                  </p>
                </div>
              )}

              {step === "password" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <div className="relative">
                      <Input
                        id="new-password"
                        type={showPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        minLength={6}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        minLength={6}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground"
                        aria-label={
                          showConfirmPassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {confirmPassword && newPassword !== confirmPassword && (
                      <p className="text-xs text-destructive">
                        Passwords do not match
                      </p>
                    )}
                  </div>
                </>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={loading || (step === "otp" && otp.length !== 6)}
              >
                {loading
                  ? "Loading..."
                  : step === "email"
                    ? "Send Reset Code"
                    : step === "otp"
                      ? "Verify Code"
                      : "Reset Password"}
              </Button>

              {step === "otp" && (
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-2">
                    Didn't receive a code?
                  </p>
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={loading}
                    className="h-auto px-4 text-violet-500 text-sm"
                  >
                    Resend code
                  </button>
                </div>
              )}

              {step !== "email" && (
                <button
                  type="button"
                  //   variant="secondary"
                  className="w-full flex items-center gap-1"
                  onClick={() => {
                    if (step === "password") {
                      setStep("otp");
                    } else if (step === "otp") {
                      setStep("email");
                      setOtp("");
                    }
                  }}
                  disabled={loading}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </button>
              )}
            </form>
          )}
        </div>

        {step === "email" && (
          <p className="text-center text-sm text-muted-foreground mt-6">
            Remember your password?{" "}
            <Link
              to="/login"
              className="text-primary font-medium hover:underline"
            >
              Sign in
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
