import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/lib/supabase';
import { Question } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Send, 
  AlertCircle,
  CheckCircle2,
  Loader2,
  BookOpen
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

const EXAM_TIME_MINUTES = 60;

export default function ExamPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(EXAM_TIME_MINUTES * 60);
  const [isFinished, setIsFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hasTaken, setHasTaken] = useState(false);

  useEffect(() => {
    const checkAndFetch = async () => {
      try {
        // Check if already taken
        const { data: existingResult } = await supabase
          .from('results')
          .select('*')
          .eq('user_id', profile?.id)
          .maybeSingle();
        
        if (existingResult) {
          setHasTaken(true);
          setLoading(false);
          return;
        }

        // Fetch questions
        const { data, error } = await supabase
          .from('questions')
          .select('*');
        
        if (error) throw error;
        
        // Shuffle questions
        const shuffled = (data || []).sort(() => Math.random() - 0.5);
        setQuestions(shuffled);
      } catch (error) {
        console.error('Error fetching exam data:', error);
        toast.error('Gagal memuat soal ujian.');
      } finally {
        setLoading(false);
      }
    };

    if (profile) checkAndFetch();
  }, [profile]);

  // Timer logic
  useEffect(() => {
    if (loading || isFinished || hasTaken || questions.length === 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, isFinished, hasTaken, questions.length]);

  const handleSubmit = useCallback(async () => {
    if (submitting || isFinished) return;
    setSubmitting(true);

    try {
      let correctCount = 0;
      questions.forEach(q => {
        if (answers[q.id] === q.jawaban_benar) {
          correctCount++;
        }
      });

      const score = (correctCount / questions.length) * 100;

      // Save result
      const { error: resultError } = await supabase
        .from('results')
        .insert({
          user_id: profile?.id,
          nilai: Math.round(score * 100) / 100,
          total_soal: questions.length,
          jawaban_benar: correctCount
        });

      if (resultError) throw resultError;

      // Save answers
      const answerData = questions.map(q => ({
        user_id: profile?.id,
        question_id: q.id,
        jawaban: answers[q.id] || ''
      })).filter(a => a.jawaban !== '');

      if (answerData.length > 0) {
        await supabase.from('answers').insert(answerData);
      }

      setIsFinished(true);
      toast.success('Ujian berhasil dikirim!');
    } catch (error) {
      console.error('Error submitting exam:', error);
      toast.error('Gagal mengirim jawaban.');
    } finally {
      setSubmitting(false);
    }
  }, [questions, answers, profile, submitting, isFinished]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Menyiapkan soal ujian...</p>
      </div>
    );
  }

  if (hasTaken) {
    return (
      <Card className="max-w-2xl mx-auto text-center p-8">
        <div className="flex justify-center mb-6">
          <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center text-green-600">
            <CheckCircle2 className="h-10 w-10" />
          </div>
        </div>
        <CardTitle className="text-2xl mb-2">Ujian Sudah Selesai</CardTitle>
        <CardDescription className="text-lg mb-6">
          Anda sudah mengerjakan ujian ini. Silakan cek hasil ujian Anda di halaman hasil.
        </CardDescription>
        <Button size="lg" onClick={() => navigate('/app/result')}>Lihat Hasil Ujian</Button>
      </Card>
    );
  }

  if (questions.length === 0) {
    return (
      <Card className="max-w-2xl mx-auto text-center p-8">
        <div className="flex justify-center mb-6">
          <div className="h-20 w-20 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
            <AlertCircle className="h-10 w-10" />
          </div>
        </div>
        <CardTitle className="text-2xl mb-2">Soal Belum Tersedia</CardTitle>
        <CardDescription className="text-lg mb-6">
          Maaf, saat ini belum ada soal ujian yang tersedia untuk dikerjakan.
        </CardDescription>
        <Button size="lg" onClick={() => navigate('/app')}>Kembali ke Dashboard</Button>
      </Card>
    );
  }

  if (isFinished) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto text-center"
      >
        <Card className="p-12 border-none shadow-xl">
          <div className="flex justify-center mb-8">
            <div className="h-24 w-24 rounded-full bg-green-500 flex items-center justify-center text-white shadow-lg shadow-green-200">
              <CheckCircle2 className="h-12 w-12" />
            </div>
          </div>
          <h2 className="text-3xl font-bold mb-4">Ujian Selesai!</h2>
          <p className="text-slate-500 mb-8 text-lg">
            Terima kasih telah mengerjakan ujian dengan jujur. Jawaban Anda telah berhasil disimpan ke sistem.
          </p>
          <Button size="lg" className="w-full h-12 text-lg" onClick={() => navigate('/app/result')}>
            Lihat Nilai Saya
          </Button>
        </Card>
      </motion.div>
    );
  }

  const currentQuestion = questions[currentIdx];
  const progress = ((currentIdx + 1) / questions.length) * 100;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-white p-4 rounded-2xl border shadow-sm sticky top-20 z-20">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-bold text-lg">Ujian TKJ</h2>
            <p className="text-xs text-muted-foreground">Soal {currentIdx + 1} dari {questions.length}</p>
          </div>
        </div>

        <div className="flex items-center gap-6 w-full md:w-auto">
          <div className="flex-1 md:w-48">
            <div className="flex justify-between text-xs mb-1">
              <span>Progres</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          
          <div className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-bold text-lg",
            timeLeft < 300 ? "bg-red-50 text-red-600 animate-pulse" : "bg-slate-50 text-slate-700"
          )}>
            <Clock className="h-5 w-5" />
            {formatTime(timeLeft)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Question Area */}
        <div className="lg:col-span-3 space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="border-none shadow-md">
                <CardHeader>
                  <CardTitle className="text-xl leading-relaxed font-medium">
                    {currentQuestion.soal}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {['A', 'B', 'C', 'D'].map((opt) => {
                    const optionKey = `pilihan_${opt.toLowerCase()}` as keyof Question;
                    const isSelected = answers[currentQuestion.id] === opt;
                    
                    return (
                      <button
                        key={opt}
                        onClick={() => setAnswers(prev => ({ ...prev, [currentQuestion.id]: opt }))}
                        className={cn(
                          "w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all",
                          isSelected 
                            ? "border-primary bg-primary/5 shadow-sm" 
                            : "border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                        )}
                      >
                        <div className={cn(
                          "h-10 w-10 rounded-lg flex items-center justify-center font-bold shrink-0",
                          isSelected ? "bg-primary text-white" : "bg-slate-100 text-slate-500"
                        )}>
                          {opt}
                        </div>
                        <span className={cn("flex-1", isSelected ? "font-semibold text-slate-900" : "text-slate-600")}>
                          {currentQuestion[optionKey] as string}
                        </span>
                      </button>
                    );
                  })}
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-6">
                  <Button
                    variant="outline"
                    disabled={currentIdx === 0}
                    onClick={() => setCurrentIdx(prev => prev - 1)}
                    className="gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" /> Sebelumnya
                  </Button>
                  
                  {currentIdx === questions.length - 1 ? (
                    <Button 
                      className="bg-green-600 hover:bg-green-700 gap-2"
                      onClick={() => {
                        if (confirm('Apakah Anda yakin ingin mengumpulkan jawaban?')) {
                          handleSubmit();
                        }
                      }}
                      disabled={submitting}
                    >
                      {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      Selesai & Kirim
                    </Button>
                  ) : (
                    <Button
                      onClick={() => setCurrentIdx(prev => prev + 1)}
                      className="gap-2"
                    >
                      Selanjutnya <ChevronRight className="h-4 w-4" />
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Question Navigation Sidebar */}
        <div className="space-y-6">
          <Card className="border-none shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">Navigasi Soal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-2">
                {questions.map((q, idx) => (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIdx(idx)}
                    className={cn(
                      "h-10 rounded-lg text-sm font-bold transition-all",
                      currentIdx === idx ? "ring-2 ring-primary ring-offset-2" : "",
                      answers[q.id] 
                        ? "bg-primary text-white" 
                        : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                    )}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Terjawab:</span>
                  <span className="font-bold">{answeredCount} / {questions.length}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Belum:</span>
                  <span className="font-bold">{questions.length - answeredCount}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3">
            <AlertCircle className="h-5 w-5 text-blue-500 shrink-0" />
            <p className="text-xs text-blue-700 leading-relaxed">
              Jawaban Anda akan tersimpan otomatis. Jika waktu habis, sistem akan mengumpulkan jawaban secara otomatis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
