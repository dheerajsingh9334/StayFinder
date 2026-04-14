import { Button } from '@/components/ui/shadcn-button';

export function ServerErrorPage({
  title = 'Something went wrong',
  message = 'The page crashed while rendering. Please refresh and try again.',
}: {
  title?: string;
  message?: string;
}) {
  return (
    <section className="min-h-[60vh] w-full rounded-2xl border border-rose-200 bg-transparent/90 p-8 text-center shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-600">
        500 error
      </p>
      <h2 className="mt-2 text-3xl font-bold text-white">{title}</h2>
      <p className="mx-auto mt-3 max-w-xl text-slate-400">{message}</p>
      <div className="mt-6 flex items-center justify-center gap-3">
        <Button onClick={() => window.location.reload()}>Reload page</Button>
        <Button variant="outline" onClick={() => (window.location.href = '/')}>
          Go home
        </Button>
      </div>
    </section>
  );
}
