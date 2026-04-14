import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ExamResult } from '@/types';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Search, Loader2, Download, FileSpreadsheet } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminResults() {
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('results')
        .select('*, users(nama)')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setResults(data || []);
    } catch (error) {
      console.error('Error fetching results:', error);
      toast.error('Gagal memuat data hasil ujian.');
    } finally {
      setLoading(false);
    }
  };

  const filteredResults = results.filter(r => 
    (r as any).users?.nama?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExport = () => {
    toast.info('Fitur ekspor sedang dalam pengembangan.');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hasil Ujian Siswa</h1>
          <p className="text-muted-foreground">Pantau nilai dan performa seluruh siswa.</p>
        </div>
        <Button variant="outline" onClick={handleExport} className="gap-2">
          <FileSpreadsheet className="h-4 w-4" /> Ekspor Excel
        </Button>
      </div>

      <div className="flex items-center gap-2 max-w-sm">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Cari nama siswa..." 
            className="pl-9" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Siswa</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Benar</TableHead>
              <TableHead>Total Soal</TableHead>
              <TableHead>Nilai</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                </TableCell>
              </TableRow>
            ) : filteredResults.length > 0 ? (
              filteredResults.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-bold">{(r as any).users?.nama}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(r.created_at).toLocaleString('id-ID')}
                  </TableCell>
                  <TableCell>{r.jawaban_benar}</TableCell>
                  <TableCell>{r.total_soal}</TableCell>
                  <TableCell>
                    <span className={cn(
                      "font-black text-lg",
                      r.nilai >= 75 ? "text-green-600" : r.nilai >= 60 ? "text-orange-600" : "text-red-600"
                    )}>
                      {r.nilai}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge className={cn(
                      r.nilai >= 75 ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-red-100 text-red-700 hover:bg-red-100"
                    )}>
                      {r.nilai >= 75 ? 'LULUS' : 'TIDAK LULUS'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground italic">
                  Tidak ada data hasil ditemukan.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
