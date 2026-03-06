import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, ArrowLeft, Zap, CheckCircle2, Cpu, Brain, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api, type QuizQuestion } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface Props {
  onComplete: (summary: string, quiz: QuizQuestion[]) => void;
  onBack: () => void;
}

export default function UploadZone({ onComplete, onBack }: Props) {
  const [stage, setStage] = useState<"upload" | "processing" | "done">("upload");
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");
  const [fileName, setFileName] = useState("");
  const { toast } = useToast();

  const processFile = useCallback(async (file: File) => {
    setFileName(file.name);
    setStage("processing");
    setProgress(10);
    setStatusText("Uploading your notes...");

    try {
      const res = await api.upload(file);
      if (res.status === "ready" && res.data) {
        setStage("done");
        setProgress(100);
        setTimeout(() => onComplete(res.data!.summary, res.data!.questions), 800);
        return;
      }

      const doc_hash = res.doc_hash;
      if (!doc_hash) throw new Error("No document hash returned");

      setProgress(30);
      setStatusText("AI is reading your notes...");

      const poll = async () => {
        const statusRes = await api.getStatus(doc_hash);
        if (statusRes.status === "ready" && statusRes.data) {
          setStage("done");
          setProgress(100);
          setTimeout(() => onComplete(statusRes.data!.summary, statusRes.data!.questions), 800);
        } else if (statusRes.status === "error") {
          throw new Error("Processing error");
        } else {
          setProgress((p) => Math.min(p + 10, 90));
          setTimeout(poll, 3000);
        }
      };
      await poll();
    } catch (err: any) {
      console.error("Processing failed:", err);
      setStage("upload");
      setStatusText("");
      toast({
        title: "Processing Failed",
        description: err.message || "AI was unable to analyze this document. Please check the file and try again.",
        variant: "destructive"
      });
    }
  }, [onComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (files) => files[0] && processFile(files[0]),
    accept: { "application/pdf": [".pdf"], "text/plain": [".txt"] },
    maxFiles: 1,
    disabled: stage !== "upload",
  });

  const steps = [
    { icon: Upload, label: "Uploading file...", threshold: 10 },
    { icon: Cpu, label: "Parsing content...", threshold: 30 },
    { icon: Brain, label: "AI analyzing concepts...", threshold: 50 },
    { icon: Sparkles, label: "Generating quiz...", threshold: 80 },
  ];

  return (
    <div className="min-h-screen gradient-mesh flex flex-col noise-bg">
      {/* Header */}
      <header className="surface-glass sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-amber flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-gradient-amber">Upload Notes</span>
          </div>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-6">
        <AnimatePresence mode="wait">
          {stage === "upload" && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg"
            >
              <div
                {...getRootProps()}
                className={`surface-elevated rounded-3xl p-14 text-center cursor-pointer transition-all duration-300 border-2 border-dashed relative overflow-hidden ${isDragActive ? "border-primary glow-amber scale-[1.02]" : "border-border hover:border-primary/40"
                  }`}
              >
                <input {...getInputProps()} />
                {isDragActive && (
                  <div className="absolute inset-0 bg-primary/5 animate-pulse" />
                )}
                <motion.div
                  animate={isDragActive ? { y: -12, scale: 1.15, rotate: 5 } : { y: 0, scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="w-20 h-20 rounded-3xl bg-secondary mx-auto mb-6 flex items-center justify-center"
                >
                  <Upload className="w-10 h-10 text-primary" />
                </motion.div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  {isDragActive ? "Drop it here!" : "Drop your study materials"}
                </h3>
                <p className="text-muted-foreground text-sm font-mono">PDF or TXT files supported</p>
                <div className="mt-6 flex justify-center gap-3">
                  <span className="px-3 py-1 rounded-full bg-secondary text-xs font-mono text-secondary-foreground">.pdf</span>
                  <span className="px-3 py-1 rounded-full bg-secondary text-xs font-mono text-secondary-foreground">.txt</span>
                </div>
              </div>
            </motion.div>
          )}

          {stage === "processing" && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-lg surface-elevated rounded-3xl p-10"
            >
              <div className="text-center mb-8">
                <motion.div
                  className="w-16 h-16 rounded-2xl gradient-amber mx-auto mb-4 flex items-center justify-center glow-amber"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <Zap className="w-8 h-8 text-primary-foreground" />
                </motion.div>
                <div className="flex items-center gap-2 justify-center mb-2">
                  <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground font-mono truncate max-w-[200px]">{fileName}</span>
                </div>
                <motion.p
                  key={statusText}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-foreground font-semibold"
                >
                  {statusText}
                </motion.p>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 rounded-full bg-secondary overflow-hidden mb-2">
                <motion.div
                  className="h-full rounded-full gradient-amber"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
              <p className="text-xs text-muted-foreground font-mono text-right mb-6">{progress}%</p>

              {/* Steps */}
              <div className="space-y-3">
                {steps.map((step, i) => {
                  const active = progress >= step.threshold;
                  return (
                    <motion.div
                      key={step.label}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: active ? 1 : 0.3, x: 0 }}
                      transition={{ delay: i * 0.15 }}
                      className="flex items-center gap-3"
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${active ? "bg-primary/20" : "bg-secondary"}`}>
                        <step.icon className={`w-4 h-4 ${active ? "text-primary" : "text-muted-foreground"}`} />
                      </div>
                      <span className={`text-sm font-mono ${active ? "text-foreground" : "text-muted-foreground/50"}`}>{step.label}</span>
                      {active && <CheckCircle2 className="w-4 h-4 text-success ml-auto" />}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {stage === "done" && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <motion.div
                className="w-20 h-20 rounded-3xl bg-success/10 mx-auto mb-6 flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
              >
                <CheckCircle2 className="w-10 h-10 text-success" />
              </motion.div>
              <p className="text-xl font-bold text-foreground">Ready to learn!</p>
              <p className="text-sm text-muted-foreground font-mono mt-1">Launching study session...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
