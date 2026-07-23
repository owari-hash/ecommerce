import {
  Laptop, Monitor, Smartphone, Gamepad2, Headphones, Home as HomeIcon, Mouse,
  ShoppingCart, Apple, Beef, Milk, Fish, Carrot, Croissant, CupSoda, Cookie,
  type LucideIcon,
} from 'lucide-react';

export type CatalogCategoryKey =
  | 'laptop'
  | 'computer'
  | 'smartphone-and-tablet'
  | 'console'
  | 'audio-equipment'
  | 'home'
  | 'accessories'
  | 'grocery'
  | 'fresh-fruits'
  | 'meat-poultry'
  | 'dairy-eggs'
  | 'seafood'
  | 'vegetables'
  | 'bakery'
  | 'beverages'
  | 'snacks';

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
  image?: string;
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
  grocery: 'Хүнс',
  'fresh-fruits': 'Жимс, жимсгэнэ',
  'meat-poultry': 'Мах, махан бүтээгдэхүүн',
  'dairy-eggs': 'Сүүн бүтээгдэхүүн',
  seafood: 'Далайн гаралтай бүтээгдэхүүн',
  vegetables: 'Хүнсний ногоо',
  bakery: 'Талх, нарийн боов',
  beverages: 'Ундаа, ус',
  snacks: 'Зууш, амттан',
};

export const CATEGORY_ICONS: Record<CatalogCategoryKey, LucideIcon> = {
  laptop: Laptop,
  computer: Monitor,
  'smartphone-and-tablet': Smartphone,
  console: Gamepad2,
  'audio-equipment': Headphones,
  home: HomeIcon,
  accessories: Mouse,
  grocery: ShoppingCart,
  'fresh-fruits': Apple,
  'meat-poultry': Beef,
  'dairy-eggs': Milk,
  seafood: Fish,
  vegetables: Carrot,
  bakery: Croissant,
  beverages: CupSoda,
  snacks: Cookie,
};

export function formatPrice(n: number) {
  return `${n.toLocaleString('mn-MN')}₮`;
}

export const MOCK_PRODUCTS: CatalogProduct[] = [
  // Laptops
  {
    id: '10020090',
    slug: 'acer-predator-helios-neo-16-i9-14900hx-16gb-1tb-ssd-rtx-4060-fhd-240hz-10020090',
    name: 'Acer Predator Helios Neo 16 i9-14900HX 16GB 1TB SSD RTX 4060 FHD 240Hz',
    brand: 'ACER',
    category: 'laptop',
    price: 4990000,
    isNew: true,
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1200&h=1200&fit=crop&q=90',
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
    image: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=1200&h=1200&fit=crop&q=90',
    props: [
      { k: 'Төлөв', v: 'Шинэ' },
      { k: 'Санах ойшил', v: '16GB' },
      { k: 'Багтаамж', v: '512GB SSD' },
      { k: 'Өнгө', v: 'Silver' },
    ],
  },
  // Computers/Parts
  {
    id: '13030026',
    slug: 'asus-tuf-gaming-geforce-rtx-5070-oc-edition-12gb-gddr7-13030026',
    name: 'ASUS TUF Gaming GeForce RTX 5070 OC Edition 12GB GDDR7',
    brand: 'ASUS',
    category: 'computer',
    price: 2890000,
    image: 'https://images.unsplash.com/photo-1624705002806-5d72df19c3ad?w=1200&h=1200&fit=crop&q=90',
    props: [
      { k: 'Төлөв', v: 'Шинэ' },
      { k: 'Ангилал', v: 'Graphic card' },
      { k: 'Санах ой', v: '12GB' },
    ],
  },
  // Audio
  {
    id: '22010001',
    slug: 'sony-wh-1000xm5-22010001',
    name: 'Sony WH-1000XM5',
    brand: 'SONY',
    category: 'audio-equipment',
    price: 890000,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&h=1200&fit=crop&q=90',
    oldPrice: 990000,
    isSale: true,
    props: [
      { k: 'Төлөв', v: 'Шинэ' },
      { k: 'Төрөл', v: 'Wireless headphones' },
    ],
  },
  // Grocery - Fresh Fruits
  {
    id: 'g-001',
    slug: 'fuji-apple-1kg',
    name: 'Фужи Алим 1кг',
    brand: 'Импорт',
    category: 'fresh-fruits',
    price: 8500,
    image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=1200&h=1200&fit=crop&q=90',
    props: [{ k: 'Төрөл', v: 'Жимс' }, { k: 'Жин', v: '1кг' }],
  },
  // Grocery - Meat
  {
    id: 'g-002',
    slug: 'beef-steak-premium',
    name: 'Үхрийн цул мах (Премиум)',
    brand: 'Мах Маркет',
    category: 'meat-poultry',
    price: 24500,
    isNew: true,
    image: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=1200&h=1200&fit=crop&q=90',
    props: [{ k: 'Төрөл', v: 'Үхрийн мах' }, { k: 'Жин', v: '1кг' }],
  },
  // Grocery - Dairy
  {
    id: 'g-003',
    slug: 'suu-milk-1l',
    name: 'Сүү ХК - Цэвэр сүү 1л',
    brand: 'СҮҮ ХК',
    category: 'dairy-eggs',
    price: 3800,
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=1200&h=1200&fit=crop&q=90',
    props: [{ k: 'Төрөл', v: 'Сүү' }, { k: 'Хэмжээ', v: '1л' }],
  },
  // Grocery - Bakery
  {
    id: 'g-004',
    slug: 'baguette-fresh',
    name: 'Франц Багет',
    brand: 'Батбайгаль',
    category: 'bakery',
    price: 2500,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&h=1200&fit=crop&q=90',
    props: [{ k: 'Төрөл', v: 'Талх' }],
  },
  // Grocery - Vegetables
  {
    id: 'g-005',
    slug: 'broccoli-organic',
    name: 'Брокколи (Органик)',
    brand: 'Дотоодын',
    category: 'vegetables',
    price: 6500,
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=1200&h=1200&fit=crop&q=90',
    props: [{ k: 'Төрөл', v: 'Ногоо' }],
  },
];

export function getProductsByCategory(category: CatalogCategoryKey) {
  if (category === 'grocery') {
    return MOCK_PRODUCTS.filter((p) => 
      ['fresh-fruits', 'meat-poultry', 'dairy-eggs', 'seafood', 'vegetables', 'bakery', 'beverages', 'snacks'].includes(p.category)
    );
  }
  return MOCK_PRODUCTS.filter((p) => p.category === category);
}

export function getProductBySlug(slug: string) {
  return MOCK_PRODUCTS.find((p) => p.slug === slug);
}

export function getRelatedProducts(p: CatalogProduct) {
  return MOCK_PRODUCTS.filter((x) => x.category === p.category && x.slug !== p.slug).slice(0, 12);
}
