import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";

interface Props {
  content: string;
}

export default function SummaryView({ content }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="prose prose-invert prose-sm max-w-none prose-headings:text-foreground prose-headings:font-bold prose-p:text-foreground/80 prose-strong:text-primary prose-blockquote:border-primary prose-blockquote:text-muted-foreground prose-li:text-foreground/80 prose-a:text-primary prose-code:text-primary prose-code:font-mono prose-code:bg-secondary prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded"
    >
      <ReactMarkdown>{content}</ReactMarkdown>
    </motion.div>
  );
}
