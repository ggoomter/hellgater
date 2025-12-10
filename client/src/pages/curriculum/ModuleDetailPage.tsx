import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, ChevronRight, Play } from 'lucide-react';
import { useCurriculum } from '../../hooks/useCurriculum';
import QuizModule from '../../components/curriculum/QuizModule';
import { curriculumAPI } from '../../services/api';

const ModuleDetailPage: React.FC = () => {
    const { weekNumber, moduleId } = useParams<{ weekNumber: string; moduleId: string }>();
    const navigate = useNavigate();
    const weekNum = parseInt(weekNumber || '0');
    
    // Use the hook to get all modules for the week
    // This allows us to know prev/next modules
    const { modules, weekProgress, loading, error, fetchWeekData } = useCurriculum(weekNum);
    const [currentModule, setCurrentModule] = useState<any>(null);
    const [completing, setCompleting] = useState(false);

    useEffect(() => {
        fetchWeekData();
    }, [fetchWeekData]);

    useEffect(() => {
        if (modules.length > 0 && moduleId) {
            const module = modules.find(m => m.id === moduleId);
            setCurrentModule(module || null);
        }
    }, [modules, moduleId]);

    const handleBack = () => {
        navigate(`/curriculum/week/${weekNum}`);
    };

    const handleComplete = async () => {
        if (!currentModule) return;
        setCompleting(true);
        try {
            await curriculumAPI.completeModule(currentModule.id);
            // After completion, maybe navigate to next or show success?
            // For now, let's navigate back to map or next module
            
            // Find next module
            const currentIndex = modules.findIndex(m => m.id === moduleId);
            const nextModule = modules[currentIndex + 1];
            
            if (nextModule) {
                 // Check if it's locked? Assuming sequential completion unlocks next.
                 // We might need to refresh progress to unlock.
                 navigate(`/curriculum/week/${weekNum}/module/${nextModule.id}`);
            } else {
                 // End of week
                 navigate(`/curriculum/week/${weekNum}`);
            }
        } catch (error) {
            console.error('Error completing module:', error);
        } finally {
            setCompleting(false);
        }
    };

    if (loading) return <div className="text-white text-center mt-20">Loading...</div>;
    if (error) return <div className="text-red-500 text-center mt-20">{error}</div>;
    if (!currentModule) return <div className="text-white text-center mt-20">Module not found</div>;

    // Render based on module type
    const renderContent = () => {
        switch (currentModule.moduleType) {
            case 'quiz':
                return <QuizModule module={currentModule} onComplete={handleComplete} />;
            case 'cinematic_video':
            case 'lecture_video':
                return (
                     <div className="flex flex-col items-center">
                        <div className="w-full max-w-4xl aspect-video bg-black rounded-xl overflow-hidden mb-6 shadow-2xl">
                             {/* Placeholder Video Player */}
                             <div className="w-full h-full flex items-center justify-center bg-gray-900">
                                 {currentModule.contentData?.youtubeId ? (
                                     <iframe 
                                         width="100%" 
                                         height="100%" 
                                         src={`https://www.youtube.com/embed/${currentModule.contentData.youtubeId}`} 
                                         title={currentModule.titleKo}
                                         frameBorder="0"
                                         allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                         allowFullScreen
                                     ></iframe>
                                 ) : (
                                     <div className="text-center p-10">
                                         <Play size={48} className="mx-auto mb-4 text-purple-500" />
                                         <p className="text-gray-400">Video Placeholder</p>
                                     </div>
                                 )}
                             </div>
                        </div>
                        <p className="text-gray-300 max-w-4xl text-lg mb-8 leading-relaxed">
                            {currentModule.description}
                        </p>
                        <button 
                            onClick={handleComplete}
                            disabled={completing}
                            className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold flex items-center gap-2 transition-all"
                        >
                            {completing ? 'Completing...' : 'Complete & Continue' }
                            <ChevronRight size={20} />
                        </button>
                     </div>
                );
            case 'assignment':
            case 'workout_assignment':
                     return (
                         <div className="max-w-4xl mx-auto bg-gray-800 p-8 rounded-xl border border-gray-700">
                             <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-purple-400">
                                 <CheckCircle /> Assignment
                             </h2>
                             <p className="text-gray-300 mb-6">{currentModule.description}</p>
                             
                             <div className="bg-gray-900/50 p-6 rounded-lg mb-8">
                                 <h3 className="font-semibold mb-4 text-white">Tasks:</h3>
                                 <ul className="space-y-3">
                                     {currentModule.contentData?.check?.map((item: string, idx: number) => (
                                         <li key={idx} className="flex items-center gap-3 text-gray-300">
                                             <div className="w-5 h-5 rounded border border-gray-500 flex items-center justify-center">?</div>
                                             {item}
                                         </li>
                                     )) || (
                                        <li className="text-gray-500">Check detailed instructions above.</li>
                                     )}
                                 </ul>
                             </div>

                             <button 
                                onClick={handleComplete}
                                disabled={completing}
                                className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition-all shadow-lg shadow-green-900/20"
                            >
                                Mark as Done
                            </button>
                         </div>
                     );
            default:
                return (
                    <div className="text-center p-10">
                        <p>Unsupported module type: {currentModule.moduleType}</p>
                        <button onClick={handleComplete} className="mt-4 px-4 py-2 bg-gray-700 rounded">Skip</button>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col">
            <header className="px-6 py-4 bg-gray-800/80 backdrop-blur border-b border-gray-700 sticky top-0 z-50 flex items-center gap-4">
                <button onClick={handleBack} className="p-2 hover:bg-gray-700 rounded-full transition-colors">
                    <ArrowLeft size={24} />
                </button>
                <div>
                     <span className="text-sm text-purple-400 font-semibold">Step {currentModule.displayOrder}</span>
                     <h1 className="text-xl font-bold truncate max-w-md">{currentModule.titleKo}</h1>
                </div>
            </header>

            <main className="flex-1 p-6 md:p-10 overflow-y-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {renderContent()}
                </motion.div>
            </main>
        </div>
    );
};

export default ModuleDetailPage;
