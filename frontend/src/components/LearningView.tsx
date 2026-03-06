import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, Brain, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import SummaryView from "./SummaryView";
import QuizEngine from "./QuizEngine";
import type { QuizQuestion } from "@/lib/api";

interface Props {
  data: { summary: string; quiz: QuizQuestion[] };
  onBack: () => void;
}

export default function LearningView({ data, onBack }: Props) {
  return (
    <div className="min-h-screen gradient-mesh noise-bg">
      {/* Header */}
      <header className="surface-glass sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-amber flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-gradient-amber">Study Session</span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Summary */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="surface-elevated rounded-2xl p-6 overflow-auto max-h-[calc(100vh-120px)]"
          >
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
              <BookOpen className="w-4 h-4 text-primary" />
              <h2 className="font-semibold text-foreground text-sm font-mono tracking-wider uppercase">Summary</h2>
            </div>
            <SummaryView content={data.summary} />
          </motion.div>

          {/* Right: Quiz */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="surface-elevated rounded-2xl p-6 overflow-auto max-h-[calc(100vh-120px)]"
          >
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
              <Brain className="w-4 h-4 text-primary" />
              <h2 className="font-semibold text-foreground text-sm font-mono tracking-wider uppercase">Quiz</h2>
            </div>
            <QuizEngine questions={data.quiz} context={data.summary} />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
