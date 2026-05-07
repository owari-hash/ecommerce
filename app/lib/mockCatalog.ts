export type CatalogCategoryKey =
  | 'laptop'
  | 'computer'
  | 'smartphone-and-tablet'
  | 'console'
  | 'audio-equipment'
  | 'home'
  | 'accessories';

export type CatalogProduct = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: CatalogCategoryKey;
  price: number;
  oldPrice?: number;
  isNew?: boolean;
  isSale?: boolean;
  props: Array<{ k: string; v: string }>;
};

export const CATEGORY_LABELS: Record<CatalogCategoryKey, string> = {
  laptop: 'Зөөврийн компьютер',
  computer: 'Суурин компьютер',
  'smartphone-and-tablet': 'Ухаалаг төхөөрөмж',
  console: 'Консоль',
  'audio-equipment': 'Аудио төхөөрөмж',
  home: 'Бусад төхөөрөмж',
  accessories: 'Дагалдах хэрэгсэл',
};

export const CATEGORY_ICONS: Record<CatalogCategoryKey, string> = {
  laptop: '💻',
  computer: '🖥️',
  'smartphone-and-tablet': '📱',
  console: '🎮',
  'audio-equipment': '🎧',
  home: '🏠',
  accessories: '🖱️',
};

export function formatPrice(n: number) {
  return `${n.toLocaleString('mn-MN')}₮`;
}

export const MOCK_PRODUCTS: CatalogProduct[] = [
  {
    id: '10020090',
    slug: 'acer-predator-helios-neo-16-i9-14900hx-16gb-1tb-ssd-rtx-4060-fhd-240hz-10020090',
    name: 'Acer Predator Helios Neo 16 i9-14900HX 16GB 1TB SSD RTX 4060 FHD 240Hz',
    brand: 'ACER',
    category: 'laptop',
    price: 4990000,
    isNew: true,
    props: [
      { k: 'Төлөв', v: 'Шинэ' },
      { k: 'Санах ойшил', v: '16GB' },
      { k: 'Багтаамж', v: '1TB SSD' },
      { k: 'Процессор', v: 'Intel Core i9 14-р үе' },
      { k: 'Дэлгэц', v: '1920x1080, 240Hz, FHD' },
      { k: 'Дэлгэцийн хэмжээ', v: '16"' },
    ],
  },
  {
    id: '10020012',
    slug: 'macbook-air-m3-13-512gb-10020012',
    name: 'MacBook Air M3 13" 16GB 512GB',
    brand: 'Apple',
    category: 'laptop',
    price: 3490000,
    oldPrice: 3790000,
    isSale: true,
    props: [
      { k: 'Төлөв', v: 'Шинэ' },
      { k: 'Санах ойшил', v: '16GB' },
      { k: 'Багтаамж', v: '512GB SSD' },
      { k: 'Өнгө', v: 'Silver' },
    ],
  },
  {
    id: '13030026',
    slug: 'asus-tuf-gaming-geforce-rtx-5070-oc-edition-12gb-gddr7-13030026',
    name: 'ASUS TUF Gaming GeForce RTX 5070 OC Edition 12GB GDDR7',
    brand: 'ASUS',
    category: 'computer',
    price: 2890000,
    props: [
      { k: 'Төлөв', v: 'Шинэ' },
      { k: 'Ангилал', v: 'Graphic card' },
      { k: 'Санах ой', v: '12GB' },
    ],
  },
  {
    id: '22010001',
    slug: 'sony-wh-1000xm5-22010001',
    name: 'Sony WH-1000XM5',
    brand: 'SONY',
    category: 'audio-equipment',
    price: 890000,
    oldPrice: 990000,
    isSale: true,
    props: [
      { k: 'Төлөв', v: 'Шинэ' },
      { k: 'Төрөл', v: 'Wireless headphones' },
    ],
  },
  {
    id: '33010001',
    slug: 'playstation-5-slim-33010001',
    name: 'PlayStation 5 Slim',
    brand: 'SONY',
    category: 'console',
    price: 1990000,
    isNew: true,
    props: [
      { k: 'Төлөв', v: 'Шинэ' },
      { k: 'Төрөл', v: 'Console' },
    ],
  },
  {
    id: '44010001',
    slug: 'fantech-xd5-gaming-mouse-44010001',
    name: 'FANTECH XD5 Gaming Mouse',
    brand: 'FANTECH',
    category: 'accessories',
    price: 45000,
    oldPrice: 55000,
    isSale: true,
    props: [
      { k: 'Төлөв', v: 'Шинэ' },
      { k: 'Төрөл', v: 'Mouse' },
    ],
  },
];

export function getProductsByCategory(category: CatalogCategoryKey) {
  return MOCK_PRODUCTS.filter((p) => p.category === category);
}

export function getProductBySlug(slug: string) {
  return MOCK_PRODUCTS.find((p) => p.slug === slug);
}

export function getRelatedProducts(p: CatalogProduct) {
  return MOCK_PRODUCTS.filter((x) => x.category === p.category && x.slug !== p.slug).slice(0, 12);
}

