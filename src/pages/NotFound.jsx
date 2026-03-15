import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="text-center space-y-4">
        <div className="text-7xl font-bold text-zinc-800 tracking-tighter">404</div>
        <h1 className="text-xl font-semibold text-zinc-200">Страница не найдена</h1>
        <p className="text-sm text-zinc-500 max-w-xs mx-auto">
          Запрашиваемая страница не существует или была перемещена.
        </p>
        <Button asChild className="mt-2">
          <Link to="/" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            На главную
          </Link>
        </Button>
      </div>
    </div>
  );
}
