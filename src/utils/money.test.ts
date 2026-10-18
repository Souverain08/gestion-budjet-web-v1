import { centsToInput, formatCurrency, parseAmountToCents } from './money';

describe('money', () => {
  it.each([
    ['12', 1200],
    ['12,5', 1250],
    ['12.05', 1205],
    ['1 234,56', 123456],
    ['0,99', 99],
  ])('lit « %s » comme %i centimes', (input, cents) => {
    expect(parseAmountToCents(input)).toBe(cents);
  });

  it.each(['', 'abc', '12,345', '-3', '1,2,3'])('refuse « %s »', (input) => {
    expect(parseAmountToCents(input)).toBeNull();
  });

  it('évite les erreurs de virgule flottante', () => {
    // 0,1 + 0,2 ne vaut pas 0,3 en flottant ; en centimes, si.
    expect(parseAmountToCents('0,1')! + parseAmountToCents('0,2')!).toBe(30);
  });

  it('prépare un montant pour la saisie', () => {
    expect(centsToInput(123450, 'fr')).toBe('1234,50');
    expect(centsToInput(5, 'en')).toBe('0.05');
  });

  it('formate selon la langue et la devise', () => {
    expect(formatCurrency(123456, 'EUR', 'fr')).toMatch(/1\s?234,56\s?€/);
    expect(formatCurrency(123456, 'EUR', 'en')).toBe('€1,234.56');
  });
});
