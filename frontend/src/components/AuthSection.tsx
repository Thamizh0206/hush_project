import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, ArrowRight, Zap, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function AuthSection() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fn = isLogin ? api.login : api.register;
      const data = await fn(email, password);
      login(data.user_id, data.access_token);
      toast({ title: isLogin ? "Welcome back!" : "Account created!" });
    } catch (err: any) {
      toast({
        title: isLogin ? "Login failed" : "Registration failed",
        description: err.message || "Please check your credentials or try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-mesh flex items-center justify-center p-4 relative overflow-hidden noise-bg">
      {/* Ambient light effects */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px] animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-primary/3 blur-[100px] animate-float" style={{ animationDelay: "2s" }} />

      {/* Grid lines (decorative) */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `linear-gradient(hsl(38 92% 50%) 1px, transparent 1px), linear-gradient(90deg, hsl(38 92% 50%) 1px, transparent 1px)`,
        backgroundSize: '60px 60px'
      }} />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-3 mb-3">
            <motion.div
              className="w-12 h-12 rounded-2xl gradient-amber flex items-center justify-center glow-amber"
              whileHover={{ rotate: 15, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
              <Zap className="w-6 h-6 text-primary-foreground" />
            </motion.div>
            <h1 className="text-4xl font-bold tracking-tight text-gradient-amber">EduGen AI</h1>
          </div>
          <p className="text-muted-foreground text-sm tracking-widest uppercase font-mono">AI-Powered Learning</p>
        </motion.div>

        {/* Card */}
        <div className="surface-elevated rounded-2xl p-8">
          {/* Toggle */}
          <div className="flex rounded-xl bg-background p-1 mb-8 border border-border">
            {["Welcome Back", "Join EduGen AI"].map((label, i) => (
              <motion.button
                key={label}
                onClick={() => setIsLogin(i === 0)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 relative ${(i === 0 ? isLogin : !isLogin)
                  ? "text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
                whileTap={{ scale: 0.97 }}
              >
                {(i === 0 ? isLogin : !isLogin) && (
                  <motion.div
                    layoutId="auth-tab"
                    className="absolute inset-0 gradient-amber rounded-lg"
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
                <span className="relative z-10">{label}</span>
              </motion.button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.form
              key={isLogin ? "login" : "register"}
              initial={{ opacity: 0, x: isLogin ? -30 : 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isLogin ? 30 : -30 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  type="email"
                  placeholder="you@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 rounded-xl bg-background border-border focus:border-primary focus:ring-primary/20 text-foreground placeholder:text-muted-foreground"
                  required
                />
              </div>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-12 rounded-xl bg-background border-border focus:border-primary focus:ring-primary/20 text-foreground placeholder:text-muted-foreground"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <Button type="submit" variant="hero" size="lg" className="w-full mt-2" disabled={loading}>
                {loading ? (
                  <motion.span
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    Processing...
                  </motion.span>
                ) : (
                  <>
                    {isLogin ? "Sign In" : "Create Account"}
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            </motion.form>
          </AnimatePresence>

          {/* Decorative bottom */}
          <div className="mt-6 pt-4 border-t border-border text-center">
            <p className="text-xs text-muted-foreground font-mono tracking-wider">
              {isLogin ? "No account? " : "Already a member? "}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary hover:text-primary/80 transition-colors font-semibold"
              >
                {isLogin ? "Sign up →" : "Sign in →"}
              </button>
            </p>
          </div>
        </div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 flex justify-center gap-6 text-xs text-muted-foreground font-mono"
        >
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-success" /> Encrypted</span>
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-primary" /> AI-Powered</span>
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-primary" /> Adaptive</span>
        </motion.div>
      </motion.div>
    </div>
  );
}
