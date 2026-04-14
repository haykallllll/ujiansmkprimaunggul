import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { GraduationCap, Network, Palette, Calculator, Radio, Briefcase, TrendingUp, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

export default function LandingPage() {
  const majors = [
    { name: 'TKJ', desc: 'Teknik Komputer dan Jaringan', icon: Network, color: 'bg-blue-500' },
    { name: 'DKV', desc: 'Desain Komunikasi Visual', icon: Palette, color: 'bg-purple-500' },
    { name: 'AK', desc: 'Akuntansi', icon: Calculator, color: 'bg-green-500' },
    { name: 'BC', desc: 'Broadcasting', icon: Radio, color: 'bg-red-500' },
    { name: 'MPLB', desc: 'Manajemen Perkantoran', icon: Briefcase, color: 'bg-orange-500' },
    { name: 'BD', desc: 'Bisnis Digital', icon: TrendingUp, color: 'bg-cyan-500' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">S</div>
              <span className="font-bold text-xl tracking-tight">SMK Prima Unggul</span>
            </div>
            <Link to="/login">
              <Button className="bg-primary hover:bg-primary/90">Login Siswa</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 hover:bg-primary/10">Portal Ujian Online</Badge>
              <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-6">
                Masa Depan Cerah Dimulai dari <span className="text-primary">SMK Prima Unggul</span>
              </h1>
              <p className="text-lg text-slate-600 mb-10 leading-relaxed">
                Platform ujian online terintegrasi untuk mendukung proses belajar mengajar yang modern, transparan, dan efisien bagi seluruh siswa SMK Prima Unggul.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/login">
                  <Button size="lg" className="w-full sm:w-auto gap-2 h-12 px-8 text-base">
                    Mulai Ujian Sekarang <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-8 text-base">
                  Profil Sekolah
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Majors Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Jurusan Unggulan Kami</h2>
            <p className="text-slate-600">Berbagai pilihan kompetensi keahlian untuk masa depan gemilang.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {majors.map((major, index) => (
              <motion.div
                key={major.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-2xl border border-slate-200 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all group"
              >
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform", major.color)}>
                  <major.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{major.name}</h3>
                <p className="text-slate-600">{major.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="h-6 w-6 bg-primary rounded flex items-center justify-center text-white font-bold text-xs">S</div>
            <span className="font-bold text-lg tracking-tight">SMK Prima Unggul</span>
          </div>
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} SMK Prima Unggul. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", className)}>
      {children}
    </span>
  );
}
