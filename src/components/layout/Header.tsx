import { useAuth } from '@/components/auth/AuthProvider';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export function Header() {
  const { profile } = useAuth();

  return (
    <header className="h-16 border-b bg-white px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <h2 className="text-sm font-medium text-muted-foreground md:block hidden">
          Selamat datang kembali, <span className="text-foreground font-semibold">{profile?.nama}</span>
        </h2>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right mr-2">
          <p className="text-sm font-semibold leading-none">{profile?.nama}</p>
          <Badge variant="secondary" className="mt-1 text-[10px] uppercase tracking-wider">
            {profile?.role}
          </Badge>
        </div>
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
          {profile?.nama?.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
}
