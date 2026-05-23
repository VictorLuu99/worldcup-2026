interface Props { flagClass: string | null; className?: string; }

export function Flag({ flagClass, className = '' }: Props) {
  if (!flagClass) {
    return <span className={`inline-block w-6 h-4 rounded-sm bg-white/10 border border-white/15 ${className}`} aria-hidden />;
  }
  return <span className={`fi fi-${flagClass} rounded-sm ${className}`} style={{ display: 'inline-block', width: '24px', height: '16px' }} aria-hidden />;
}
