/**
 * Redirecionamento inteligente: URLs de busca por profissionais.
 *
 * Usa a Maps URLs API oficial (https://developers.google.com/maps/documentation/urls)
 * — o link abre o app nativo do Google Maps quando instalado (iOS/Android) ou o
 * navegador. Fallback: Google Busca, para quando o Maps não puder ser aberto.
 *
 * Regra da query: "[serviço] próximo a [região]" quando o usuário cadastrou a
 * região; sem região, a query vai só com o serviço e o próprio Maps busca perto
 * da posição atual do aparelho (sem exigir permissão de localização ao app).
 */

export function buildSearchQuery(service: string, location?: string | null): string {
  const trimmedLocation = location?.trim();
  const trimmedService = service.trim();
  return trimmedLocation ? `${trimmedService} próximo a ${trimmedLocation}` : trimmedService;
}

export function buildMapsSearchUrl(service: string, location?: string | null): string {
  const query = encodeURIComponent(buildSearchQuery(service, location));
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

export function buildWebSearchUrl(service: string, location?: string | null): string {
  const query = encodeURIComponent(buildSearchQuery(service, location));
  return `https://www.google.com/search?q=${query}`;
}
