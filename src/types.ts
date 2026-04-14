export type Role = 'admin' | 'siswa';

export interface UserProfile {
  id: string;
  nama: string;
  role: Role;
  created_at: string;
}

export interface Question {
  id: number;
  soal: string;
  pilihan_a: string;
  pilihan_b: string;
  pilihan_c: string;
  pilihan_d: string;
  jawaban_benar: 'A' | 'B' | 'C' | 'D';
  created_at: string;
}

export interface Answer {
  id: number;
  user_id: string;
  question_id: number;
  jawaban: 'A' | 'B' | 'C' | 'D';
  created_at: string;
}

export interface ExamResult {
  id: number;
  user_id: string;
  nilai: number;
  total_soal: number;
  jawaban_benar: number;
  created_at: string;
  user?: UserProfile;
}
