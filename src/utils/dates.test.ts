import { currentBudgetMonth, shiftMonth } from './dates';

describe('dates', () => {
  it('reste sur le mois précédent avant le jour de début (RG-02)', () => {
    expect(currentBudgetMonth(25, new Date(2026, 9, 24))).toEqual({ year: 2026, month: 9 });
    expect(currentBudgetMonth(25, new Date(2026, 9, 25))).toEqual({ year: 2026, month: 10 });
    expect(currentBudgetMonth(5, new Date(2026, 0, 2))).toEqual({ year: 2025, month: 12 });
  });

  it('passe d’une année à l’autre', () => {
    expect(shiftMonth({ year: 2026, month: 12 }, 1)).toEqual({ year: 2027, month: 1 });
    expect(shiftMonth({ year: 2026, month: 1 }, -1)).toEqual({ year: 2025, month: 12 });
  });
});
