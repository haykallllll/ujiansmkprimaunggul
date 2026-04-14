import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  Users, 
  BookOpen, 
  ClipboardCheck, 
  ArrowRight, 
  GraduationCap,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'motion/react';
import { ExamResult } from '@/types';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    users: 0,
    questions: 0,
    results: 0
  });
  const [recentResults, setRecentResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = profile?.role === 'admin';

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (isAdmin) {
          const [usersCount, questionsCount, resultsCount] = await Promise.all([
            supabase.from('users').select('*', { count: 'exact', head: true }),
            supabase.from('questions').select('*', { count: 'exact', head: true }),
            supabase.from('results').select('*', { count: 'exact', head: true })
          ]);

          setStats({
            users: usersCount.count || 0,
            questions: questionsCount.count || 0,
            results: resultsCount.count || 0
          });

          const { data: results } = await supabase
            .from('results')
            .select('*, users(nama)')
            .order('created_at', { ascending: false })
            .limit(5);
          
          setRecentResults(results || []);
        } else {
          const { data: results } = await supabase
            .from('results')
            .select('*')
            .eq('user_id', profile?.id)
            .order('created_at', { ascending: false })
            .limit(3);
          
          setRecentResults(results || []);

          const { count } = await supabase
            .from('questions')
            .select('*', { count: 'exact', head: true });
          
          setStats(prev => ({ ...prev, questions: count || 0 }));
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (profile) fetchData();
  }, [profile, isAdmin]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 bg-slate-200 animate-pulse rounded" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-slate-200 animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          {isAdmin ? 'Ringkasan aktivitas sistem ujian online.' : 'Selamat datang di portal ujian online SMK Prima Unggul.'}
        </p>
      </div>

      {isAdmin ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard 
              title="Total Siswa" 
              value={stats.users} 
              icon={Users} 
              color="text-blue-600" 
              bg="bg-blue-50" 
            />
            <StatCard 
              title="Total Soal" 
              value={stats.questions} 
              icon={BookOpen} 
              color="text-red-600" 
              bg="bg-red-50" 
            />
            <StatCard 
              title="Ujian Selesai" 
              value={stats.results} 
              icon={ClipboardCheck} 
              color="text-green-600" 
              bg="bg-green-50" 
            />
          </div>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Hasil Ujian Terbaru</CardTitle>
              <CardDescription>Daftar siswa yang baru saja menyelesaikan ujian.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentResults.length > 0 ? (
                  recentResults.map((result) => (
                    <div key={result.id} className="flex items-center justify-between p-4 rounded-lg border bg-white">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                          {(result as any).users?.nama?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold">{(result as any).users?.nama}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(result.created_at).toLocaleString('id-ID')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary">{result.nilai}</p>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Skor</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-8 text-muted-foreground italic">Belum ada data hasil ujian.</p>
                )}
              </div>
              <Button variant="ghost" className="w-full mt-4 text-primary" asChild>
                <Link to="/app/admin/results">Lihat Semua Hasil <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </CardContent>
          </Card>
        </>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-primary rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-primary/20"
            >
              <div className="relative z-10">
                <h2 className="text-3xl font-bold mb-2">Siap untuk Ujian?</h2>
                <p className="text-primary-foreground/80 mb-6 max-w-md">
                  Ujian mata pelajaran Teknik Komputer dan Jaringan (TKJ) sudah tersedia. Pastikan koneksi internet stabil.
                </p>
                <Button size="lg" variant="secondary" className="font-bold text-primary" asChild>
                  <Link to="/app/exam">Mulai Ujian Sekarang</Link>
                </Button>
              </div>
              <GraduationCap className="absolute right-[-20px] bottom-[-20px] h-64 w-64 text-white/10 rotate-12" />
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-none shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="h-5 w-5 text-orange-500" />
                    Informasi Ujian
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm">
                    <li className="flex justify-between">
                      <span className="text-muted-foreground">Materi:</span>
                      <span className="font-medium">TKJ</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-muted-foreground">Jumlah Soal:</span>
                      <span className="font-medium">{stats.questions} Soal</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-muted-foreground">Waktu:</span>
                      <span className="font-medium">60 Menit</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    Status Anda
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center py-2">
                    {recentResults.length > 0 ? (
                      <>
                        <p className="text-3xl font-bold text-primary">{recentResults[0].nilai}</p>
                        <p className="text-xs text-muted-foreground">Nilai Terakhir</p>
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center">Anda belum mengerjakan ujian.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="font-bold text-lg">Riwayat Ujian</h3>
            <div className="space-y-4">
              {recentResults.length > 0 ? (
                recentResults.map((result) => (
                  <div key={result.id} className="p-4 rounded-xl border bg-white shadow-sm flex justify-between items-center">
                    <div>
                      <p className="font-bold">Ujian TKJ</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(result.created_at).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                    <div className="h-10 w-10 rounded-full border-2 border-primary/20 flex items-center justify-center font-bold text-primary">
                      {result.nilai}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground italic">Belum ada riwayat.</p>
              )}
            </div>
            {recentResults.length > 0 && (
              <Button variant="outline" className="w-full" asChild>
                <Link to="/app/result">Lihat Semua Hasil</Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, bg }: any) {
  return (
    <Card className="border-none shadow-sm overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
          </div>
          <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center", bg)}>
            <Icon className={cn("h-6 w-6", color)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
