import { useState } from "react";
import { useAuthStore } from "../store/authStore";
import api from "../api/axios";
import { Link, Navigate, useLocation } from "react-router-dom";
import { Loader2, Mail, Lock } from "lucide-react";
import { AxiosError } from "axios";
import { AuthResponse } from "../types";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const { setAuth, isAuthenticated, user, logout } = useAuthStore();
    const location = useLocation();

    // Only redirect when this is a valid admin session (avoids / ↔ /login loop with USER tokens)
    if (isAuthenticated && user?.role === "ADMIN") {
        const from = location.state?.from?.pathname || "/";
        const safeFrom = from === "/login" ? "/" : from;
        return <Navigate to={safeFrom} replace />;
    }

    if (isAuthenticated && user?.role !== "ADMIN") {
        logout();
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const response = await api.post<AuthResponse>("/auth/login", {
                email,
                password,
            });

            const { user, accessToken } = response.data.data;
            setAuth(user, accessToken);
        } catch (err) {
            if (err instanceof AxiosError && err.response) {
                setError(err.response.data.message || "Invalid credentials");
            } else {
                setError("An error occurred during login. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen">
            {/* Left Panel — Brand Side */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center"
                style={{
                    background: "linear-gradient(135deg, #1a1207 0%, #2d1f0e 30%, #3d2914 60%, #1a1207 100%)",
                }}
            >
                {/* Subtle pattern overlay */}
                <div className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: `radial-gradient(circle at 25% 25%, #d4a853 1px, transparent 1px),
                                         radial-gradient(circle at 75% 75%, #d4a853 1px, transparent 1px)`,
                        backgroundSize: "60px 60px",
                    }}
                />

                {/* Glow effect */}
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full opacity-20"
                    style={{ background: "radial-gradient(circle, #d4a853 0%, transparent 70%)" }}
                />

                <div className="relative z-10 text-center px-12 max-w-lg">
                    <div className="mb-8 flex justify-center">
                        <img src="/ahi-logo.svg" alt="Ahi Jewellery" className="h-[150px] w-auto drop-shadow-[0_8px_28px_rgba(212,168,83,0.22)]" />
                    </div>

                    <h1 className="text-4xl font-bold text-white tracking-tight mb-4">
                        Ahi Jewellery
                    </h1>
                    <p className="text-lg text-[#d4a853]/70 font-medium mb-2">
                        Admin Dashboard
                    </p>
                    <p className="text-sm text-white/40 leading-relaxed mt-6 max-w-sm mx-auto">
                        Manage your jewellery store, track orders, update inventory, and grow your business — all from one place.
                    </p>

                    {/* Decorative bottom accent */}
                    <div className="mt-12 flex items-center justify-center gap-3">
                        <div className="h-px w-12 bg-[#d4a853]/30" />
                        <div className="h-1.5 w-1.5 rounded-full bg-[#d4a853]/50" />
                        <div className="h-px w-12 bg-[#d4a853]/30" />
                    </div>
                </div>
            </div>

            {/* Right Panel — Login Form */}
            <div className="flex flex-1 items-center justify-center bg-[#fafaf8] px-6 py-12">
                <div className="w-full max-w-[400px]">
                    {/* Mobile brand header */}
                    <div className="lg:hidden text-center mb-10">
                        <div className="mb-4 flex justify-center">
                            <img src="/ahi-logo.svg" alt="Ahi Jewellery" className="h-[100px] w-auto" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Ahi Jewellery</h1>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                            Welcome back
                        </h2>
                        <p className="mt-1.5 text-sm text-gray-400">
                            Sign in to your admin account to continue
                        </p>
                    </div>

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                Email address
                            </label>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                                    <Mail className="h-4 w-4 text-gray-300" />
                                </div>
                                <input
                                    id="email-address"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="block w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-300 focus:border-[#c49a3c] focus:outline-none focus:ring-2 focus:ring-[#c49a3c]/20 transition-all"
                                    placeholder="admin@ahijewellery.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                                    <Lock className="h-4 w-4 text-gray-300" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    className="block w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-300 focus:border-[#c49a3c] focus:outline-none focus:ring-2 focus:ring-[#c49a3c]/20 transition-all"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-3.5 w-3.5 rounded border-gray-300 text-[#c49a3c] focus:ring-[#c49a3c]/30"
                                />
                                <label htmlFor="remember-me" className="ml-2 text-xs text-gray-500">
                                    Remember me
                                </label>
                            </div>
                            <Link
                                to="/forgot-password"
                                className="text-xs font-semibold text-[#c49a3c] hover:text-[#a17f2e] transition-colors"
                            >
                                Forgot password?
                            </Link>
                        </div>

                        {error && (
                            <div className="rounded-xl bg-red-50 px-4 py-3 border border-red-100">
                                <p className="text-xs font-medium text-red-500">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full rounded-xl py-3 px-4 text-sm font-semibold text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#c49a3c]/30 focus:ring-offset-2"
                            style={{
                                background: "linear-gradient(135deg, #d4a853 0%, #c49a3c 50%, #a17f2e 100%)",
                                boxShadow: "0 2px 8px rgba(196, 154, 60, 0.3)",
                            }}
                        >
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                            ) : (
                                "Sign in"
                            )}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-[10px] text-gray-300 uppercase tracking-widest">
                        Ahi Jewellery © {new Date().getFullYear()}
                    </p>
                </div>
            </div>
        </div>
    );
}
