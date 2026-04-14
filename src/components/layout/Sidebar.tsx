import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthProvider';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  ClipboardList, 
  GraduationCap,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export function Sidebar() {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const isAdmin = profile?.role === 'admin';

  const menuItems = isAdmin 
    ? [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/app' },
        { icon: BookOpen, label: 'Manajemen Soal', path: '/app/admin/questions' },
        { icon: Users, label: 'Manajemen User', path: '/app/admin/users' },
        { icon: ClipboardList, label: 'Hasil Ujian', path: '/app/admin/results' },
      ]
    : [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/app' },
        { icon: GraduationCap, label: 'Mulai Ujian', path: '/app/exam' },
        { icon: ClipboardList, label: 'Hasil Ujian', path: '/app/result' },
      ];

  return (
    <>
      {/* Mobile Toggle */}
      <Button 
        variant="ghost" 
        size="icon" 
        className="fixed left-4 top-4 z-50 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X /> : <Menu />}
      </Button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden" 
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 transform bg-white border-r transition-transform duration-200 ease-in-out md:relative md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-2 px-6 py-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white font-bold text-xl">
              S
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-none">SMK Prima</span>
              <span className="text-xs text-muted-foreground">Ujian Online</span>
            </div>
          </div>

          <nav className="flex-1 px-4 space-y-1">
            {menuItems.map((item) => (
              <Link 
                key={item.path} 
                to={item.path}
                onClick={() => setIsOpen(false)}
              >
                <Button
                  variant={location.pathname === item.path ? 'secondary' : 'ghost'}
                  className={cn(
                    "w-full justify-start gap-3 px-4 py-6",
                    location.pathname === item.path ? "text-primary bg-primary/5" : "text-muted-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Button>
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t">
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={() => signOut()}
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Logout</span>
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
