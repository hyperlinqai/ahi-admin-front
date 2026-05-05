import { useState } from "react";
import api from "../api/axios";
import { Link, useSearchParams } from "react-router-dom";
import { Loader2, Lock, ArrowLeft, CheckCircle, AlertTriangle } from "lucide-react";
import { AxiosError } from "axios";

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters long");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            await api.post("/auth/reset-password", { 
                token, 
                newPassword: password 
            });
            setIsSuccess(true);
        } catch (err) {
            if (err instanceof AxiosError && err.response) {
                setError(err.response.data.message || "Failed to reset password");
            } else {
                setError("An error occurred. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#fafaf8] px-6 py-12">
                <div className="w-full max-w-[400px] text-center">
                    <div className="mb-6 flex justify-center">
                        <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center">
                            <AlertTriangle className="h-8 w-8 text-orange-500" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                        Invalid Link
                    </h2>
                    <p className="mt-3 text-sm text-gray-500 leading-relaxed">
                        This password reset link is invalid or has expired.
                    </p>
                    <Link
                        to="/forgot-password"
                        className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#c49a3c] hover:text-[#a17f2e] transition-colors"
                    >
                        Request a new link
                    </Link>
                </div>
            </div>
        );
    }

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
                </div>
            </div>

            {/* Right Panel — Reset Password Form */}
            <div className="flex flex-1 items-center justify-center bg-[#fafaf8] px-6 py-12">
                <div className="w-full max-w-[400px]">
                    <div className="lg:hidden text-center mb-10">
                        <div className="mb-4 flex justify-center">
                            <img src="/ahi-logo.svg" alt="Ahi Jewellery" className="h-[100px] w-auto" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Ahi Jewellery</h1>
                    </div>

                    {isSuccess ? (
                        <div className="text-center">
                            <div className="mb-6 flex justify-center">
                                <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
                                    <CheckCircle className="h-8 w-8 text-green-500" />
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                                Password reset complete
                            </h2>
                            <p className="mt-3 text-sm text-gray-500 leading-relaxed">
                                Your password has been successfully reset. You can now sign in with your new password.
                            </p>
                            <Link
                                to="/login"
                                className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#c49a3c] hover:text-[#a17f2e] transition-colors"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to login
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                                    Set new password
                                </h2>
                                <p className="mt-1.5 text-sm text-gray-400">
                                    Choose a strong password for your account.
                                </p>
                            </div>

                            <form className="space-y-5" onSubmit={handleSubmit}>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                                            <Lock className="h-4 w-4 text-gray-300" />
                                        </div>
                                        <input
                                            id="password"
                                            name="password"
                                            type="password"
                                            required
                                            className="block w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-300 focus:border-[#c49a3c] focus:outline-none focus:ring-2 focus:ring-[#c49a3c]/20 transition-all"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                        Confirm New Password
                                    </label>
                                    <div className="relative">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                                            <Lock className="h-4 w-4 text-gray-300" />
                                        </div>
                                        <input
                                            id="confirm-password"
                                            name="confirm-password"
                                            type="password"
                                            required
                                            className="block w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-300 focus:border-[#c49a3c] focus:outline-none focus:ring-2 focus:ring-[#c49a3c]/20 transition-all"
                                            placeholder="••••••••"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                        />
                                    </div>
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
                                        "Reset password"
                                    )}
                                </button>
                            </form>
                        </>
                    )}

                    <p className="mt-8 text-center text-[10px] text-gray-300 uppercase tracking-widest">
                        Ahi Jewellery © {new Date().getFullYear()}
                    </p>
                </div>
            </div>
        </div>
    );
}
