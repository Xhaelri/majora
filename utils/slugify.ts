export function slugifyAdvanced(text: string): string {
  return text
    .toString()
    .normalize('NFD') // Normalize diacritics
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w-]+/g, '') // Remove all non-word chars (leaving only alphanumeric and hyphens)
    .replace(/--+/g, '-'); // Replace multiple - with single -
}