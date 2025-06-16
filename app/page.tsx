"use client";
import { useState } from "react";
import { Eye, EyeOff, Lock, Shield } from "lucide-react";
import { loginAction } from "@/lib/actions/adminActions";

const AdminPage = () => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const result = await loginAction(password);
      if (result) {
        setError("بيانات الاعتماد غير صالحة");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen flex items-center justify-center bg-neutral-900 p-4"
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-900/20 mb-4">
            <Shield className="h-8 w-8 text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">منطقة آمنة</h1>
          <p className="text-neutral-400">
            نظام إدارة بيانات الموردين والعملاء
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          className="bg-neutral-800 rounded-xl shadow-lg p-8 border border-neutral-700"
        >
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                كلمة مرور المسؤول
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-neutral-500" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="أدخل كلمة المرور"
                  className="w-full pl-10 pr-12 py-3 bg-neutral-700 border border-neutral-600 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  dir="rtl"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-neutral-400 hover:text-neutral-300" />
                  ) : (
                    <Eye className="h-5 w-5 text-neutral-400 hover:text-neutral-300" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-900/30 text-red-300 rounded-lg text-sm border border-red-800/50">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`cursor-pointer w-full py-3 px-4 rounded-lg font-medium transition-all ${
                isLoading ? "bg-green-700" : "bg-green-600 hover:bg-green-700"
              } text-white shadow-lg hover:shadow-green-500/20 flex items-center justify-center`}
            >
              {isLoading ? (
                <>
                  جاري التحقق من الهوية
                  <svg
                    className="animate-spin mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </>
              ) : (
                "الوصول إلى النظام"
              )}
            </button>
          </div>
        </form>

        <div className="mt-8 text-center">
          <p className="text-xs text-neutral-500">
            هذا النظام مخصص للاستخدام الداخلي فقط. أي دخول غير مصرح به سيتعرض
            للمساءلة القانونية.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
