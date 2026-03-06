import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, ArrowRight, Brain, Lightbulb, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api, type QuizQuestion, type SubmitAnswerResponse } from "@/lib/api";
import confetti from "canvas-confetti";

interface Props {
  questions: QuizQuestion[];
  context: string;
}

export default function QuizEngine({ questions, context }: Props) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<SubmitAnswerResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [followUp, setFollowUp] = useState<QuizQuestion | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const current = followUp || questions[currentIdx];
  const isComplete = !followUp && currentIdx >= questions.length;

  const handleSubmit = async () => {
    if (!selected || !current) return;
    setLoading(true);
    try {
      const res = await api.submitAnswer(
        current.topic || "General",
        current.question,
        current.answer,
        selected,
        context
      );
      setResult(res);
      if (res.result === "correct") {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.7 }, colors: ['#F59E0B', '#D97706', '#FBBF24'] });
        setScore((s) => ({ correct: s.correct + 1, total: s.total + 1 }));
      } else {
        setScore((s) => ({ ...s, total: s.total + 1 }));
        if (res.followup) setFollowUp(res.followup);
      }
    } catch (err) {
      console.error("Submit failed, showing demo result", err);
      const isCorrect = selected.startsWith(current.answer);
      const demoResult: SubmitAnswerResponse = {
        result: isCorrect ? "correct" : "wrong",
        followup: isCorrect ? undefined : {
          question: `Let's rethink: What makes the other options less suitable?`,
          options: current.options,
          answer: current.answer,
          explanation: current.explanation,
          topic: current.topic,
        },
      };
      setResult(demoResult);
      if (isCorrect) {
        setScore((s) => ({ correct: s.correct + 1, total: s.total + 1 }));
      } else {
        setScore((s) => ({ ...s, total: s.total + 1 }));
        if (demoResult.followup) setFollowUp(demoResult.followup);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    setSelected(null);
    setResult(null);
    if (followUp) {
      setFollowUp(null);
    } else {
      setCurrentIdx((i) => i + 1);
    }
  };

  if (isComplete) {
    const pct = score.total ? Math.round((score.correct / score.total) * 100) : 0;
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="surface-elevated rounded-2xl p-8 text-center"
      >
        <motion.div
          className="w-20 h-20 rounded-3xl gradient-amber mx-auto mb-4 flex items-center justify-center glow-amber"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          <Trophy className="w-10 h-10 text-primary-foreground" />
        </motion.div>
        <h3 className="text-2xl font-bold text-foreground mb-1">Quiz Complete!</h3>
        <motion.p
          className="text-4xl font-bold text-gradient-amber mb-1 font-mono"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          {score.correct}/{score.total}
        </motion.p>
        <p className="text-sm text-muted-foreground font-mono mb-4">+{pct * 2} XP earned</p>
        <div className="w-full h-3 rounded-full bg-secondary overflow-hidden">
          <motion.div
            className="h-full rounded-full gradient-amber"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      </motion.div>
    );
  }

  if (!current) return null;

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="flex items-center justify-between text-xs text-muted-foreground font-mono mb-2">
        <span>Q{currentIdx + 1}/{questions.length}{followUp ? " · Follow-up" : ""}</span>
        <span className="text-primary">{score.correct}/{score.total} ✓</span>
      </div>
      <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden">
        <motion.div
          className="h-full rounded-full gradient-amber"
          animate={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current.question}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          {followUp && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="flex items-center gap-2 text-xs text-primary bg-accent rounded-lg px-3 py-2 mb-3 font-mono"
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>Let's try a different angle</span>
            </motion.div>
          )}

          <h3 className="text-base font-semibold text-foreground mb-5 leading-relaxed">
            {current.question}
          </h3>

          <div className="space-y-2.5">
            {current.options.map((opt, i) => {
              const letter = String.fromCharCode(65 + i);
              const isSelected = selected === opt;
              const showResult = result !== null;
              const isCorrectAnswer = showResult && result.result === "correct" && isSelected;
              const isWrongAnswer = showResult && result.result === "wrong" && isSelected;

              return (
                <motion.button
                  key={opt}
                  onClick={() => !result && setSelected(opt)}
                  whileHover={!result ? { scale: 1.01, x: 4 } : {}}
                  whileTap={!result ? { scale: 0.99 } : {}}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-3 ${isCorrectAnswer
                    ? "border-success bg-success/10"
                    : isWrongAnswer
                      ? "border-destructive bg-destructive/10"
                      : isSelected
                        ? "border-primary bg-primary/10 glow-amber"
                        : "border-border bg-card hover:border-primary/30 hover:bg-secondary"
                    }`}
                  disabled={!!result}
                >
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold font-mono flex-shrink-0 transition-all ${isSelected ? "gradient-amber text-primary-foreground" : "bg-secondary text-secondary-foreground"
                    }`}>
                    {letter}
                  </span>
                  <span className="text-sm text-foreground">{opt}</span>
                  {isCorrectAnswer && <CheckCircle2 className="w-5 h-5 text-success ml-auto" />}
                  {isWrongAnswer && <XCircle className="w-5 h-5 text-destructive ml-auto" />}
                </motion.button>
              );
            })}
          </div>

          {/* Feedback */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className={`mt-4 p-4 rounded-xl border ${result.result === "correct" ? "bg-success/5 border-success/20" : "bg-destructive/5 border-destructive/20"
                  }`}
              >
                <p className="text-sm text-foreground">{result.followup?.explanation || current.explanation}</p>
                {result.result === "correct" && (
                  <p className="text-xs text-primary font-mono mt-2">+25 XP</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div className="flex justify-end mt-5 gap-2">
            {!result ? (
              <Button variant="hero" onClick={handleSubmit} disabled={!selected || loading}>
                {loading ? "Checking..." : "Submit"}
              </Button>
            ) : (
              <Button variant="hero" onClick={handleNext} className="gap-2">
                {currentIdx + 1 >= questions.length && !followUp ? "See Results" : "Next"}
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
