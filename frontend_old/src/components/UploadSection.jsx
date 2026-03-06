import { useState, useRef } from 'react';
import { FileText, Upload, X, Wand2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export const UploadSection = ({ onUpload }) => {
    const [file, setFile] = useState(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef(null);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setIsDragOver(true);
        } else {
            setIsDragOver(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile.type === 'application/pdf' || droppedFile.type === 'text/plain') {
                setFile(droppedFile);
            }
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl mx-auto p-12 glass rounded-3xl"
        >
            <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => !file && fileInputRef.current?.click()}
                className={cn(
                    "relative flex flex-col items-center justify-center p-12 text-center rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer",
                    isDragOver ? "border-primary bg-primary/10 scale-[1.02]" : "border-white/20 hover:border-primary/50 hover:bg-primary/5",
                    file ? "border-accent/40 bg-accent/5" : ""
                )}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".txt,.pdf"
                    className="hidden"
                />

                <AnimatePresence mode="wait">
                    {!file ? (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center"
                        >
                            <div className="w-16 h-16 mb-6 flex items-center justify-center rounded-2xl bg-sky-500/10 border border-sky-500/20 group-hover:border-primary/40 transition-colors">
                                <Upload className="w-8 h-8 text-sky-500 group-hover:text-primary transition-colors" />
                            </div>
                            <h2 className="text-2xl font-semibold mb-2 text-sky-900">Upload your notes</h2>
                            <p className="text-sky-700">Drag & drop your text or PDF file here, or click to browse.</p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="selected"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center w-full"
                        >
                            <div className="w-16 h-16 mb-6 flex items-center justify-center rounded-2xl bg-accent/20 border border-accent/40 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                                <FileText className="w-8 h-8 text-accent-foreground" />
                            </div>
                            <h2 className="text-xl font-bold mb-1 max-w-[80%] truncate text-sky-900">{file.name}</h2>
                            <p className="text-sky-700 font-medium text-sm mb-8">{(file.size / 1024 / 1024).toFixed(2)} MB • Ready for magic</p>

                            <div className="flex gap-4 w-full justify-center">
                                <button
                                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                                    className="btn secondary-btn px-6 py-3 flex items-center gap-2"
                                >
                                    <X className="w-4 h-4" /> Cancel
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); onUpload(file); }}
                                    className="btn action-btn px-8 py-3 flex items-center gap-2"
                                >
                                    <Wand2 className="w-4 h-4" /> Generate Magic
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.section>
    );
};
