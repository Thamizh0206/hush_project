import { useState, useEffect } from 'react';
import { Layout, Book, TrendingUp, RefreshCcw, ArrowRight, BrainCircuit, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';

export const Dashboard = ({ userId, onRetest }) => {
    const [progress, setProgress] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (userId) {
            fetchProgress();
        } else {
            setLoading(false);
            setError("No user statistics found. Please log out and back in to sync your data.");
        }
    }, [userId]);

    const fetchProgress = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/progress?user_id=${userId}`);
            setProgress(response.data);
        } catch (err) {
            setError("Failed to load progress analytics.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 gap-4">
            <div className="w-12 h-12 border-4 border-sky-200 border-t-primary rounded-full animate-spin" />
            <p className="text-sky-800 font-medium">Loading your analytics...</p>
        </div>
    );

    if (error) return (
        <div className="flex flex-col items-center justify-center p-20 gap-6 glass rounded-3xl border-danger/20">
            <div className="w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center">
                <BrainCircuit className="w-8 h-8 text-danger" />
            </div>
            <div className="text-center">
                <h3 className="text-xl font-bold text-red-900 mb-2">Analysis Unavailable</h3>
                <p className="text-slate-500 max-w-sm">{error}</p>
            </div>
            <button
                onClick={() => window.location.reload()}
                className="btn secondary-btn px-8"
            >
                Refresh Page
            </button>
        </div>
    );

    const topics = progress ? Object.entries(progress) : [];

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black text-sky-900">Personal Dashboard</h2>
                    <p className="text-sky-700 font-medium">Tracking your mastery across all subjects</p>
                </div>
                <button
                    onClick={fetchProgress}
                    className="p-3 rounded-2xl bg-white/50 border border-sky-100 hover:bg-white transition-all text-sky-600"
                >
                    <RefreshCcw className="w-5 h-5" />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {topics.length > 0 ? topics.map(([name, mastery], idx) => (
                    <motion.div
                        key={name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="glass p-6 rounded-[24px] group hover:border-primary/40 transition-all border border-transparent"
                    >
                        <div className="flex items-start justify-between mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-sky-50 flex items-center justify-center border border-sky-100 group-hover:bg-primary group-hover:border-primary transition-all">
                                <Book className="w-6 h-6 text-sky-600 group-hover:text-white transition-all" />
                            </div>
                            <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${mastery > 80 ? 'bg-emerald-100 text-emerald-700' :
                                mastery > 50 ? 'bg-amber-100 text-amber-700' :
                                    'bg-sky-100 text-sky-700'
                                }`}>
                                {mastery > 80 ? 'Mastered' : mastery > 50 ? 'Progressing' : 'Learning'}
                            </div>
                        </div>

                        <h3 className="text-xl font-bold text-sky-900 mb-2 truncate" title={name}>{name}</h3>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-sm font-bold text-sky-800">
                                <span>Mastery Score</span>
                                <span>{mastery}%</span>
                            </div>
                            <div className="w-full h-2.5 bg-sky-100 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${mastery}%` }}
                                    className={`h-full rounded-full ${mastery > 80 ? 'bg-emerald-500' :
                                        mastery > 50 ? 'bg-amber-500' :
                                            'bg-sky-500'
                                        }`}
                                />
                            </div>
                        </div>

                        <button
                            onClick={() => onRetest(name)}
                            className="w-full mt-6 py-3 rounded-xl bg-sky-50 group-hover:bg-primary/5 text-sky-600 font-bold text-sm flex items-center justify-center gap-2 transition-all hover:gap-3"
                        >
                            Take Practice Quiz <ArrowRight className="w-4 h-4" />
                        </button>
                    </motion.div>
                )) : (
                    <div className="col-span-full py-12 text-center glass rounded-3xl">
                        <BrainCircuit className="w-16 h-16 text-sky-200 mx-auto mb-4" />
                        <h4 className="text-xl font-bold text-sky-900">No data available yet</h4>
                        <p className="text-sky-600">Upload your first document to begin your mastery journey!</p>
                    </div>
                )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 p-8 rounded-[32px] text-white shadow-xl shadow-indigo-200/50">
                    <TrendingUp className="w-8 h-8 mb-4 opacity-50" />
                    <div className="text-4xl font-black mb-1">{topics.length}</div>
                    <div className="font-bold text-indigo-100 uppercase tracking-wider text-xs">Active Topics</div>
                </div>
                <div className="bg-gradient-to-br from-sky-400 to-sky-600 p-8 rounded-[32px] text-white shadow-xl shadow-sky-200/50">
                    <BrainCircuit className="w-8 h-8 mb-4 opacity-50" />
                    <div className="text-4xl font-black mb-1">
                        {topics.length > 0 ? Math.round(topics.reduce((acc, [_, m]) => acc + m, 0) / topics.length) : 0}%
                    </div>
                    <div className="font-bold text-sky-100 uppercase tracking-wider text-xs">Global Mastery</div>
                </div>
                <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 p-8 rounded-[32px] text-white shadow-xl shadow-emerald-200/50">
                    <Award className="w-8 h-8 mb-4 opacity-50" />
                    <div className="text-4xl font-black mb-1">
                        {topics.filter(([_, m]) => m > 80).length}
                    </div>
                    <div className="font-bold text-emerald-100 uppercase tracking-wider text-xs">Topics Mastered</div>
                </div>
            </div>
        </div>
    );
};
