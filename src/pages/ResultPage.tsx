import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/lib/supabase';
import { ExamResult } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ClipboardList, 
  Trophy, 
  CheckCircle2, 
  XCircle, 
  Calendar,
  Loader2
} from 'lucide-react';
import { motion } from 'motion/react';

import { cn } from '@/lib/utils';

export default function ResultPage() {
  const { profile } = useAuth();
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const { data, error } = await supabase
          .from('results')
          .select('*')
          .eq('user_id', profile?.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setResults(data || []);
      } catch (error) {
        console.error('Error fetching results:', error);
      } finally {
        setLoading(false);
      }
    };

    if (profile) fetchResults();
  }, [profile]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Memuat hasil ujian...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Hasil Ujian</h1>
        <p className="text-muted-foreground">Riwayat nilai dan pencapaian ujian Anda.</p>
      </div>

      {results.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {results.map((result, index) => (
            <motion.div
              key={result.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-none shadow-md overflow-hidden">
                <div className={cn(
                  "h-2 w-full",
                  result.nilai >= 75 ? "bg-green-500" : result.nilai >= 60 ? "bg-orange-500" : "bg-red-500"
                )} />
                <CardContent className="p-6 md:p-8">
                  <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-50 border w-full md:w-48">
                      <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">Skor Akhir</p>
                      <p className={cn(
                        "text-5xl font-black",
                        result.nilai >= 75 ? "text-green-600" : result.nilai >= 60 ? "text-orange-600" : "text-red-600"
                      )}>
                        {result.nilai}
                      </p>
                    </div>

                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <Calendar className="h-4 w-4" />
                          <span className="text-xs font-semibold uppercase">Tanggal Ujian</span>
                        </div>
                        <p className="font-bold">{new Date(result.created_at).toLocaleDateString('id-ID', { 
                          day: 'numeric', 
                          month: 'long', 
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</p>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span className="text-xs font-semibold uppercase">Jawaban Benar</span>
                        </div>
                        <p className="font-bold">{result.jawaban_benar} dari {result.total_soal} Soal</p>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <Trophy className="h-4 w-4 text-orange-500" />
                          <span className="text-xs font-semibold uppercase">Status</span>
                        </div>
                        <Badge className={cn(
                          "px-3 py-1",
                          result.nilai >= 75 ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-red-100 text-red-700 hover:bg-red-100"
                        )}>
                          {result.nilai >= 75 ? 'LULUS' : 'TIDAK LULUS'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center border-dashed">
          <div className="flex justify-center mb-4">
            <ClipboardList className="h-12 w-12 text-slate-300" />
          </div>
          <CardTitle className="text-xl mb-2">Belum Ada Hasil</CardTitle>
          <CardDescription>Anda belum pernah mengerjakan ujian. Silakan mulai ujian pertama Anda.</CardDescription>
        </Card>
      )}
    </div>
  );
}

