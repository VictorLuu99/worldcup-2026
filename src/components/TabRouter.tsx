import { useEffect, useState } from 'react';
import { Calendar, Trophy } from 'lucide-react';

type View = 'timeline' | 'bracket';

function readView(): View {
  if (typeof window === 'undefined') return 'timeline';
  const v = new URLSearchParams(window.location.search).get('view');
  return v === 'bracket' ? 'bracket' : 'timeline';
}

function applyView(v: View) {
  const tl = document.getElementById('view-timeline');
  const br = document.getElementById('view-bracket');
  if (tl) tl.style.display = v === 'timeline' ? '' : 'none';
  if (br) br.style.display = v === 'bracket' ? '' : 'none';
}

export function TabRouter() {
  const [view, setView] = useState<View>(() => readView());

  useEffect(() => { applyView(view); }, [view]);

  useEffect(() => {
    const onPop = () => setView(readView());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const switchTo = (v: View) => {
    const url = new URL(window.location.href);
    if (v === 'timeline') url.searchParams.delete('view'); else url.searchParams.set('view', v);
    window.history.pushState({}, '', url);
    setView(v);
  };

  return (
    <div className="inline-flex items-center bg-white/5 border border-white/10 rounded-full p-1">
      <button onClick={() => switchTo('timeline')}
        aria-label="Xem dạng timeline"
        className={`px-3 py-1.5 rounded-full text-xs tracking-wider inline-flex items-center gap-1 transition ${view==='timeline' ? 'bg-[var(--gold)] text-[var(--bg-deep)] font-bold' : 'text-white/70 hover:text-white'}`}>
        <Calendar size={14} /> TIMELINE
      </button>
      <button onClick={() => switchTo('bracket')}
        aria-label="Xem dạng bracket"
        className={`px-3 py-1.5 rounded-full text-xs tracking-wider inline-flex items-center gap-1 transition ${view==='bracket' ? 'bg-[var(--gold)] text-[var(--bg-deep)] font-bold' : 'text-white/70 hover:text-white'}`}>
        <Trophy size={14} /> BRACKET
      </button>
    </div>
  );
}
