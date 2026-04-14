import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Question } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Search, Loader2 } from 'lucide-react';

export default function QuestionManagement() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    soal: '',
    pilihan_a: '',
    pilihan_b: '',
    pilihan_c: '',
    pilihan_d: '',
    jawaban_benar: 'A' as 'A' | 'B' | 'C' | 'D'
  });

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setQuestions(data || []);
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast.error('Gagal memuat data soal.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (question?: Question) => {
    if (question) {
      setEditingQuestion(question);
      setFormData({
        soal: question.soal,
        pilihan_a: question.pilihan_a,
        pilihan_b: question.pilihan_b,
        pilihan_c: question.pilihan_c,
        pilihan_d: question.pilihan_d,
        jawaban_benar: question.jawaban_benar
      });
    } else {
      setEditingQuestion(null);
      setFormData({
        soal: '',
        pilihan_a: '',
        pilihan_b: '',
        pilihan_c: '',
        pilihan_d: '',
        jawaban_benar: 'A'
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingQuestion) {
        const { error } = await supabase
          .from('questions')
          .update(formData)
          .eq('id', editingQuestion.id);
        if (error) throw error;
        toast.success('Soal berhasil diperbarui.');
      } else {
        const { error } = await supabase
          .from('questions')
          .insert(formData);
        if (error) throw error;
        toast.success('Soal berhasil ditambahkan.');
      }
      setIsDialogOpen(false);
      fetchQuestions();
    } catch (error: any) {
      toast.error(error.message || 'Terjadi kesalahan.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus soal ini?')) return;

    try {
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', id);
      if (error) throw error;
      toast.success('Soal berhasil dihapus.');
      fetchQuestions();
    } catch (error: any) {
      toast.error(error.message || 'Gagal menghapus soal.');
    }
  };

  const filteredQuestions = questions.filter(q => 
    q.soal.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manajemen Soal</h1>
          <p className="text-muted-foreground">Kelola bank soal ujian TKJ.</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="gap-2">
          <Plus className="h-4 w-4" /> Tambah Soal
        </Button>
      </div>

      <div className="flex items-center gap-2 max-w-sm">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Cari soal..." 
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
              <TableHead className="w-[50px]">No</TableHead>
              <TableHead>Soal</TableHead>
              <TableHead className="w-[100px]">Jawaban</TableHead>
              <TableHead className="w-[120px] text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                </TableCell>
              </TableRow>
            ) : filteredQuestions.length > 0 ? (
              filteredQuestions.map((q, idx) => (
                <TableRow key={q.id}>
                  <TableCell className="font-medium">{idx + 1}</TableCell>
                  <TableCell className="max-w-md truncate">{q.soal}</TableCell>
                  <TableCell>
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-primary/10 text-primary font-bold text-xs">
                      {q.jawaban_benar}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(q)}>
                        <Pencil className="h-4 w-4 text-blue-500" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(q.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground italic">
                  Tidak ada soal ditemukan.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingQuestion ? 'Edit Soal' : 'Tambah Soal Baru'}</DialogTitle>
            <DialogDescription>
              Pastikan semua data soal dan pilihan jawaban terisi dengan benar.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="soal">Pertanyaan</Label>
              <Textarea 
                id="soal" 
                placeholder="Masukkan pertanyaan..." 
                value={formData.soal}
                onChange={(e) => setFormData(prev => ({ ...prev, soal: e.target.value }))}
                required
                className="min-h-[100px]"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pilihan_a">Pilihan A</Label>
                <Input 
                  id="pilihan_a" 
                  value={formData.pilihan_a}
                  onChange={(e) => setFormData(prev => ({ ...prev, pilihan_a: e.target.value }))}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pilihan_b">Pilihan B</Label>
                <Input 
                  id="pilihan_b" 
                  value={formData.pilihan_b}
                  onChange={(e) => setFormData(prev => ({ ...prev, pilihan_b: e.target.value }))}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pilihan_c">Pilihan C</Label>
                <Input 
                  id="pilihan_c" 
                  value={formData.pilihan_c}
                  onChange={(e) => setFormData(prev => ({ ...prev, pilihan_c: e.target.value }))}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pilihan_d">Pilihan D</Label>
                <Input 
                  id="pilihan_d" 
                  value={formData.pilihan_d}
                  onChange={(e) => setFormData(prev => ({ ...prev, pilihan_d: e.target.value }))}
                  required 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Jawaban Benar</Label>
              <Select 
                value={formData.jawaban_benar} 
                onValueChange={(val: any) => setFormData(prev => ({ ...prev, jawaban_benar: val }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jawaban benar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">Pilihan A</SelectItem>
                  <SelectItem value="B">Pilihan B</SelectItem>
                  <SelectItem value="C">Pilihan C</SelectItem>
                  <SelectItem value="D">Pilihan D</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {editingQuestion ? 'Simpan Perubahan' : 'Tambah Soal'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
