/**
 * Testes do redirecionamento inteligente (URLs de busca por profissionais).
 */
import { buildMapsSearchUrl, buildSearchQuery, buildWebSearchUrl } from '@/lib/maps';

describe('buildSearchQuery', () => {
  it('com região: "[serviço] próximo a [região]"', () => {
    expect(buildSearchQuery('Limpeza de calhas', 'Porto Alegre, RS')).toBe(
      'Limpeza de calhas próximo a Porto Alegre, RS',
    );
  });

  it('sem região (undefined, null ou em branco): só o serviço', () => {
    expect(buildSearchQuery('Telhadista')).toBe('Telhadista');
    expect(buildSearchQuery('Telhadista', null)).toBe('Telhadista');
    expect(buildSearchQuery('Telhadista', '   ')).toBe('Telhadista');
  });

  it('aceita CEP como região e apara espaços', () => {
    expect(buildSearchQuery(' Arborista ', ' 90000-000 ')).toBe('Arborista próximo a 90000-000');
  });
});

describe('buildMapsSearchUrl', () => {
  it('usa a Maps URLs API oficial com a query URL-encoded', () => {
    expect(buildMapsSearchUrl('Limpeza de calhas', 'Porto Alegre, RS')).toBe(
      'https://www.google.com/maps/search/?api=1&query=Limpeza%20de%20calhas%20pr%C3%B3ximo%20a%20Porto%20Alegre%2C%20RS',
    );
  });

  it('sem região a query é só o serviço', () => {
    expect(buildMapsSearchUrl('Telhadista')).toBe(
      'https://www.google.com/maps/search/?api=1&query=Telhadista',
    );
  });

  it('sanitiza caracteres especiais (& não vaza para a URL)', () => {
    const url = buildMapsSearchUrl('Poda & remoção', 'Bairro A&B');
    expect(url).toContain('Poda%20%26%20remo%C3%A7%C3%A3o');
    expect(url).toContain('A%26B');
    expect(url.split('&').length).toBe(2); // só o & do "api=1&query="
  });
});

describe('buildWebSearchUrl (fallback)', () => {
  it('gera busca no Google com a mesma query', () => {
    expect(buildWebSearchUrl('Limpeza de calhas', 'Porto Alegre, RS')).toBe(
      'https://www.google.com/search?q=Limpeza%20de%20calhas%20pr%C3%B3ximo%20a%20Porto%20Alegre%2C%20RS',
    );
  });
});
