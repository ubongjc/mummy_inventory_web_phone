"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogIn, Mail, Lock, AlertCircle, Home } from "lucide-react";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate fields
    const newFieldErrors = {
      email: "",
      password: "",
    };
    let hasErrors = false;

    if (!email || email.trim().length === 0) {
      newFieldErrors.email = "Email is required";
      hasErrors = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newFieldErrors.email = "Please enter a valid email address";
      hasErrors = true;
    }

    if (!password || password.length === 0) {
      newFieldErrors.password = "Password is required";
      hasErrors = true;
    }

    setFieldErrors(newFieldErrors);

    if (hasErrors) {
      const errorMessages = [];
      if (newFieldErrors.email) {
        errorMessages.push(newFieldErrors.email);
      }
      if (newFieldErrors.password) {
        errorMessages.push(newFieldErrors.password);
      }
      setError(errorMessages.join(". "));
      return;
    }

    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else if (result?.ok) {
        // Redirect to dashboard after successful sign in
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: any) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-3 md:p-4">
      {/* Back to Home Link */}
      <Link
        href="/"
        className="fixed top-2 left-2 md:top-4 md:left-4 flex items-center gap-2 px-6 py-4 md:px-8 md:py-5 bg-white text-gray-700 hover:text-blue-600 rounded-lg shadow-md hover:shadow-lg transition-all font-semibold text-base md:text-lg"
      >
        <Home className="w-8 h-8 md:w-10 md:h-10" />
        <span className="hidden sm:inline">Back to Home</span>
      </Link>

      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-4 md:mb-8">
          <div className="inline-block p-3 md:p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl md:rounded-2xl shadow-lg mb-2 md:mb-4">
            <LogIn className="w-8 h-8 md:w-12 md:h-12 text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-black mb-1 md:mb-2">Welcome Back</h1>
          <p className="text-sm md:text-base text-gray-600">Sign in to your rental management account</p>
        </div>

        {/* Sign In Form */}
        <div className="bg-white rounded-xl md:rounded-2xl shadow-xl p-4 md:p-8 border border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-black mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    // Clear field error when user starts typing
                    if (fieldErrors.email) {
                      setFieldErrors((prev) => ({ ...prev, email: "" }));
                    }
                  }}
                  className={`w-full pl-11 pr-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black font-medium transition-all ${
                    fieldErrors.email ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                  }`}
                />
              </div>
              {fieldErrors.email && (
                <div className="mt-1 bg-red-50 border border-red-200 rounded p-2">
                  <p className="text-xs text-red-700 font-medium">{fieldErrors.email}</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    // Clear field error when user starts typing
                    if (fieldErrors.password) {
                      setFieldErrors((prev) => ({ ...prev, password: "" }));
                    }
                  }}
                  className={`w-full pl-11 pr-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black font-medium transition-all ${
                    fieldErrors.password ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                  }`}
                />
              </div>
              {fieldErrors.password && (
                <div className="mt-1 bg-red-50 border border-red-200 rounded p-2">
                  <p className="text-xs text-red-700 font-medium">{fieldErrors.password}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-sm">
              <Link
                href="/auth/forgot-password"
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 md:py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/sign-up"
                className="text-blue-600 hover:text-blue-700 font-bold"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
