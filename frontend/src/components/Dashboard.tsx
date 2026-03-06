import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen, Upload, LogOut, Zap, TrendingUp, Target, Flame, Trophy, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { api, type ProgressData } from "@/lib/api";
import UploadZone from "./UploadZone";
import LearningView from "./LearningView";
import type { QuizQuestion } from "@/lib/api";

function CircularProgress({ value, size = 72 }: { value: number; size?: number }) {
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;
  const color = value >= 80 ? "hsl(var(--success))" : value >= 50 ? "hsl(var(--primary))" : "hsl(var(--destructive))";

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none"
        stroke="hsl(var(--secondary))"
        strokeWidth={strokeWidth}
      />
      <motion.circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      />
    </svg>
  );
}

function XPBar({ xp, maxXp }: { xp: number; maxXp: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
        <motion.div
          className="h-full rounded-full gradient-amber"
          initial={{ width: 0 }}
          animate={{ width: `${(xp / maxXp) * 100}%` }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
      <span className="text-xs font-mono text-muted-foreground">{xp}/{maxXp} XP</span>
    </div>
  );
}

export default function Dashboard() {
  const { logout } = useAuth();
  const [progress, setProgress] = useState<ProgressData>({});
  const [view, setView] = useState<"dashboard" | "upload" | "learning">("dashboard");
  const [learningData, setLearningData] = useState<{ summary: string; quiz: QuizQuestion[] } | null>(null);

  useEffect(() => {
    api.getProgress().then(setProgress).catch(() => {
      setProgress({});
    });
  }, []);

  const handleUploadComplete = (summary: string, quiz: QuizQuestion[]) => {
    setLearningData({ summary, quiz });
    setView("learning");
  };

  const handleRetestTopic = async (topic: string) => {
    try {
      const data = await api.retest(topic);
      setLearningData({
        summary: `# Review: ${topic}\n\nLet's reinforce your understanding of ${topic}.`,
        quiz: data.questions,
      });
      setView("learning");
    } catch {
      setLearningData({
        summary: `# Review: ${topic}\n\nLet's test your knowledge of **${topic}** with some focused questions.\n\n## Key Concepts\n- Core principles and foundations\n- Practical applications\n- Advanced patterns`,
        quiz: [
          { question: `What is the fundamental principle behind ${topic}?`, options: ["A) Option A", "B) Option B", "C) Option C", "D) Option D"], answer: "A", explanation: "Option A is correct based on the core principles." },
          { question: `Which approach is best for solving problems in ${topic}?`, options: ["A) Approach 1", "B) Approach 2", "C) Approach 3", "D) Approach 4"], answer: "C", explanation: "Approach 3 is optimized for this domain." },
        ],
      });
      setView("learning");
    }
  };

  if (view === "upload") return <UploadZone onComplete={handleUploadComplete} onBack={() => setView("dashboard")} />;
  if (view === "learning" && learningData) return <LearningView data={learningData} onBack={() => setView("dashboard")} />;

  const topics = Object.entries(progress);
  const avgMastery = topics.length ? Math.round(topics.reduce((a, [, v]) => a + v, 0) / topics.length) : 0;
  const level = Math.floor(avgMastery / 10) + 1;

  return (
    <div className="min-h-screen gradient-mesh noise-bg">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="surface-glass sticky top-0 z-50"
      >
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              className="w-9 h-9 rounded-xl gradient-amber flex items-center justify-center"
              whileHover={{ rotate: 15 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Zap className="w-4 h-4 text-primary-foreground" />
            </motion.div>
            <span className="text-lg font-bold tracking-tight text-gradient-amber">EduGen AI</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="hero" size="sm" onClick={() => setView("upload")} className="gap-2">
              <Upload className="w-4 h-4" />
              Upload
            </Button>
            <Button variant="ghost" size="icon" onClick={logout} className="text-muted-foreground hover:text-foreground">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Level & XP Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="surface-elevated rounded-2xl p-6 mb-6"
        >
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 rounded-2xl gradient-amber flex items-center justify-center glow-amber font-bold text-primary-foreground text-lg">
              {level}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h2 className="font-bold text-foreground">Level {level} Scholar</h2>
                <div className="flex items-center gap-1.5 text-primary text-sm font-mono">
                  <Flame className="w-4 h-4" />
                  <span>7 day streak</span>
                </div>
              </div>
              <XPBar xp={avgMastery * 12} maxXp={1000} />
            </div>
          </div>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          {[
            { icon: TrendingUp, label: "AVG MASTERY", value: `${avgMastery}%`, sub: avgMastery > 70 ? "Excellent" : "Keep going" },
            { icon: Target, label: "TOPICS", value: topics.length.toString(), sub: "Studied" },
            { icon: Trophy, label: "ACHIEVEMENTS", value: "3", sub: "Unlocked" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.08 }}
              className="surface-interactive rounded-2xl p-5 tilt-card"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-mono tracking-widest">{stat.label}</p>
                  <div className="flex items-baseline gap-2">
                    <motion.p
                      className="text-2xl font-bold text-foreground"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + i * 0.1 }}
                    >
                      {stat.value}
                    </motion.p>
                    <span className="text-xs text-muted-foreground">{stat.sub}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Topics Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-mono text-muted-foreground tracking-widest uppercase">Topic Mastery</h2>
            <span className="text-xs font-mono text-muted-foreground">{topics.length} topics</span>
          </div>
          {topics.length === 0 ? (
            <div className="surface-elevated rounded-2xl p-16 text-center">
              <motion.div
                className="w-20 h-20 rounded-3xl bg-secondary mx-auto mb-6 flex items-center justify-center"
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 3 }}
              >
                <BookOpen className="w-10 h-10 text-primary" />
              </motion.div>
              <h3 className="text-xl font-bold text-foreground mb-2">Start Learning</h3>
              <p className="text-muted-foreground text-sm mb-6 max-w-xs mx-auto">Upload your study materials and let AI generate adaptive quizzes</p>
              <Button variant="hero" size="lg" onClick={() => setView("upload")}>
                <Upload className="w-4 h-4 mr-2" /> Upload Notes
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {topics.map(([topic, mastery], i) => (
                <motion.button
                  key={topic}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.06 }}
                  onClick={() => handleRetestTopic(topic)}
                  className="surface-interactive rounded-2xl p-5 text-left tilt-card group cursor-pointer"
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors duration-300">
                        {topic}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className={`text-xs font-mono ${mastery >= 80 ? "text-success" : mastery >= 50 ? "text-primary" : "text-destructive"}`}>
                          {mastery >= 80 ? "Mastered" : mastery >= 50 ? "Learning" : "Needs work"}
                        </span>
                        <ChevronRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                    <div className="relative flex-shrink-0">
                      <CircularProgress value={mastery} size={60} />
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold font-mono text-foreground">
                        {mastery}%
                      </span>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
