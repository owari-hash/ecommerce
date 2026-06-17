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

export type MockCategory = {
  id: string
  name: string
  slug: string
  parentId: string | null
  image?: string
  status: 'active'
}

export const FOOD_MOCK_CATEGORIES: MockCategory[] = [
  { id: 'mc-fruit', name: 'Жимс, жимсгэнэ', slug: 'fresh-fruits', parentId: null, status: 'active' },
  { id: 'mc-veg', name: 'Хүнсний ногоо', slug: 'vegetables', parentId: null, status: 'active' },
  { id: 'mc-meat', name: 'Мах, махан бүтээгдэхүүн', slug: 'meat-poultry', parentId: null, status: 'active' },
  { id: 'mc-dairy', name: 'Сүүн бүтээгдэхүүн', slug: 'dairy-eggs', parentId: null, status: 'active' },
  { id: 'mc-sea', name: 'Далайн гаралтай', slug: 'seafood', parentId: null, status: 'active' },
  { id: 'mc-bak', name: 'Талх, нарийн боов', slug: 'bakery', parentId: null, status: 'active' },
  { id: 'mc-bev', name: 'Ундаа, ус', slug: 'beverages', parentId: null, status: 'active' },
  { id: 'mc-snk', name: 'Зууш, амттан', slug: 'snacks', parentId: null, status: 'active' },
  { id: 'mc-groc', name: 'Хүнс', slug: 'grocery', parentId: null, status: 'active' },
]

export const TECH_MOCK_CATEGORIES: MockCategory[] = [
  { id: 'mc-lap', name: 'Зөөврийн компьютер', slug: 'laptop', parentId: null, status: 'active' },
  { id: 'mc-com', name: 'Суурин компьютер', slug: 'computer', parentId: null, status: 'active' },
  { id: 'mc-phn', name: 'Ухаалаг төхөөрөмж', slug: 'smartphone-and-tablet', parentId: null, status: 'active' },
  { id: 'mc-con', name: 'Консоль', slug: 'console', parentId: null, status: 'active' },
  { id: 'mc-aud', name: 'Аудио төхөөрөмж', slug: 'audio-equipment', parentId: null, status: 'active' },
  { id: 'mc-acc', name: 'Дагалдах хэрэгсэл', slug: 'accessories', parentId: null, status: 'active' },
  { id: 'mc-hom', name: 'Бусад төхөөрөмж', slug: 'home', parentId: null, status: 'active' },
]

export const ALL_MOCK_CATEGORIES: MockCategory[] = [...TECH_MOCK_CATEGORIES, ...FOOD_MOCK_CATEGORIES]

export function getMockCategoriesByTenantId(tenantId: string): MockCategory[] {
  if (tenantId === 'foodcity') return FOOD_MOCK_CATEGORIES
  if (tenantId === 'goto-market') return TECH_MOCK_CATEGORIES
  return ALL_MOCK_CATEGORIES
}

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

export const CATEGORY_ICONS: Record<CatalogCategoryKey, string> = {
  laptop: '💻',
  computer: '🖥️',
  'smartphone-and-tablet': '📱',
  console: '🎮',
  'audio-equipment': '🎧',
  home: '🏠',
  accessories: '🖱️',
  grocery: '🛒',
  'fresh-fruits': '🍎',
  'meat-poultry': '🥩',
  'dairy-eggs': '🥛',
  seafood: '🐟',
  vegetables: '🥦',
  bakery: '🥐',
  beverages: '🥤',
  snacks: '🥨',
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
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop',
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
    image: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=400&h=300&fit=crop',
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
    image: 'https://images.unsplash.com/photo-1624705002806-5d72df19c3ad?w=400&h=300&fit=crop',
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
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop',
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
    image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400&h=300&fit=crop',
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
    image: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400&h=300&fit=crop',
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
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=300&fit=crop',
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
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop',
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
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop',
    props: [{ k: 'Төрөл', v: 'Ногоо' }],
  },
  // --- FoodCity extra products ---
  {
    id: 'g-006',
    slug: 'banana-1kg',
    name: 'Гадил жимс 1кг',
    brand: 'Импорт',
    category: 'fresh-fruits',
    price: 6500,
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=300&fit=crop',
    props: [{ k: 'Жин', v: '1кг' }],
  },
  {
    id: 'g-007',
    slug: 'orange-1kg',
    name: 'Жүрж 1кг',
    brand: 'Импорт',
    category: 'fresh-fruits',
    price: 9500,
    oldPrice: 11000,
    isSale: true,
    image: 'https://images.unsplash.com/photo-1547514701-42782101795e?w=400&h=300&fit=crop',
    props: [{ k: 'Жин', v: '1кг' }],
  },
  {
    id: 'g-008',
    slug: 'strawberry-500g',
    name: 'Гүзээлзгэнэ 500г',
    brand: 'Дотоодын',
    category: 'fresh-fruits',
    price: 12000,
    isNew: true,
    image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400&h=300&fit=crop',
    props: [{ k: 'Жин', v: '500г' }],
  },
  {
    id: 'g-009',
    slug: 'cherry-tomato-500g',
    name: 'Чери лооль 500г',
    brand: 'Дотоодын',
    category: 'vegetables',
    price: 8000,
    isNew: true,
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&h=300&fit=crop',
    props: [{ k: 'Жин', v: '500г' }],
  },
  {
    id: 'g-010',
    slug: 'bell-pepper-500g',
    name: 'Чинжүү 500г',
    brand: 'Дотоодын',
    category: 'vegetables',
    price: 6000,
    image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400&h=300&fit=crop',
    props: [{ k: 'Жин', v: '500г' }],
  },
  {
    id: 'g-011',
    slug: 'spinach-organic-200g',
    name: 'Органик Цоохор 200г',
    brand: 'Ногоон эрчим',
    category: 'vegetables',
    price: 4500,
    isNew: true,
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&h=300&fit=crop',
    props: [{ k: 'Жин', v: '200г' }],
  },
  {
    id: 'g-012',
    slug: 'chicken-breast-1kg',
    name: 'Тахианы цээж 1кг',
    brand: 'Мах Маркет',
    category: 'meat-poultry',
    price: 11500,
    isNew: true,
    image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&h=300&fit=crop',
    props: [{ k: 'Жин', v: '1кг' }],
  },
  {
    id: 'g-013',
    slug: 'lamb-chops-1kg',
    name: 'Хонины хавирган 1кг',
    brand: 'Мах Маркет',
    category: 'meat-poultry',
    price: 28500,
    image: 'https://images.unsplash.com/photo-1514516870595-a42da14de044?w=400&h=300&fit=crop',
    props: [{ k: 'Жин', v: '1кг' }],
  },
  {
    id: 'g-014',
    slug: 'salmon-steak-500g',
    name: 'Сёмга загасны стейк 500г',
    brand: 'Далайн гарал',
    category: 'seafood',
    price: 35000,
    isNew: true,
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&h=300&fit=crop',
    props: [{ k: 'Жин', v: '500г' }],
  },
  {
    id: 'g-015',
    slug: 'tuna-in-olive-oil',
    name: 'Тунец чанасан (лонх)',
    brand: 'Rio Mare',
    category: 'seafood',
    price: 12500,
    image: 'https://images.unsplash.com/photo-1534482421-64566f976cfa?w=400&h=300&fit=crop',
    props: [{ k: 'Хэмжээ', v: '160г' }],
  },
  {
    id: 'g-016',
    slug: 'greek-yogurt-500g',
    name: 'Грек тараг 500г',
    brand: 'СҮҮ ХК',
    category: 'dairy-eggs',
    price: 5500,
    isNew: true,
    image: 'https://images.unsplash.com/photo-1488477181228-c84b53b6e79c?w=400&h=300&fit=crop',
    props: [{ k: 'Хэмжээ', v: '500г' }],
  },
  {
    id: 'g-017',
    slug: 'cream-cheese-200g',
    name: 'Зөөхий бяслаг 200г',
    brand: 'President',
    category: 'dairy-eggs',
    price: 7500,
    image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&h=300&fit=crop',
    props: [{ k: 'Хэмжээ', v: '200г' }],
  },
  {
    id: 'g-018',
    slug: 'whole-wheat-bread-750g',
    name: 'Хатуу гурилын талх 750г',
    brand: 'Батбайгаль',
    category: 'bakery',
    price: 3500,
    isNew: true,
    image: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=400&h=300&fit=crop',
    props: [{ k: 'Жин', v: '750г' }],
  },
  {
    id: 'g-019',
    slug: 'croissant-4pc',
    name: 'Круассан 4ш',
    brand: 'Paris Bakery',
    category: 'bakery',
    price: 7500,
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=300&fit=crop',
    props: [{ k: 'Тоо', v: '4ш' }],
  },
  {
    id: 'g-020',
    slug: 'orange-juice-fresh-1l',
    name: 'Шүүсэн жүрж жүс 1л',
    brand: 'FreshBox',
    category: 'beverages',
    price: 8500,
    oldPrice: 10500,
    isSale: true,
    image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&h=300&fit=crop',
    props: [{ k: 'Хэмжээ', v: '1л' }],
  },
  {
    id: 'g-021',
    slug: 'sparkling-water-1-5l',
    name: 'Булаг рашаан ус 1.5л',
    brand: 'Эрдэнэт',
    category: 'beverages',
    price: 2500,
    image: 'https://images.unsplash.com/photo-1543253687-c931c8e01820?w=400&h=300&fit=crop',
    props: [{ k: 'Хэмжээ', v: '1.5л' }],
  },
  {
    id: 'g-022',
    slug: 'energy-drink-250ml',
    name: 'Эрчим хүчний ундаа 250мл',
    brand: 'Red Bull',
    category: 'beverages',
    price: 3500,
    isNew: true,
    image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=400&h=300&fit=crop',
    props: [{ k: 'Хэмжээ', v: '250мл' }],
  },
  {
    id: 'g-023',
    slug: 'potato-chips-150g',
    name: 'Төмсний чипс 150г',
    brand: "Lay's",
    category: 'snacks',
    price: 5500,
    image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&h=300&fit=crop',
    props: [{ k: 'Жин', v: '150г' }],
  },
  {
    id: 'g-024',
    slug: 'dark-chocolate-100g',
    name: 'Харанхуй шоколад 100г 70%',
    brand: 'Lindt',
    category: 'snacks',
    price: 4500,
    isNew: true,
    image: 'https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=400&h=300&fit=crop',
    props: [{ k: 'Жин', v: '100г' }, { k: 'Какао', v: '70%' }],
  },
  {
    id: 'g-025',
    slug: 'watermelon-5kg',
    name: 'Тарвас ~5кг',
    brand: 'Дотоодын',
    category: 'fresh-fruits',
    price: 15000,
    oldPrice: 18000,
    isSale: true,
    image: 'https://images.unsplash.com/photo-1568909344668-6f14a07b56a0?w=400&h=300&fit=crop',
    props: [{ k: 'Жин', v: '~5кг' }],
  },
  // --- GoTo Market extra tech products ---
  {
    id: 't-001',
    slug: 'iphone-16-pro-256gb',
    name: 'iPhone 16 Pro 256GB',
    brand: 'Apple',
    category: 'smartphone-and-tablet',
    price: 3290000,
    isNew: true,
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&h=300&fit=crop',
    props: [{ k: 'Санах ой', v: '256GB' }, { k: 'Чип', v: 'A18 Pro' }],
  },
  {
    id: 't-002',
    slug: 'samsung-galaxy-s25-ultra',
    name: 'Samsung Galaxy S25 Ultra 256GB',
    brand: 'Samsung',
    category: 'smartphone-and-tablet',
    price: 2490000,
    oldPrice: 2890000,
    isSale: true,
    image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&h=300&fit=crop',
    props: [{ k: 'Санах ой', v: '256GB' }, { k: 'Дэлгэц', v: '6.9" QHD+' }],
  },
  {
    id: 't-003',
    slug: 'ipad-pro-m4-11-inch',
    name: 'iPad Pro M4 11" 256GB',
    brand: 'Apple',
    category: 'smartphone-and-tablet',
    price: 2390000,
    isNew: true,
    image: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=400&h=300&fit=crop',
    props: [{ k: 'Чип', v: 'M4' }, { k: 'Дэлгэц', v: '11"' }],
  },
  {
    id: 't-004',
    slug: 'samsung-65-qled-tv',
    name: 'Samsung 65" QLED 4K Smart TV',
    brand: 'Samsung',
    category: 'home',
    price: 3890000,
    oldPrice: 4590000,
    isSale: true,
    image: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=400&h=300&fit=crop',
    props: [{ k: 'Дэлгэц', v: '65"' }, { k: 'Нягтрал', v: '4K' }],
  },
  {
    id: 't-005',
    slug: 'lg-ultragear-27-monitor',
    name: 'LG UltraGear 27" 165Hz Gaming Monitor',
    brand: 'LG',
    category: 'computer',
    price: 1290000,
    isNew: true,
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&h=300&fit=crop',
    props: [{ k: 'Дэлгэц', v: '27"' }, { k: 'Давтамж', v: '165Hz' }],
  },
  {
    id: 't-006',
    slug: 'airpods-pro-2',
    name: 'AirPods Pro 2nd Gen',
    brand: 'Apple',
    category: 'audio-equipment',
    price: 590000,
    isNew: true,
    image: 'https://images.unsplash.com/photo-1606741965509-717a9e63c0f2?w=400&h=300&fit=crop',
    props: [{ k: 'Холболт', v: 'Bluetooth 5.3' }],
  },
  {
    id: 't-007',
    slug: 'jbl-charge-5',
    name: 'JBL Charge 5 Bluetooth Speaker',
    brand: 'JBL',
    category: 'audio-equipment',
    price: 290000,
    oldPrice: 390000,
    isSale: true,
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=300&fit=crop',
    props: [{ k: 'Холболт', v: 'Bluetooth' }, { k: 'Цаг', v: '20 цаг' }],
  },
  {
    id: 't-008',
    slug: 'ps5-slim',
    name: 'PlayStation 5 Slim',
    brand: 'Sony',
    category: 'console',
    price: 1690000,
    isNew: true,
    image: 'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=400&h=300&fit=crop',
    props: [{ k: 'Хадгалалт', v: '1TB SSD' }],
  },
  {
    id: 't-009',
    slug: 'xbox-series-x',
    name: 'Xbox Series X 1TB',
    brand: 'Microsoft',
    category: 'console',
    price: 1490000,
    oldPrice: 1790000,
    isSale: true,
    image: 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=400&h=300&fit=crop',
    props: [{ k: 'Хадгалалт', v: '1TB SSD' }],
  },
  {
    id: 't-010',
    slug: 'nintendo-switch-2',
    name: 'Nintendo Switch 2',
    brand: 'Nintendo',
    category: 'console',
    price: 1290000,
    isNew: true,
    image: 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=400&h=300&fit=crop',
    props: [{ k: 'Дэлгэц', v: '7" LCD' }],
  },
  {
    id: 't-011',
    slug: 'logitech-mx-master-3s',
    name: 'Logitech MX Master 3S Mouse',
    brand: 'Logitech',
    category: 'accessories',
    price: 290000,
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=300&fit=crop',
    props: [{ k: 'Холболт', v: 'Wireless / Bluetooth' }],
  },
  {
    id: 't-012',
    slug: 'razer-huntsman-v3-keyboard',
    name: 'Razer Huntsman V3 Mechanical Keyboard',
    brand: 'Razer',
    category: 'accessories',
    price: 390000,
    isNew: true,
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&h=300&fit=crop',
    props: [{ k: 'Холболт', v: 'USB-C' }, { k: 'Арын гэрэл', v: 'RGB' }],
  },
  {
    id: 't-013',
    slug: 'usb-c-hub-7-in-1',
    name: 'USB-C Hub 7-in-1',
    brand: 'Anker',
    category: 'accessories',
    price: 159000,
    image: 'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=400&h=300&fit=crop',
    props: [{ k: 'Порт', v: '7-in-1' }],
  },
  {
    id: 't-014',
    slug: 'dell-4k-monitor-32',
    name: 'Dell 4K 32" USB-C Monitor',
    brand: 'Dell',
    category: 'computer',
    price: 1590000,
    image: 'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=400&h=300&fit=crop',
    props: [{ k: 'Дэлгэц', v: '32"' }, { k: 'Нягтрал', v: '4K UHD' }],
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
