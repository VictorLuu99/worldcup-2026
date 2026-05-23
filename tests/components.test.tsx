import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { TeamLabel } from '~/components/shared/TeamLabel';
import { PhaseBadge } from '~/components/shared/PhaseBadge';
import type { Team } from '~/lib/schemas';

afterEach(() => { cleanup(); });

const teams: Team[] = [
  { code: 'USA', nameVi: 'Mỹ', nameEn: 'United States', flagClass: 'us', qualified: true, group: 'D' },
];

describe('TeamLabel', () => {
  it('renders Vietnamese name for real team', () => {
    render(<TeamLabel teamRef={{ type: 'team', code: 'USA' }} teams={teams} />);
    expect(screen.getByText('Mỹ')).toBeInTheDocument();
  });

  it('renders placeholder label in italic style', () => {
    render(<TeamLabel teamRef={{ type: 'placeholder', label: 'Nhất A' }} teams={teams} />);
    expect(screen.getByText('Nhất A')).toBeInTheDocument();
  });
});

describe('PhaseBadge', () => {
  it('renders Vietnamese phase label', () => {
    render(<PhaseBadge phase="qf" />);
    expect(screen.getByText('TỨ KẾT')).toBeInTheDocument();
  });

  it('renders all 7 phase labels', () => {
    const phases = ['group', 'r32', 'r16', 'qf', 'sf', 'third', 'final'] as const;
    const expectedLabels = ['VÒNG BẢNG', 'VÒNG 32 ĐỘI', 'VÒNG 16 ĐỘI', 'TỨ KẾT', 'BÁN KẾT', 'TRANH HẠNG BA', 'CHUNG KẾT'];
    phases.forEach((phase, i) => {
      const { unmount } = render(<PhaseBadge phase={phase} />);
      expect(screen.getByText(expectedLabels[i])).toBeInTheDocument();
      unmount();
    });
  });
});
