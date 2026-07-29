export function slugify(text: string): string {
  if (!text) return '';
  const cyrillicMap: Record<string, string> = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'j',
    'з': 'z', 'и': 'i', 'й': 'i', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
    'ө': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ү': 'u', 'ф': 'f',
    'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sh', 'ъ': '', 'ы': 'y', 'ь': 'i',
    'э': 'e', 'ю': 'yu', 'я': 'ya'
  };
  const str = text.toLowerCase();
  let result = '';
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    result += cyrillicMap[char] ?? char;
  }
  return result
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function getCategorySlug(cat: { slug?: string; id?: string; _id?: string; name?: string } | null | undefined): string {
  if (!cat) return '';
  const s = cat.slug?.trim();
  if (s && s !== '-' && s !== '') {
    return s;
  }
  if (cat.id) return cat.id;
  if (cat._id) return cat._id;
  if (cat.name) {
    const generated = slugify(cat.name);
    if (generated && generated !== '-') return generated;
  }
  return '';
}
