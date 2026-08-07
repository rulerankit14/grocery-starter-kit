import dryfruits from "@/assets/dryfruits.jpg";
import groceryCombo from "@/assets/grocery-combo.jpg";
import spices from "@/assets/spices.jpg";
import household from "@/assets/household.jpg";
import beverages from "@/assets/beverages.jpg";

export type Review = {
  name: string;
  initials: string;
  stars: number;
  date: string;
  text: string;
  likes: number;
};

export type Product = {
  id: string;
  title: string;
  image: string;
  price: number;
  mrp: number;
  rating: number;
  ratingCount: number;
  freeDelivery: boolean;
  highlights: string[];
  description: string;
  reviews: Review[];
};

export const products: Product[] = [
  {
    id: "mix-dry-fruits-4kg",
    title:
      "Premium 4KG Mix Dry Fruits Combo - Almonds, Cashews, Pistachios & Kishmish (1KG Each)",
    image: dryfruits,
    price: 199,
    mrp: 5999,
    rating: 4.4,
    ratingCount: 4320,
    freeDelivery: true,
    description:
      "Upgrade your daily nutrition with this value-packed 4 kg dry fruits combo. Each pack contains 1 kg each of almonds, cashews, pistachios and kishmish, carefully sorted and hygienically packed to lock in freshness.",
    highlights: [
      "Best for daily use, festive gifting and snacking",
      "4 varieties in one pack - almonds, cashews, pistachios, kishmish",
      "1 KG each - total 4 KG value pack",
      "Rich in protein, fibre and healthy fats",
      "Hygienically packed and sealed for freshness",
    ],
    reviews: [
      {
        name: "Neha Sharma",
        initials: "NS",
        stars: 5,
        date: "12 Jul 2026",
        text: "Really impressed with the quality. Nuts were fresh and packing was neat. Delivery was quick too.",
        likes: 142,
      },
      {
        name: "Priya Nair",
        initials: "PN",
        stars: 4,
        date: "08 Jul 2026",
        text: "Product is exactly as shown in the picture. Cashews were good and pistachios were tasty. Will order again.",
        likes: 96,
      },
      {
        name: "Rekha Kulkarni",
        initials: "RK",
        stars: 5,
        date: "02 Jul 2026",
        text: "Value for money for this quantity. Everyone at home liked it. Highly recommended for festive season.",
        likes: 88,
      },
      {
        name: "Ayesha Ibrahim",
        initials: "AI",
        stars: 4,
        date: "27 Jun 2026",
        text: "Good quantity for the price. Kishmish was a bit sweet but overall satisfied with the order.",
        likes: 54,
      },
      {
        name: "Divya Shetty",
        initials: "DS",
        stars: 5,
        date: "21 Jun 2026",
        text: "Ordered for Diwali gifting and it turned out great. Packaging was strong, nothing was damaged.",
        likes: 47,
      },
    ],
  },
  {
    id: "essential-grocery-combo",
    title:
      "Essential Grocery Mega Saver Combo - Atta 10KG, Basmati Rice 5KG, Refined Oil 5L & Sugar 5KG",
    image: groceryCombo,
    price: 199,
    mrp: 2499,
    rating: 4.2,
    ratingCount: 2871,
    freeDelivery: true,
    description:
      "A complete monthly kitchen combo covering your everyday essentials - chakki fresh atta, long grain basmati rice, refined soya oil and fine grain sugar, all in one saver pack.",
    highlights: [
      "Chakki fresh atta 10 KG",
      "Long grain basmati rice 5 KG",
      "Refined soya health oil 5 Litre",
      "Fine grain sugar 5 KG",
      "Ideal one-shot monthly ration pack",
    ],
    reviews: [
      {
        name: "Sunita Rao",
        initials: "SR",
        stars: 4,
        date: "10 Jul 2026",
        text: "Everything arrived sealed and in good condition. Atta quality is nice, rotis come out soft.",
        likes: 63,
      },
      {
        name: "Manoj Verma",
        initials: "MV",
        stars: 5,
        date: "05 Jul 2026",
        text: "Big saving compared to buying separately. Rice grains are long and cook well.",
        likes: 41,
      },
    ],
  },
  {
    id: "masala-spice-combo",
    title:
      "Everyday Masala Combo Pack - Turmeric, Red Chilli, Coriander & Garam Masala (500g Each)",
    image: spices,
    price: 149,
    mrp: 999,
    rating: 4.3,
    ratingCount: 1642,
    freeDelivery: true,
    description:
      "Four kitchen staple masalas ground fresh and packed airtight. Strong aroma, natural colour and no added artificial flavour.",
    highlights: [
      "4 essential masalas in one box",
      "500 g each - 2 KG total",
      "Fresh ground, strong aroma",
      "Airtight resealable packs",
    ],
    reviews: [
      {
        name: "Farida Sheikh",
        initials: "FS",
        stars: 5,
        date: "09 Jul 2026",
        text: "Aroma is very good, colour of the chilli powder is natural. Happy with the purchase.",
        likes: 37,
      },
      {
        name: "Kavita Joshi",
        initials: "KJ",
        stars: 4,
        date: "01 Jul 2026",
        text: "Decent masala for daily cooking. Packing was tight and nothing spilled.",
        likes: 22,
      },
    ],
  },
  {
    id: "household-care-combo",
    title:
      "Household Cleaning Combo - Detergent Powder 5KG, Dishwash Liquid 1L & 5 Soap Bars",
    image: household,
    price: 189,
    mrp: 1299,
    rating: 4.1,
    ratingCount: 987,
    freeDelivery: false,
    description:
      "Everything you need to keep the home spotless - a bulk detergent powder pack, a lemon dishwash liquid and a set of five soap bars.",
    highlights: [
      "Detergent powder 5 KG",
      "Lemon dishwash liquid 1 Litre",
      "5 laundry soap bars",
      "Tough on stains, gentle on hands",
    ],
    reviews: [
      {
        name: "Ritu Malhotra",
        initials: "RM",
        stars: 4,
        date: "06 Jul 2026",
        text: "Detergent works well on regular clothes. Dishwash liquid smells fresh.",
        likes: 19,
      },
    ],
  },
  {
    id: "tea-coffee-combo",
    title: "Tea, Coffee & Biscuit Saver Combo - Assam Tea 1KG, Coffee 200g & 6 Biscuit Packs",
    image: beverages,
    price: 179,
    mrp: 1099,
    rating: 4.5,
    ratingCount: 2114,
    freeDelivery: true,
    description:
      "Strong Assam tea leaves, rich instant coffee and a set of six biscuit packs - the perfect chai-time bundle for the whole family.",
    highlights: [
      "Assam CTC tea 1 KG",
      "Instant coffee 200 g",
      "6 assorted biscuit packs",
      "Great value chai-time bundle",
    ],
    reviews: [
      {
        name: "Anita Desai",
        initials: "AD",
        stars: 5,
        date: "11 Jul 2026",
        text: "Tea is strong and gives good colour. Biscuits were fresh. Very good deal.",
        likes: 58,
      },
      {
        name: "Suresh Iyer",
        initials: "SI",
        stars: 4,
        date: "03 Jul 2026",
        text: "Coffee is nice for the price. Delivery took 4 days but packaging was fine.",
        likes: 26,
      },
    ],
  },
];

export function getProduct(id: string) {
  return products.find((p) => p.id === id);
}

export function discountPercent(price: number, mrp: number) {
  return Math.round(((mrp - price) / mrp) * 100);
}
