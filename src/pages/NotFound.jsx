import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

// 404 қате беті — табылмаған маршрут үшін көрсетіледі
export default function NotFound() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      {/* Қате коды, хабарлама және басты бетке оралу түймесі */}
      <div className="text-center space-y-4">
        <div className="text-7xl font-bold text-zinc-800 tracking-tighter">404</div>
        <h1 className="text-xl font-semibold text-zinc-200">{t('notFound.title')}</h1>
        <p className="text-sm text-zinc-500 max-w-xs mx-auto">
          {t('notFound.subtitle')}
        </p>
        {/* Басты бетке қайту түймесі */}
        <Button asChild className="mt-2">
          <Link to="/" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            {t('notFound.button')}
          </Link>
        </Button>
      </div>
    </div>
  );
}
