import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  ArrowDown, ArrowDownRight, ArrowLeft, ArrowRight, ArrowUpRight, BadgeCheck,
  Bell, Bike, Check, CheckCircle2, ChevronDown, ChevronRight, Clock3,
  ChefHat, Heart, Leaf, LocateFixed, MapPin, Menu, Minus, Package, Plus, Search,
  ShieldCheck, ShoppingBag, SlidersHorizontal, Sparkles, Star, Store, Trash2, Truck, UserRound,
  X,
} from 'lucide-react';
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet';

const image = (id, width = 700) => `https://images.unsplash.com/${id === 'photo-1615485290382-441e4d049cb5' ? 'photo-1716816211590-c15a328a5ff0' : id}?auto=format&fit=crop&w=${width}&q=85`;
const products = [
  { id: 'turmeric', name: 'Lakadong Turmeric', subtitle: 'The golden one', price: 249, unit: '100 g', origin: 'Meghalaya', rating: '4.9', tag: 'BESTSELLER', image: image('photo-1702041295331-840d4d9aa7c9'), color: '#d7a12b' },
  { id: 'pepper', name: 'Malabar Black Pepper', subtitle: 'Bold & beautifully warm', price: 189, unit: '100 g', origin: 'Wayanad', rating: '4.8', tag: 'SMALL BATCH', image: image('photo-1716816211590-c15a328a5ff0'), color: '#35372a' },
  { id: 'chilli', name: 'Byadgi Chilli', subtitle: 'A gentle, brilliant heat', price: 159, unit: '100 g', origin: 'Karnataka', rating: '4.9', tag: 'SUN DRIED', image: image('photo-1588252303782-cb80119abd6d'), color: '#ad4931' },
  { id: 'cardamom', name: 'Green Cardamom', subtitle: 'Little pods, big perfume', price: 329, unit: '50 g', origin: 'Idukki', rating: '5.0', tag: 'RARE FIND', image: image('photo-1642255521852-7e7c742ac58f'), color: '#66805b' },
  { id: 'cumin', name: 'Royal Cumin Seeds', subtitle: 'Earthy, nutty, essential', price: 129, unit: '100 g', origin: 'Rajasthan', rating: '4.7', tag: 'FARM FRESH', image: image('photo-1596040033229-a9821ebd058d'), color: '#a77c47' },
  { id: 'cinnamon', name: 'True Ceylon Cinnamon', subtitle: 'Sweet with a soft warmth', price: 219, unit: '50 g', origin: 'Kerala', rating: '4.8', tag: 'HAND ROLLED', image: image('photo-1716816211590-c15a328a5ff0'), color: '#9b5e3f' },
  { id: 'cloves', name: 'Handpicked Cloves', subtitle: 'Sweet, deep and aromatic', price: 179, unit: '50 g', origin: 'Kerala', rating: '4.8', tag: 'SMALL BATCH', image: image('photo-1716816211590-c15a328a5ff0'), color: '#544035' },
  { id: 'coriander', name: 'Stone-Ground Coriander', subtitle: 'Citrusy, mellow and fresh', price: 99, unit: '100 g', origin: 'Rajasthan', rating: '4.7', tag: 'MILL FRESH', image: image('photo-1716816211590-c15a328a5ff0'), color: '#ad9854' },
  { id: 'fennel', name: 'Sweet Saunf Fennel', subtitle: 'A lovely little finish', price: 109, unit: '100 g', origin: 'Gujarat', rating: '4.8', tag: 'FARM FRESH', image: image('photo-1642255521852-7e7c742ac58f'), color: '#728366' },
  { id: 'fenugreek', name: 'Fenugreek Seeds', subtitle: 'A tiny, lovely bitter edge', price: 79, unit: '100 g', origin: 'Rajasthan', rating: '4.6', tag: 'SUN DRIED', image: image('photo-1716816211590-c15a328a5ff0'), color: '#927744' },
  { id: 'mustard', name: 'Black Mustard Seeds', subtitle: 'Little seeds, big sizzle', price: 89, unit: '100 g', origin: 'Karnataka', rating: '4.7', tag: 'SMALL BATCH', image: image('photo-1716816211590-c15a328a5ff0'), color: '#64523d' },
  { id: 'dry-ginger', name: 'Sun-Dried Dry Ginger', subtitle: 'Slow warmth, sunshine sweet', price: 169, unit: '100 g', origin: 'Kerala', rating: '4.8', tag: 'SUN DRIED', image: image('photo-1716816211590-c15a328a5ff0'), color: '#b17c45' },
  { id: 'sambar-powder', name: 'Grandma’s Sambar Powder', subtitle: 'Slow-roasted, stone-ground', price: 199, unit: '100 g', origin: 'Tamil Nadu', rating: '4.9', tag: 'FAMILY RECIPE', image: image('photo-1588252303782-cb80119abd6d'), color: '#a64732' },
  { id: 'rasam-powder', name: 'Peppery Rasam Powder', subtitle: 'A bright little bowl of comfort', price: 189, unit: '100 g', origin: 'Tamil Nadu', rating: '4.8', tag: 'MILL FRESH', image: image('photo-1716816211590-c15a328a5ff0'), color: '#a84931' },
  { id: 'garam-masala', name: 'Sunday Garam Masala', subtitle: 'A little warmth for everything', price: 229, unit: '100 g', origin: 'Maharashtra', rating: '4.9', tag: 'FAMILY RECIPE', image: image('photo-1588252303782-cb80119abd6d'), color: '#986344' },
  { id: 'biryani-masala', name: 'Slow-Roasted Biryani Masala', subtitle: 'Deep, sweet and celebratory', price: 249, unit: '100 g', origin: 'Hyderabad', rating: '5.0', tag: 'SMALL BATCH', image: image('photo-1716816211590-c15a328a5ff0'), color: '#8f603f' },
];
const blendIngredients = [
  { id: 'coriander', name: 'Coriander', note: 'Citrusy & mellow', color: '#ad9854', uses: 'vegetable curries, dals and roasted vegetables' },
  { id: 'cumin', name: 'Cumin', note: 'Earthy & toasty', color: '#86684b', uses: 'rasam, lentils and seasoned rice' },
  { id: 'chilli', name: 'Byadgi chilli', note: 'Warm, not wild', color: '#a84c39', uses: 'stir-fries, marinades and hearty curries' },
  { id: 'turmeric', name: 'Turmeric', note: 'Golden & grounding', color: '#dcaa39', uses: 'sambar, dal and everyday vegetables' },
  { id: 'cardamom', name: 'Cardamom', note: 'Floral & fragrant', color: '#728366', uses: 'biryani, festive rice and sweet dishes' },
  { id: 'pepper', name: 'Black pepper', note: 'A lively little kick', color: '#4b4a3c', uses: 'pepper fry, rasam and warming soups' },
  { id: 'fennel', name: 'Fennel', note: 'Sweet & anise-like', color: '#b6a567', uses: 'kurma, coconut gravies and Chettinad-inspired curries' },
  { id: 'cloves', name: 'Cloves', note: 'Deep, sweet warmth', color: '#755643', uses: 'biryani, slow-cooked gravies and pilaf' },
];
const describeBlend = (weights, controls) => {
  const selected = Object.entries(weights)
    .map(([id, percentage]) => ({
      ...(blendIngredients.find((ingredient) => ingredient.id === id) || {
        id,
        name: id.replaceAll('-', ' '),
        note: 'distinctive warmth',
        uses: 'curries, rice and roasted vegetables',
      }),
      percentage,
    }))
    .sort((left, right) => right.percentage - left.percentage);
  const lead = selected[0];
  const supporting = selected[1];
  const heatDescription = controls.heat < 34 ? 'gentle heat' : controls.heat < 68 ? 'balanced warmth' : 'bold heat';
  const composition = selected.map(({ name, percentage }) => `${name} ${percentage}%`).join(' · ');
  return {
    productName: `${lead.name} Masala Blend`,
    summary: `${lead.name}-forward · ${heatDescription}`,
    description: `${lead.note}${supporting ? `, rounded with ${supporting.note.toLowerCase()}` : ''}. Made for ${lead.uses}.`,
    composition,
  };
};
const steps = ['Order placed', 'Shop accepted', 'Ingredients checked', 'Milling', 'Quality check', 'Order prepared', 'Packed', 'Ready', 'Delivery assigned', 'Out for delivery', 'Delivered'];
const recipes = [
  {
    id: 'chennai-sambar',
    name: 'Chennai-style vegetable sambar',
    tamilName: 'சென்னை காய்கறி சாம்பார்',
    description: 'A comforting, tangy pot with a gentle roasted-spice finish.',
    time: '40 min',
    servings: 'Serves 4',
    image: image('photo-1547592180-85f173990554', 700),
    ingredients: [
      { productId: 'sambar-powder', amount: '2 tbsp' },
      { productId: 'turmeric', amount: '½ tsp' },
      { productId: 'mustard', amount: '½ tsp' },
    ],
    pantry: ['Toor dal', 'Tamarind', 'Mixed vegetables', 'Curry leaves', 'Salt'],
    steps: ['Pressure-cook the dal with turmeric until soft, then whisk until smooth.', 'Simmer vegetables with tamarind water until tender.', 'Stir in sambar powder and dal; simmer gently for 8 minutes.', 'Temper mustard seeds in hot oil, add curry leaves, and pour over the sambar.'],
  },
  {
    id: 'pepper-rasam',
    name: 'Pepper & cumin rasam',
    tamilName: 'மிளகு சீரக ரசம்',
    description: 'A bright, peppery rasam for rice or a warm cup on a rainy evening.',
    time: '25 min',
    servings: 'Serves 3',
    image: image('photo-1547592180-85f173990554', 700),
    ingredients: [
      { productId: 'rasam-powder', amount: '1½ tbsp' },
      { productId: 'pepper', amount: '½ tsp' },
      { productId: 'cumin', amount: '½ tsp' },
      { productId: 'turmeric', amount: '¼ tsp' },
    ],
    pantry: ['Tamarind', 'Tomato', 'Garlic', 'Curry leaves', 'Salt'],
    steps: ['Soak tamarind and extract a light, tangy broth.', 'Crush pepper and cumin roughly; do not grind them too fine.', 'Simmer the broth with tomato, turmeric, rasam powder, and salt.', 'Add crushed spices and curry leaves; switch off once it foams.'],
  },
  {
    id: 'weekend-biryani',
    name: 'Slow-spice weekend biryani',
    tamilName: 'வார இறுதி மசாலா பிரியாணி',
    description: 'A fragrant one-pot biryani with warm whole spices and a little patience.',
    time: '55 min',
    servings: 'Serves 4',
    image: image('photo-1547592180-85f173990554', 700),
    ingredients: [
      { productId: 'biryani-masala', amount: '2 tbsp' },
      { productId: 'cardamom', amount: '3 pods' },
      { productId: 'cinnamon', amount: '1 small piece' },
      { productId: 'cloves', amount: '3 cloves' },
    ],
    pantry: ['Basmati rice', 'Onion', 'Tomato', 'Yogurt', 'Mint', 'Salt'],
    steps: ['Rinse and soak the rice while you prepare the vegetables or protein.', 'Brown sliced onion in a heavy pot; add tomato, yogurt, and biryani masala.', 'Fold in the whole spices and drained rice, then add measured water.', 'Cover and cook on low until the rice is tender; rest for 10 minutes before serving.'],
  },
  {
    id: 'kongunadu-pepper-chicken',
    name: 'Kongunadu-style pepper chicken',
    tamilName: 'கொங்கு மிளகு கோழி',
    description: 'A homestyle chicken fry with toasted pepper, cumin and a slow-building chilli warmth.',
    time: '45 min',
    servings: 'Serves 4',
    image: image('photo-1603894584373-5ac82b2ae398', 700),
    ingredients: [
      { productId: 'pepper', amount: '1½ tsp' },
      { productId: 'cumin', amount: '1 tsp' },
      { productId: 'chilli', amount: '1 tsp' },
      { productId: 'turmeric', amount: '½ tsp' },
    ],
    pantry: ['Chicken', 'Onion', 'Ginger', 'Garlic', 'Curry leaves', 'Oil', 'Salt'],
    steps: ['Marinate chicken with turmeric, salt and a little crushed pepper for 15 minutes.', 'Toast cumin and the remaining pepper briefly, then crush coarsely.', 'Cook onion, ginger and garlic until soft; add chicken and chilli.', 'Cover until tender, then uncover and toss with the crushed spices and curry leaves until fragrant.'],
  },
  {
    id: 'chettinad-mushroom-masala',
    name: 'Chettinad-inspired mushroom masala',
    tamilName: 'செட்டிநாடு காளான் மசாலா',
    description: 'A quick, deeply aromatic mushroom curry with fennel sweetness and a warming masala finish.',
    time: '35 min',
    servings: 'Serves 3',
    image: image('photo-1565557623262-b51c2513a641', 700),
    ingredients: [
      { productId: 'garam-masala', amount: '1½ tsp' },
      { productId: 'fennel', amount: '1 tsp' },
      { productId: 'chilli', amount: '½ tsp' },
      { productId: 'cloves', amount: '2 cloves' },
    ],
    pantry: ['Mushrooms', 'Onion', 'Tomato', 'Ginger', 'Garlic', 'Curry leaves', 'Coconut', 'Salt'],
    steps: ['Toast fennel and cloves until aromatic, then crush them lightly.', 'Cook onion, ginger, garlic and curry leaves until golden; add tomato and chilli.', 'Stir in mushrooms, masala and a splash of water; cover until tender.', 'Finish with the crushed spices and a spoon of coconut, if you like.'],
  },
  {
    id: 'madras-lemon-rice',
    name: 'Madras lemon rice',
    tamilName: 'சென்னை எலுமிச்சை சாதம்',
    description: 'Bright lemon, a mustard-seed sizzle and golden turmeric make an easy lunchbox favorite.',
    time: '20 min',
    servings: 'Serves 3',
    image: image('photo-1512058564366-18510be2db19', 700),
    ingredients: [
      { productId: 'mustard', amount: '1 tsp' },
      { productId: 'turmeric', amount: '½ tsp' },
      { productId: 'chilli', amount: '1 small pinch' },
    ],
    pantry: ['Cooked rice', 'Lemon', 'Peanuts', 'Curry leaves', 'Oil', 'Salt'],
    steps: ['Fluff cooled rice and season it lightly with salt.', 'Heat oil; let mustard seeds crackle, then add peanuts, chilli and curry leaves.', 'Stir in turmeric, switch off the heat and add lemon juice.', 'Fold the tempering through the rice and taste for salt and lemon.'],
  },
  {
    id: 'milagu-jeera-pongal',
    name: 'Milagu-jeera ven pongal',
    tamilName: 'மிளகு சீரக வெண் பொங்கல்',
    description: 'Soft rice and dal finished with crushed pepper, cumin and a little ginger warmth.',
    time: '35 min',
    servings: 'Serves 4',
    image: image('photo-1547592180-85f173990554', 700),
    ingredients: [
      { productId: 'pepper', amount: '1 tsp' },
      { productId: 'cumin', amount: '1 tsp' },
      { productId: 'dry-ginger', amount: '¼ tsp' },
    ],
    pantry: ['Raw rice', 'Moong dal', 'Ghee', 'Cashews', 'Curry leaves', 'Salt'],
    steps: ['Rinse rice and moong dal, then pressure-cook with water until soft and creamy.', 'Crush pepper and cumin coarsely; keep some texture.', 'Warm ghee and toast cashews, crushed spices, dry ginger and curry leaves.', 'Stir the fragrant tempering into the rice and dal; loosen with hot water if needed.'],
  },
  {
    id: 'tangy-tomato-rice',
    name: 'Tangy Tamil tomato rice',
    tamilName: 'தக்காளி மசாலா சாதம்',
    description: 'A one-pot style tomato rice with mellow cumin and a lively, colorful chilli note.',
    time: '30 min',
    servings: 'Serves 3',
    image: image('photo-1574484284002-952d92456975', 700),
    ingredients: [
      { productId: 'cumin', amount: '1 tsp' },
      { productId: 'chilli', amount: '½ tsp' },
      { productId: 'turmeric', amount: '¼ tsp' },
    ],
    pantry: ['Cooked rice', 'Tomatoes', 'Onion', 'Ginger', 'Curry leaves', 'Oil', 'Salt'],
    steps: ['Heat oil and sizzle cumin with curry leaves.', 'Cook onion and ginger until soft, then add chopped tomatoes, chilli, turmeric and salt.', 'Simmer until the tomatoes become a thick, glossy masala.', 'Fold through cooked rice and let it warm gently before serving.'],
  },
];
const LanguageContext = createContext('en');
const tamilCopy = {
  'Home': 'முகப்பு',
  'Shop spices': 'மசாலா வாங்க',
  'Local shops': 'அருகிலுள்ள கடைகள்',
  'Blend maker': 'கலவை உருவாக்கி',
  'Recipes': 'சமையல் குறிப்புகள்',
  'Recipe book': 'சமையல் குறிப்புகள்',
  'My orders': 'என் ஆர்டர்கள்',
  'Subscriptions': 'தொடர்ச்சியான ஆர்டர்கள்',
  'Admin dashboard': 'நிர்வாகப் பலகை',
  'Admin sign in': 'நிர்வாக உள்நுழைவு',
  'Product details': 'பொருள் விவரங்கள்',
  'Track your delivery': 'டெலிவரி நிலை',
  'Your profile': 'உங்கள் சுயவிவரம்',
  'Mill dashboard': 'ஆலைப் பலகை',
  'Search spices, mills...': 'மசாலா, கடைகளைத் தேடுங்கள்...',
  'Notifications': 'அறிவிப்புகள்',
  'My wagon': 'என் கூடை',
  'The spice shelf.': 'மசாலா அலமாரி.',
  'Honest, sun-kissed ingredients from small growers and neighborhood mills.': 'சிறு விவசாயிகள் மற்றும் அருகிலுள்ள ஆலைகளிலிருந்து தரமான பொருட்கள்.',
  'All spices': 'அனைத்து மசாலாக்கள்',
  'Whole spices': 'முழு மசாலாக்கள்',
  'Single origin': 'ஒரே பகுதி விளைபொருள்',
  'Your neighborhood, well-seasoned.': 'உங்கள் பகுதி, மணம் நிறைந்தது.',
  'Only approved shops with configured postal-code coverage appear here.': 'அங்கீகரிக்கப்பட்ட கடைகளும் அவற்றின் அஞ்சல் குறியீடு சேவைப் பகுதிகளும் இங்கே காட்டப்படும்.',
  'Use my location': 'என் இருப்பிடத்தைப் பயன்படுத்து',
  'Find shops by PIN code': 'அஞ்சல் குறியீட்டால் கடைகளைத் தேடுங்கள்',
  'Search a Chennai area': 'சென்னைப் பகுதியைத் தேடுங்கள்',
  'Apply filters': 'வடிகட்டியைப் பயன்படுத்து',
  'No shops match these filters.': 'இந்த வடிகட்டிகளுக்கு கடைகள் இல்லை.',
  'Your wagon.': 'உங்கள் கூடை.',
  'A little something good for your kitchen.': 'உங்கள் சமையலறைக்கான சிறிய மகிழ்ச்சி.',
  'On to checkout': 'பணம் செலுத்தச் செல்லுங்கள்',
  'Your orders.': 'உங்கள் ஆர்டர்கள்.',
  'The good things you’ve brought home, all in one place.': 'நீங்கள் வாங்கிய அனைத்தும் ஒரே இடத்தில்.',
  'Follow along': 'நிலையைக் காண்க',
  'Order again': 'மீண்டும் ஆர்டர்',
  'Explore the spice shelf': 'மசாலா அலமாரியைப் பாருங்கள்',
  'Order updates': 'ஆர்டர் அறிவிப்புகள்',
  'Your spice story, in motion.': 'உங்கள் மசாலா பயணம்.',
  'CURRENT STATUS': 'தற்போதைய நிலை',
  'THE LITTLE JOURNEY': 'ஆர்டர் பயணம்',
  'Every step, fresh.': 'ஒவ்வொரு படியும் புதிது.',
  'ONE LAST LITTLE THING': 'இறுதி விவரம்',
  'Make it yours.': 'உங்கள் விருப்பப்படி.',
  'DELIVERING TO': 'டெலிவரி முகவரி',
  'HOW WOULD YOU LIKE TO PAY?': 'எப்படிப் பணம் செலுத்த விரும்புகிறீர்கள்?',
  'Cash on delivery': 'பொருள் வந்ததும் பணம் செலுத்து',
  'Pay online securely': 'பாதுகாப்பாக ஆன்லைனில் செலுத்து',
  'Place my order': 'ஆர்டர் செய்',
  'Continue to secure payment': 'பாதுகாப்பான பணம் செலுத்தலுக்குச் செல்',
  'Add to my wagon': 'கூடையில் சேர்',
  'An approved shop serves this postal code.': 'இந்த அஞ்சல் குறியீட்டிற்கு அங்கீகரிக்கப்பட்ட கடை சேவை வழங்குகிறது.',
  'Delivery is not available for this postal code yet.': 'இந்த அஞ்சல் குறியீட்டிற்கு தற்போது டெலிவரி இல்லை.',
  'Pay on delivery': 'டெலிவரியின்போது செலுத்தவும்',
  'Payment pending': 'பணம் செலுத்தப்படவில்லை',
  'Paid': 'செலுத்தப்பட்டது',
  'Payment failed': 'பணம் செலுத்துதல் தோல்வியடைந்தது',
  'Order placed': 'ஆர்டர் பெறப்பட்டது',
  'Shop accepted': 'கடை ஏற்றுக்கொண்டது',
  'Ingredients checked': 'பொருட்கள் சரிபார்க்கப்பட்டன',
  'Milling': 'அரைப்பது நடைபெறுகிறது',
  'Quality check': 'தரச் சோதனை',
  'Order prepared': 'ஆர்டர் தயார் செய்யப்பட்டது',
  'Packed': 'பொதி செய்யப்பட்டது',
  'Ready': 'தயார்',
  'Delivery assigned': 'டெலிவரி ஒதுக்கப்பட்டது',
  'Out for delivery': 'டெலிவரிக்கு புறப்பட்டது',
  'Delivered': 'டெலிவரி செய்யப்பட்டது',
  'Rejected': 'நிராகரிக்கப்பட்டது',
  'Cancelled': 'ரத்து செய்யப்பட்டது',
};
const translate = (text, language) => language === 'ta' ? tamilCopy[text] || text : text;
const useLanguage = () => useContext(LanguageContext);
const orderStatusChoices = (status) => {
  if (['Delivered', 'Rejected', 'Cancelled'].includes(status)) return [status];
  const next = steps[steps.indexOf(status) + 1];
  return [status, next, 'Rejected'].filter(Boolean);
};
const shopColors = ['#a64732', '#dd9c32', '#677955', '#80634e'];
const toShopCard = (shop, index) => ({
  ...shop,
  area: shop.address,
  lat: shop.location?.lat,
  lng: shop.location?.lng,
  rating: shop.rating > 0 ? shop.rating.toFixed(1) : 'New',
  status: 'Hours not listed',
  products: `${shop.productCount || 0} products`,
  delivery: 'Confirm with shop',
  color: shopColors[index % shopColors.length],
});
const pincodeFor = (address) => String(address || '').match(/(?:^|\D)([1-9]\d{5})(?=\D|$)/)?.[1] || '';
const readableGeocodedAddress = (result) => {
  const address = result?.address;
  if (!address || typeof address !== 'object') return result?.display_name?.trim() || '';
  const locality = address.neighbourhood || address.suburb || address.city_district || address.village || address.town || address.city || address.county || address.state_district;
  const city = address.city || address.town || address.village || address.state_district || address.county;
  const parts = [
    [address.house_number, address.road || address.residential || address.pedestrian].filter(Boolean).join(' ') || address.building || address.amenity,
    locality,
    city,
    address.state,
    address.postcode,
    address.country,
  ].filter(Boolean);
  const uniqueParts = parts.filter((part, index) => parts.findIndex((candidate) => candidate.toLocaleLowerCase() === part.toLocaleLowerCase()) === index);
  return uniqueParts.join(', ') || result?.display_name?.trim() || '';
};
async function findTamilNaduAddress(address) {
  if (typeof address !== 'string' || address.trim().length < 8) throw new Error('Enter the full street, area, city and postal code first.');
  const searches = [address.trim(), `${address.trim()}, Chennai, Tamil Nadu, India`];
  let result;
  for (const search of searches) {
    const query = new URLSearchParams({
      q: search,
      format: 'jsonv2',
      addressdetails: '1',
      limit: '1',
      countrycodes: 'in',
      'accept-language': 'en-IN,ta',
    });
    const response = await fetch(`https://nominatim.openstreetmap.org/search?${query}`, { headers: { Accept: 'application/json' } });
    const results = await response.json();
    if (!response.ok) throw new Error(results.error || 'OpenStreetMap address search is unavailable.');
    result = results[0];
    if (result) break;
  }
  if (!result) throw new Error('No matching Tamil Nadu address was found. Check the street, area and postal code.');
  const state = String(result.address?.state || result.display_name || '').toLocaleLowerCase();
  if (!state.includes('tamil nadu')) throw new Error('That address did not resolve to Tamil Nadu. Check the city and state in the address.');
  const lat = Number(result.lat);
  const lng = Number(result.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) throw new Error('The address result did not include a usable map location.');
  return { location: { lat, lng }, address: readableGeocodedAddress(result) || address.trim() };
}
function getShopReadiness(address, pincodes, location) {
  const pins = String(pincodes || '').split(/[,\s]+/).filter(Boolean);
  return {
    address: typeof address === 'string' && address.trim().length >= 8,
    servicePincodes: pins.length > 0 && pins.every((pin) => /^\d{6}$/.test(pin)),
    mapPin: Number.isFinite(location?.lat) && location.lat >= -90 && location.lat <= 90
      && Number.isFinite(location?.lng) && location.lng >= -180 && location.lng <= 180,
  };
}
function ShopAddressLookupControl({ address, location, onLocation, onAddress, notify }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const lookup = async () => {
    setBusy(true);
    setError('');
    try {
      const result = await findTamilNaduAddress(address);
      onAddress(result.address);
      onLocation(result.location);
      notify('Tamil Nadu shop address found. Please check it before saving.');
    } catch (lookupError) {
      setError(lookupError.message);
    } finally {
      setBusy(false);
    }
  };
  return <div className="shop-address-lookup">
    <button type="button" className="button-outline" disabled={busy || !address.trim()} onClick={lookup}>{busy ? 'Finding address…' : location ? 'Refresh map pin from address' : 'Find this address on the map'}</button>
    <small>Uses your Chennai/Tamil Nadu street address to place the map pin. Address is sent to OpenStreetMap only when clicked. No coordinate entry needed.</small>
    {location && !error && <small className="shop-address-found">Map pin ready from the entered street address.</small>}
    {error && <small className="shop-address-error" role="alert">{error}</small>}
  </div>;
}
const navGroups = [
  { label: 'DISCOVER', items: [{ id: 'home', label: 'Home' }, { id: 'spices', label: 'Shop spices' }, { id: 'recipes', label: 'Recipes' }, { id: 'shops', label: 'Local shops' }] },
  { label: 'MAKE IT YOURS', items: [{ id: 'blend', label: 'Blend maker', badge: 'NEW' }] },
  { label: 'YOUR WAGON', items: [{ id: 'orders', label: 'My orders' }, { id: 'subscriptions', label: 'Subscriptions' }] },
];
const formatPrice = (price) => `₹${price.toLocaleString('en-IN')}`;
function mapOrderRecord(record) {
  return {
    id: record._id,
    total: record.total,
    status: record.status,
    shopName: record.shopId?.name || '',
    courierName: record.courierName || '',
    courierPhone: record.courierPhone || '',
    courierIsDemo: record.courierIsDemo === true,
    statusHistory: record.statusHistory || [],
    deliveryLocation: record.deliveryLocation || null,
    paymentStatus: record.paymentStatus === 'paid' ? 'Paid' : record.paymentStatus === 'pay_on_delivery' ? 'Pay on delivery' : record.paymentStatus === 'failed' ? 'Payment failed' : 'Payment pending',
    createdAt: record.createdAt,
    deliveryAddress: record.deliveryAddress,
    items: record.items.map((item) => {
      const product = products.find((entry) => entry.id === item.productId) || {
        id: item.productId,
        name: item.name,
        unit: item.customization?.quantity ? `${item.customization.quantity} g` : '100 g',
        image: image('photo-1716816211590-c15a328a5ff0'),
        price: item.unitPrice,
        origin: 'Your kitchen',
      };
      return { product, quantity: item.quantity };
    }),
  };
}
async function apiRequest(path, token, options = {}) {
  const headers = new Headers(options.headers || {});
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (options.body && !(options.body instanceof FormData)) headers.set('Content-Type', 'application/json');
  const response = await fetch(path, { ...options, headers });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'The request could not be completed.');
  return data;
}
const allocateRatio = (entries, total) => {
  if (!entries.length) return {};
  const sourceTotal = entries.reduce((sum, [, value]) => sum + value, 0);
  const denominator = sourceTotal || entries.length;
  const shares = entries.map(([key, value], index) => {
    const exact = (sourceTotal ? value : 1) * total / denominator;
    return { key, value: Math.floor(exact), remainder: exact - Math.floor(exact), index };
  });
  const remaining = total - shares.reduce((sum, entry) => sum + entry.value, 0);
  shares.sort((left, right) => right.remainder - left.remainder || left.index - right.index);
  for (let index = 0; index < remaining; index += 1) shares[index % shares.length].value += 1;
  return Object.fromEntries(shares.map(({ key, value }) => [key, value]));
};

function App() {
  const [page, setPage] = useState('home');
  const [language, setLanguage] = useState(() => localStorage.getItem('spicewagon-language') || 'en');
  const [cart, setCart] = useState([]);
  const [toast, setToast] = useState('');
  const [search, setSearch] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [inventoryByProduct, setInventoryByProduct] = useState({});
  const [inventoryError, setInventoryError] = useState('');
  const [shopPincodeSearch, setShopPincodeSearch] = useState('');
  const [mobileMenu, setMobileMenu] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(products[0]);
  const [selectedShop, setSelectedShop] = useState(0);
  const [mapFocus, setMapFocus] = useState([13.0827, 80.2707]);
  const [marketplaceShops, setMarketplaceShops] = useState([]);
  const [shopsError, setShopsError] = useState('');
  const [shopsLoading, setShopsLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [category, setCategory] = useState('All spices');
  const [blendName, setBlendName] = useState('My Sunday Curry');
  const [blendWeights, setBlendWeights] = useState({ coriander: 40, cumin: 30, chilli: 20, turmeric: 10 });
  const [blendControls, setBlendControls] = useState({ spice: 55, heat: 35, salt: 15, quantity: 100 });
  const [subscriptions, setSubscriptions] = useState([
    { id: 1, name: 'Lakadong Turmeric', detail: '100 g · Every month', date: 'Oct 18, 2026', image: products[0].image, status: 'Active' },
    { id: 2, name: 'Sunday Curry Blend', detail: '200 g · Every 2 weeks', date: 'Oct 12, 2026', image: products[3].image, status: 'Active' },
  ]);
  const [savedBlends, setSavedBlends] = useState([]);
  const [subscriptionEditor, setSubscriptionEditor] = useState(null);
  const [openHistory, setOpenHistory] = useState(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [orders, setOrders] = useState([]);
  const [activeOrder, setActiveOrder] = useState(null);
  const [activeStep, setActiveStep] = useState(6);
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('spicewagon-user')) || null; } catch { return null; }
  });
  const [deliveryAddress, setDeliveryAddress] = useState(() => user?.address || '');
  const [deliveryLocation, setDeliveryLocation] = useState(() => user?.deliveryLocation || null);
  const [notificationSeenAt, setNotificationSeenAt] = useState(() => Number(localStorage.getItem(`spicewagon-notifications-seen-${user?.id || 'guest'}`)) || Date.now());
  const orderUpdates = useMemo(() => orders.flatMap((order) => (order.statusHistory || []).map((entry) => ({
    ...entry,
    orderId: order.id,
    orderStatus: order.status,
    atMs: new Date(entry.at || 0).getTime(),
  }))).filter((entry) => Number.isFinite(entry.atMs)).sort((left, right) => right.atMs - left.atMs).slice(0, 12), [orders]);
  const unreadUpdateCount = orderUpdates.filter((entry) => entry.atMs > notificationSeenAt).length;

  useEffect(() => {
    if (!toast) return undefined;
    const timeout = window.setTimeout(() => setToast(''), 2800);
    return () => window.clearTimeout(timeout);
  }, [toast]);
  useEffect(() => {
    if (user?.address) setDeliveryAddress(user.address);
  }, [user?.address]);
  useEffect(() => {
    if (user?.deliveryLocation) setDeliveryLocation(user.deliveryLocation);
  }, [user?.deliveryLocation]);
  useEffect(() => {
    localStorage.setItem('spicewagon-language', language);
    document.documentElement.lang = language === 'ta' ? 'ta' : 'en';
  }, [language]);
  useEffect(() => {
    const seenAt = Number(localStorage.getItem(`spicewagon-notifications-seen-${user?.id || 'guest'}`)) || Date.now();
    setNotificationSeenAt(seenAt);
  }, [user?.id]);
  useEffect(() => {
    const controller = new AbortController();
    const loadShops = async () => {
      setShopsLoading(true);
      setShopsError('');
      try {
        const response = await fetch('/api/shops', { signal: controller.signal });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Available shops could not be loaded.');
        setMarketplaceShops(data.shops.map(toShopCard));
      } catch (error) {
        if (error.name !== 'AbortError') setShopsError(error.message);
      } finally {
        if (!controller.signal.aborted) setShopsLoading(false);
      }
    };
    loadShops();
    return () => controller.abort();
  }, [page]);
  useEffect(() => {
    if (!['home', 'spices', 'product', 'cart', 'recipes'].includes(page)) return undefined;
    const controller = new AbortController();
    apiRequest('/api/products?limit=50', null, { signal: controller.signal })
      .then(({ items }) => {
        setInventoryByProduct(Object.fromEntries(items.map((item) => [item.slug, item.inventory])));
        setInventoryError('');
      })
      .catch((error) => {
        if (error.name !== 'AbortError') setInventoryError(error.message);
      });
    return () => controller.abort();
  }, [page]);
  useEffect(() => {
    if (!user?.token) return;
    const controller = new AbortController();
    const loadAccountData = async () => {
      try {
        const [orderResponse, subscriptionResponse, blendResponse] = await Promise.all([
          fetch('/api/orders', { headers: { Authorization: `Bearer ${user.token}` }, signal: controller.signal }),
          fetch('/api/subscriptions', { headers: { Authorization: `Bearer ${user.token}` }, signal: controller.signal }),
          fetch('/api/blends', { headers: { Authorization: `Bearer ${user.token}` }, signal: controller.signal }),
        ]);
        const [orderData, subscriptionData, blendData] = await Promise.all([orderResponse.json(), subscriptionResponse.json(), blendResponse.json()]);
        if (!orderResponse.ok) throw new Error(orderData.message || 'Your order history could not be loaded.');
        if (!subscriptionResponse.ok) throw new Error(subscriptionData.message || 'Your subscriptions could not be loaded.');
        if (!blendResponse.ok) throw new Error(blendData.message || 'Your saved recipes could not be loaded.');
        const savedOrders = orderData.orders.map(mapOrderRecord);
        const savedSubscriptions = subscriptionData.subscriptions.map((record) => {
          const product = products.find((entry) => entry.id === record.productId);
          const frequency = record.interval === 'weekly' ? 'Every week' : record.interval === 'monthly' ? 'Every month' : `Every ${record.intervalDays} days`;
          return {
            id: record._id,
            _id: record._id,
            productId: record.productId,
            quantity: record.quantity,
            interval: record.interval,
            intervalDays: record.intervalDays,
            name: record.productName,
            detail: `${record.quantity} × ${product?.unit || '100 g'} · ${frequency}`,
            date: new Date(record.nextDeliveryAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
            image: product?.image || image('photo-1716816211590-c15a328a5ff0'),
            status: record.status === 'active' ? 'Active' : record.status === 'paused' ? 'Paused' : 'Cancelled',
            history: record.history || [],
          };
        });
        setOrders(savedOrders);
        setSubscriptions(savedSubscriptions);
        setSavedBlends(blendData.blends);
        if (activeOrder) {
          const refreshedOrder = savedOrders.find((record) => record.id === activeOrder.id);
          if (refreshedOrder) setActiveOrder(refreshedOrder);
        } else if (savedOrders[0]) setActiveOrder(savedOrders[0]);
      } catch (error) {
        if (error.name !== 'AbortError') setToast(error.message);
      }
    };
    loadAccountData();
    return () => controller.abort();
  }, [user?.token]);
  useEffect(() => {
    if (!user?.token) return undefined;
    const refreshCustomerOrders = async () => {
      try {
        const data = await apiRequest('/api/orders', user.token);
        const refreshedOrders = data.orders.map(mapOrderRecord);
        setOrders(refreshedOrders);
        const refreshedActiveOrder = refreshedOrders.find((order) => order.id === activeOrder?.id);
        if (refreshedActiveOrder) {
          setActiveOrder(refreshedActiveOrder);
          const currentStep = steps.indexOf(refreshedActiveOrder.status);
          if (currentStep >= 0) setActiveStep(currentStep);
        }
      } catch (error) { setToast(error.message); }
    };
    const timeout = window.setInterval(refreshCustomerOrders, 30000);
    return () => window.clearInterval(timeout);
  }, [user?.token, activeOrder?.id]);

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    return products.filter((product) => {
      const matchesSearch = !term || `${product.name} ${product.origin} ${product.subtitle}`.toLowerCase().includes(term);
      const isBlend = /powder|masala/i.test(product.name);
      const matchesCategory = category === 'All spices' || (category === 'Whole spices' && !isBlend) || (category === 'Single origin' && !isBlend);
      return matchesSearch && matchesCategory;
    });
  }, [search, category]);
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const subtotal = cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
  const blendPrice = Math.round(blendControls.quantity * (1.65 + blendControls.heat / 100));

  const notify = (message) => setToast(message);
  const availableInventory = (productId) => inventoryByProduct[productId];
  const addToCart = (product, quantity = 1) => {
    const available = availableInventory(product.id);
    const currentQuantity = cart.find((item) => item.product.id === product.id)?.quantity || 0;
    if (Number.isFinite(available) && currentQuantity + quantity > available) {
      notify(available === 0 ? `${product.name} is currently out of stock.` : `Only ${available - currentQuantity} ${product.unit} pack(s) are currently available.`);
      return;
    }
    setCart((items) => {
      const found = items.find((item) => item.product.id === product.id);
      return found
        ? items.map((item) => item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item)
        : [...items, { product, quantity }];
    });
    notify(`${product.name} added to your wagon`);
  };
  const changeQuantity = (id, delta) => {
    const current = cart.find((item) => item.product.id === id);
    if (delta > 0 && current && Number.isFinite(availableInventory(id)) && current.quantity + delta > availableInventory(id)) {
      notify(`Only ${availableInventory(id)} ${current.product.unit} pack(s) are currently available.`);
      return;
    }
    setCart((items) => items.map((item) => item.product.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item).filter((item) => item.quantity > 0));
  };
  const navigate = (target) => {
    setPage(target);
    setMobileMenu(false);
    setNotificationsOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const markNotificationsSeen = () => {
    const seenAt = Date.now();
    setNotificationSeenAt(seenAt);
    localStorage.setItem(`spicewagon-notifications-seen-${user?.id || 'guest'}`, String(seenAt));
  };
  const openOrderUpdate = (update) => {
    const order = orders.find((item) => item.id === update.orderId);
    if (!order) return;
    setActiveOrder(order);
    setActiveStep(Math.max(0, steps.indexOf(order.status)));
    markNotificationsSeen();
    navigate('tracking');
  };
  const signInAdmin = async (email, password) => {
    const account = await apiRequest('/api/auth/login', null, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (account.role !== 'admin') throw new Error('This account does not have administrator access.');
    setUser(account);
    localStorage.setItem('spicewagon-user', JSON.stringify(account));
    navigate('admin-dashboard');
  };
  const signOut = () => {
    localStorage.removeItem('spicewagon-user');
    setUser(null);
    setOrders([]);
    setActiveOrder(null);
    setSavedBlends([]);
    setSubscriptions([]);
    setDeliveryAddress('');
    setDeliveryLocation(null);
    notify('You have signed out.');
    navigate('home');
  };
  const captureDeliveryLocation = () => {
    if (!navigator.geolocation) {
      notify('GPS location is not available in this browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      const location = { latitude: coords.latitude, longitude: coords.longitude, accuracy: Math.round(coords.accuracy) };
      setDeliveryLocation(location);
      setUserLocation([location.latitude, location.longitude]);
      setMapFocus([location.latitude, location.longitude]);
      if (user?.token) {
        try {
          const account = await apiRequest('/api/auth/me', user.token, {
            method: 'PATCH',
            body: JSON.stringify({ deliveryLocation: location }),
          });
          const updatedUser = { ...user, ...account, token: user.token };
          setUser(updatedUser);
          localStorage.setItem('spicewagon-user', JSON.stringify(updatedUser));
        } catch (error) {
          notify(`GPS captured on this device but could not be saved to your account: ${error.message}`);
          return;
        }
      }
      notify('GPS location captured. Enter your street address separately for the courier.');
    }, (error) => {
      const messages = {
        1: 'Location permission was denied. Allow location access in your browser settings.',
        2: 'Your current location could not be determined. Try again outdoors or near a window.',
        3: 'GPS took too long to respond. Please try again.',
      };
      notify(messages[error.code] || 'GPS location could not be read.');
    }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 });
  };
  const lookupDeliveryAddress = async () => {
    if (!deliveryLocation) {
      notify('Capture a GPS pin before looking up an address.');
      return '';
    }
    try {
      const query = new URLSearchParams({
        format: 'jsonv2',
        addressdetails: '1',
        zoom: '18',
        'accept-language': 'en-IN,ta',
        lat: String(deliveryLocation.latitude),
        lon: String(deliveryLocation.longitude),
      });
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${query}`, { headers: { Accept: 'application/json' } });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'OpenStreetMap address lookup is unavailable.');
      const address = readableGeocodedAddress(data);
      if (!address) throw new Error('No street address was found for this GPS pin.');
      notify('Address found. Please review and edit it before saving or ordering.');
      return address;
    } catch (error) {
      notify(`Address lookup failed: ${error.message}`);
      return '';
    }
  };
  const selectShop = (index) => {
    setSelectedShop(index);
    const shop = marketplaceShops[index];
    if (Number.isFinite(shop?.lat) && Number.isFinite(shop?.lng)) setMapFocus([shop.lat, shop.lng]);
  };
  const locateShops = () => {
    captureDeliveryLocation();
  };
  const updateWeight = (ingredient, nextValue) => {
    const adjusted = Math.max(0, Math.min(100, Number(nextValue)));
    const otherEntries = Object.entries(blendWeights).filter(([key]) => key !== ingredient);
    const remainder = 100 - adjusted;
    setBlendWeights({ ...allocateRatio(otherEntries, remainder), [ingredient]: adjusted });
  };
  const addBlendIngredient = (ingredient) => {
    if (Object.hasOwn(blendWeights, ingredient)) return;
    setBlendWeights({ ...allocateRatio(Object.entries(blendWeights), 80), [ingredient]: 20 });
  };
  const removeBlendIngredient = (ingredient) => {
    const remaining = Object.entries(blendWeights).filter(([key]) => key !== ingredient);
    if (remaining.length < 2) {
      notify('A custom masala needs at least two ingredients.');
      return;
    }
    setBlendWeights(allocateRatio(remaining, 100));
  };
  const saveBlend = async () => {
    if (!user?.token) {
      notify('Sign in from your profile to save a blend');
      navigate('profile');
      return;
    }
    try {
      const data = await apiRequest('/api/blends', user.token, {
        method: 'POST',
        body: JSON.stringify({ name: blendName.trim() || 'My Signature Blend', ingredients: blendWeights, spiceLevel: blendControls.spice, heatLevel: blendControls.heat, saltLevel: blendControls.salt, quantity: blendControls.quantity }),
      });
      setSavedBlends((items) => [data.blend, ...items]);
      notify('Your signature blend has been saved');
    } catch (error) {
      notify(error.message);
    }
  };
  const loadBlend = (blend) => {
    setBlendName(blend.name);
    setBlendWeights(blend.ingredients);
    setBlendControls({ spice: blend.spiceLevel, heat: blend.heatLevel, salt: blend.saltLevel, quantity: blend.quantity });
    notify(`${blend.name} is ready to make`);
  };
  const deleteBlend = async (blendId) => {
    try {
      await apiRequest(`/api/blends/${blendId}`, user.token, { method: 'DELETE' });
      setSavedBlends((items) => items.filter((blend) => blend._id !== blendId));
      notify('Saved blend removed');
      return true;
    } catch (error) {
      notify(error.message);
      return false;
    }
  };
  const addRecipeIngredients = (recipe) => {
    const recipeProducts = recipe.ingredients.map(({ productId }) => products.find((product) => product.id === productId));
    if (recipeProducts.some((product) => !product)) {
      notify('A spice in this recipe is not currently in the catalog.');
      return;
    }
    const requested = new Map();
    recipeProducts.forEach((product) => requested.set(product.id, (requested.get(product.id) || 0) + 1));
    const unavailable = [...requested].find(([productId, quantity]) => {
      const stock = inventoryByProduct[productId];
      const alreadyInCart = cart.find((item) => item.product.id === productId)?.quantity || 0;
      return Number.isFinite(stock) && alreadyInCart + quantity > stock;
    });
    if (unavailable) {
      const product = products.find((item) => item.id === unavailable[0]);
      notify(`${product?.name || 'A recipe spice'} does not have enough stock for this recipe.`);
      return;
    }
    setCart((items) => {
      let nextItems = [...items];
      recipeProducts.forEach((product) => {
        const existing = nextItems.find((item) => item.product.id === product.id);
        nextItems = existing
          ? nextItems.map((item) => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
          : [...nextItems, { product, quantity: 1 }];
      });
      return nextItems;
    });
    notify(`Spice packs for ${recipe.name} added to your wagon.`);
    navigate('cart');
  };
  const addBlendToCart = () => {
    const profile = describeBlend(blendWeights, blendControls);
    const productName = blendName.trim() || profile.productName;
    const blend = {
      id: `custom-${Date.now()}`,
      name: productName,
      subtitle: `${profile.summary}. ${profile.description} Ingredients: ${profile.composition}.`,
      price: blendPrice,
      unit: `${blendControls.quantity} g`,
      origin: 'Your kitchen',
      rating: 'New',
      tag: 'YOUR RECIPE',
      image: image('photo-1716816211590-c15a328a5ff0'),
      color: '#a64732',
      customization: {
        blendName: productName,
        weights: { ...blendWeights },
        spice: blendControls.spice,
        heat: blendControls.heat,
        salt: blendControls.salt,
        quantity: blendControls.quantity,
      },
    };
    addToCart(blend);
    navigate('cart');
  };
  const submitOrder = async () => {
    if (checkoutBusy) return;
    if (!cart.length) return notify('Add something delicious before checking out');
    if (deliveryAddress.trim().length < 10) return notify('Enter a complete delivery address (at least 10 characters).');
    if (!user?.token) {
      notify('Sign in from your profile before placing an order');
      setCheckoutOpen(false);
      navigate('profile');
      return;
    }
    setCheckoutBusy(true);
    let order;
    let gatewayOrderId = null;
    let checkoutReturned = false;
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify({ items: cart.map(({ product, quantity }) => ({ productId: product.id.startsWith('custom-') ? 'custom-blend' : product.id, name: product.name, quantity, customization: product.id.startsWith('custom-') ? product.customization : undefined })), paymentMethod, deliveryAddress: deliveryAddress.trim(), ...(deliveryLocation ? { deliveryLocation } : {}) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Your order could not be placed.');
      order = { id: data.order._id, items: [...cart], total: data.order.total, status: data.order.status, statusHistory: data.order.statusHistory || [], shopName: '', courierName: '', courierPhone: '', courierIsDemo: false, deliveryLocation: data.order.deliveryLocation || deliveryLocation, paymentStatus: paymentMethod === 'cod' ? 'Pay on delivery' : 'Payment pending', createdAt: data.order.createdAt, deliveryAddress: data.order.deliveryAddress };
      if (paymentMethod === 'razorpay') {
        const payment = data.payment;
        if (!payment?.keyId) throw new Error('The payment gateway could not be initialized.');
        gatewayOrderId = payment.orderId;
        if (!window.Razorpay) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = resolve;
            script.onerror = () => reject(new Error('Razorpay checkout could not be loaded. Check your connection and try again.'));
            document.body.appendChild(script);
          });
        }
        const paymentResult = await new Promise((resolve, reject) => {
          const checkout = new window.Razorpay({
            key: payment.keyId,
            amount: payment.amount,
            currency: payment.currency,
            name: 'Spice Wagon',
            description: 'Freshly milled, just for you',
            order_id: payment.orderId,
            prefill: { name: user.name, email: user.email },
            method: { upi: true, card: true, netbanking: true },
            theme: { color: '#a64732' },
            handler: resolve,
            modal: { ondismiss: () => reject(new Error('Payment was cancelled. Your order has not been confirmed.')) },
          });
          checkout.on('payment.failed', (failure) => reject(new Error(failure.error?.description || 'Razorpay reported that the payment failed. No order was confirmed.')));
          checkout.open();
        });
        checkoutReturned = true;
        const verification = await fetch('/api/payments/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
          body: JSON.stringify({ orderId: order.id, razorpayOrderId: paymentResult.razorpay_order_id, razorpayPaymentId: paymentResult.razorpay_payment_id, razorpaySignature: paymentResult.razorpay_signature }),
        });
        const verified = await verification.json();
        if (!verification.ok || !verified.verified) throw new Error(verified.message || 'Payment verification failed; your order remains unpaid.');
        order.paymentStatus = 'Paid';
      }
    } catch (error) {
      if (gatewayOrderId && !checkoutReturned && order?.id) {
        try {
          const cancellation = await fetch(`/api/orders/${order.id}/payment-failure`, { method: 'POST', headers: { Authorization: `Bearer ${user.token}` } });
          const cancellationData = await cancellation.json();
          if (!cancellation.ok) throw new Error(cancellationData.message || 'The pending payment could not be cancelled.');
          const failedOrder = mapOrderRecord(cancellationData.order);
          setOrders((items) => [failedOrder, ...items.filter((item) => item.id !== failedOrder.id)]);
        } catch (cancellationError) {
          notify(`${error.message} ${cancellationError.message}`);
          setCheckoutBusy(false);
          return;
        }
      }
      if (checkoutReturned && order?.id) {
        setOrders((items) => [order, ...items.filter((item) => item.id !== order.id)]);
        setActiveOrder(order);
        setCheckoutOpen(false);
        navigate('orders');
        notify(`${error.message} Your order remains pending; check its status before trying payment again.`);
      } else {
        notify(error.message);
      }
      setCheckoutBusy(false);
      return;
    }
    setOrders((items) => [order, ...items]);
    setActiveOrder(order);
    setInventoryByProduct((previous) => {
      const next = { ...previous };
      cart.forEach(({ product, quantity }) => {
        if (Number.isFinite(next[product.id])) next[product.id] = Math.max(0, next[product.id] - quantity);
      });
      return next;
    });
    setCart([]);
    setCheckoutOpen(false);
    setActiveStep(Math.max(0, steps.indexOf(order.status)));
    navigate('tracking');
    notify(paymentMethod === 'cod' ? 'Order placed! Your neighborhood mill is on it.' : 'Payment verified! Your neighborhood mill is on it.');
    setCheckoutBusy(false);
  };
  const toggleSubscription = async (id, action) => {
    const subscription = subscriptions.find((item) => item.id === id);
    if (!subscription) return;
    if (!user?.token) {
      notify('Sign in from your profile to manage subscriptions');
      navigate('profile');
      return;
    }
    if (action === 'Change') {
      setSubscriptionEditor(subscription);
      return;
    }
    const actionMap = { Pause: 'pause', Resume: 'resume', Skip: 'skip', Cancel: 'cancel' };
    if (subscription._id && user?.token) {
      try {
        const response = await fetch(`/api/subscriptions/${subscription._id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
          body: JSON.stringify({ action: actionMap[action] }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Subscription could not be updated.');
      } catch (error) {
        notify(error.message);
        return;
      }
    }
    setSubscriptions((items) => items.map((item) => {
      if (item.id !== id) return item;
      const status = action === 'Cancel' ? 'Cancelled' : action === 'Pause' && item.status === 'Active' ? 'Paused' : action === 'Resume' ? 'Active' : item.status;
      const nextDate = action === 'Skip' ? new Date(new Date(item.date).getTime() + 7 * 86400000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : item.date;
      return { ...item, status, date: nextDate, history: [{ action, date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) }, ...(item.history || [])] };
    }));
    notify(action === 'Skip' ? 'Next delivery skipped — see you soon' : `Subscription ${action.toLowerCase()}d`);
  };
  const saveSubscription = async ({ productId, quantity, interval, intervalDays }) => {
    if (!user?.token) {
      setSubscriptionEditor(null);
      notify('Sign in from your profile to save a subscription');
      navigate('profile');
      return;
    }
    const product = products.find((item) => item.id === productId);
    const isEditing = Boolean(subscriptionEditor?._id);
    const endpoint = isEditing ? `/api/subscriptions/${subscriptionEditor._id}` : '/api/subscriptions';
    try {
      const response = await fetch(endpoint, {
        method: isEditing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify({ productId, quantity, interval, intervalDays, ...(productId === 'custom-blend' ? { customization: { blendName, weights: blendWeights, ...blendControls } } : {}) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Your subscription could not be saved.');
      const record = data.subscription;
      const frequency = record.interval === 'weekly' ? 'Every week' : record.interval === 'monthly' ? 'Every month' : `Every ${record.intervalDays} days`;
      const saved = {
        id: record._id,
        _id: record._id,
        productId: record.productId,
        name: record.productName,
        detail: `${record.quantity} × ${product?.unit || '100 g'} · ${frequency}`,
        date: new Date(record.nextDeliveryAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        image: product?.image || image('photo-1716816211590-c15a328a5ff0'),
        status: record.status === 'active' ? 'Active' : record.status === 'paused' ? 'Paused' : 'Cancelled',
        history: record.history || [],
      };
      setSubscriptions((items) => isEditing ? items.map((item) => item.id === subscriptionEditor.id ? saved : item) : [saved, ...items]);
      setSubscriptionEditor(null);
      notify(isEditing ? 'Your subscription has been updated' : 'Your new spice ritual is all set');
    } catch (error) {
      notify(error.message);
    }
  };

  return (
    <LanguageContext.Provider value={language}>
    <div className="app-shell">
      <aside className={`sidebar ${mobileMenu ? 'sidebar-open' : ''}`}>
        <button className="brand" onClick={() => navigate('home')} aria-label="Spice Wagon home">
          <span className="brand-mark"><span /><span /><span /></span>
          <span className="brand-name">spice wagon<span className="brand-period">.</span><small>GOOD THINGS, GROUND FRESH</small></span>
        </button>
        <button className="delivery-location" onClick={() => navigate('profile')}><MapPin size={15} /><span>Delivering to<strong>{deliveryAddress || 'Add your delivery address'}</strong></span><ChevronDown size={13} /></button>
        <nav className="main-nav">
          {[...navGroups, ...(user?.role === 'shop_owner' ? [{ label: 'YOUR SHOP', items: [{ id: 'shop-dashboard', label: 'Mill dashboard' }] }] : []), { label: 'MARKETPLACE', items: [{ id: user?.role === 'admin' ? 'admin-dashboard' : 'admin-login', label: user?.role === 'admin' ? 'Admin dashboard' : 'Admin sign in' }] }].map((group) => (
            <div className="nav-group" key={group.label}>
              <span className="nav-heading">{group.label}</span>
              {group.items.map((item) => (
                <button key={item.id} className={`nav-item ${page === item.id ? 'active' : ''}`} onClick={() => navigate(item.id)}>
                  <NavIcon id={item.id} /><span>{translate(item.label, language)}</span>{item.badge && <span className="new-badge">{item.badge}</span>}
                  {item.id === 'orders' && orders.length > 0 && <span className="nav-count">{orders.length}</span>}
                </button>
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-promo">
          <div className="promo-top"><Sparkles size={14} /> FROM OUR PEOPLE</div>
          <p>Small batches.<br /><em>Big-hearted flavor.</em></p>
          <button onClick={() => navigate('shops')}>Meet your makers <ArrowUpRight size={14} /></button>
          <div className="promo-stamp">SINCE<br /><strong>2024</strong></div>
        </div>
        <div className="sidebar-bottom">
          <button className="nav-item" onClick={() => navigate('profile')}><UserRound size={17} /><span>{user?.name || 'Your account'}</span><ChevronRight size={15} className="nav-tail" /></button>
          {user && <button className="nav-item sign-out-link" onClick={signOut}><span /><span>Sign out</span></button>}
          <span className="copyright">© 2026 Spice Wagon Co.</span>
        </div>
      </aside>
      {mobileMenu && <button className="mobile-scrim" onClick={() => setMobileMenu(false)} aria-label="Close navigation" />}

      <main className="main-content">
        <header className="topbar">
          <button className="mobile-menu-button icon-button" onClick={() => setMobileMenu(true)} aria-label="Open menu"><Menu size={21} /></button>
          <div className="breadcrumb"><span>Spice Wagon</span><ChevronRight size={14} />{translate(pageLabel(page), language)}</div>
          <div className="top-actions">
            <label className="search-box"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') navigate('spices'); }} placeholder={translate('Search spices, mills...', language)} /><kbd>⌘ K</kbd></label>
            <div className="notification-wrap">
              <button className="icon-button notification-button" onClick={() => { setNotificationsOpen((open) => !open); if (!notificationsOpen) markNotificationsSeen(); }} aria-label={translate('Notifications', language)} aria-expanded={notificationsOpen}><Bell size={18} />{unreadUpdateCount > 0 && <i />}{unreadUpdateCount > 0 && <span className="notification-count">{unreadUpdateCount}</span>}</button>
              {notificationsOpen && <div className="notification-popover"><div className="notification-popover-heading"><strong>{translate('Order updates', language)}</strong><button onClick={() => setNotificationsOpen(false)} aria-label="Close notifications"><X size={16} /></button></div>{orderUpdates.length ? orderUpdates.map((update, index) => <button className="notification-item" key={`${update.orderId}-${update.status}-${update.at}-${index}`} onClick={() => openOrderUpdate(update)}><strong>{translate(update.status, language)} · #{String(update.orderId).slice(-6)}</strong><span>{update.note || 'Status updated'}</span><time>{update.atMs ? new Date(update.atMs).toLocaleString(language === 'ta' ? 'ta-IN' : 'en-IN') : ''}</time></button>) : <p className="notification-empty">No order updates yet.</p>}</div>}
            </div>
            <button className="language-toggle" onClick={() => setLanguage((current) => current === 'en' ? 'ta' : 'en')} aria-label={language === 'en' ? 'தமிழுக்கு மாற்று' : 'Switch to English'}>{language === 'en' ? 'தமிழ்' : 'English'}</button>
            <button className="cart-button" onClick={() => navigate('cart')}><ShoppingBag size={17} /><span>{translate('My wagon', language)}</span><b>{cartCount}</b></button>
          </div>
        </header>
        <div className={`page-container page-${page}`}>
          {page === 'home' && <HomePage onNavigate={navigate} onAdd={addToCart} products={products} inventoryByProduct={inventoryByProduct} inventoryError={inventoryError} shops={marketplaceShops} shopsLoading={shopsLoading} shopsError={shopsError} deliveryPincode={pincodeFor(deliveryAddress)} onProduct={(product) => { setSelectedProduct(product); navigate('product'); }} />}
          {page === 'spices' && <SpicesPage products={filteredProducts} category={category} setCategory={setCategory} onAdd={addToCart} inventoryByProduct={inventoryByProduct} inventoryError={inventoryError} onProduct={(product) => { setSelectedProduct(product); navigate('product'); }} />}
          {page === 'recipes' && <RecipesPage recipes={recipes} inventoryByProduct={inventoryByProduct} onAddIngredients={addRecipeIngredients} />}
          {page === 'product' && <ProductPage product={selectedProduct} stock={availableInventory(selectedProduct.id)} onBack={() => navigate('spices')} onAdd={addToCart} onSubscribe={() => navigate('subscriptions')} />}
          {page === 'blend' && <BlendPage name={blendName} setName={setBlendName} weights={blendWeights} onWeight={updateWeight} onAddIngredient={addBlendIngredient} onRemoveIngredient={removeBlendIngredient} controls={blendControls} setControls={setBlendControls} price={blendPrice} onAdd={addBlendToCart} onSave={saveBlend} savedBlends={savedBlends} onLoad={loadBlend} onDelete={deleteBlend} />}
          {page === 'shops' && <ShopsPage shops={marketplaceShops} loading={shopsLoading} error={shopsError} deliveryPincode={shopPincodeSearch} pincodeSearch={shopPincodeSearch} onPincodeSearch={setShopPincodeSearch} selected={selectedShop} setSelected={selectShop} mapFocus={mapFocus} userLocation={userLocation} onLocate={locateShops} onShop={() => navigate('shop-details')} />}
          {page === 'shop-details' && (marketplaceShops[selectedShop] ? <ShopDetailsPage shop={marketplaceShops[selectedShop]} onBack={() => navigate('shops')} onAdd={addToCart} /> : <section className="inner-page"><div className="empty-state"><Store size={34} /><h2>No covered shop selected.</h2><p>Add a delivery postal code to your profile or ask an administrator to set up service coverage.</p><button className="button-primary" onClick={() => navigate('shops')}>Browse covered shops</button></div></section>)}
          {page === 'cart' && <CartPage cart={cart} subtotal={subtotal} onQuantity={changeQuantity} inventoryByProduct={inventoryByProduct} onCheckout={() => cart.length ? setCheckoutOpen(true) : notify('Your wagon is taking a little nap')} onShop={() => navigate('spices')} />}
          {page === 'tracking' && <TrackingPage order={activeOrder || orders[0]} step={activeStep} onOrders={() => navigate('orders')} />}
          {page === 'orders' && <OrdersPage orders={orders} onTrack={(order) => { setActiveOrder(order); setActiveStep(Math.max(0, steps.indexOf(order.status))); navigate('tracking'); }} onReorder={(order) => { order.items.forEach((item) => addToCart(item.product, item.quantity)); navigate('cart'); }} onShop={() => navigate('spices')} />}
          {page === 'subscriptions' && <SubscriptionsPage subscriptions={subscriptions} onAction={toggleSubscription} onBrowse={() => navigate('spices')} onCreate={() => setSubscriptionEditor({})} openHistory={openHistory} setOpenHistory={setOpenHistory} />}
          {page === 'shop-dashboard' && <ShopDashboardPage user={user} notify={notify} />}
          {page === 'admin-dashboard' && <AdminDashboardPage user={user} notify={notify} />}
          {page === 'admin-login' && <AdminSignInPage onSubmit={signInAdmin} notify={notify} />}
          {page === 'profile' && <ProfilePage user={user} onUser={setUser} deliveryLocation={deliveryLocation} onLocate={captureDeliveryLocation} onReverseAddress={lookupDeliveryAddress} notify={notify} />}
        </div>
      </main>

      {checkoutOpen && <CheckoutModal method={paymentMethod} setMethod={setPaymentMethod} busy={checkoutBusy} total={subtotal} address={deliveryAddress} setAddress={setDeliveryAddress} deliveryLocation={deliveryLocation} onLocate={captureDeliveryLocation} onReverseAddress={lookupDeliveryAddress} onClose={() => !checkoutBusy && setCheckoutOpen(false)} onSubmit={submitOrder} />}
      {subscriptionEditor && <SubscriptionEditorModal subscription={subscriptionEditor} onClose={() => setSubscriptionEditor(null)} onSave={saveSubscription} />}
      {toast && <div className="toast"><span className="toast-check"><Check size={14} /></span>{toast}</div>}
    </div>
    </LanguageContext.Provider>
  );
}

function NavIcon({ id }) {
  const props = { size: 17, strokeWidth: 1.7 };
  if (id === 'home') return <span className="nav-house"><span /></span>;
  if (id === 'admin-login' || id === 'admin-dashboard') return <ShieldCheck {...props} />;
  if (id === 'spices') return <Leaf {...props} />;
  if (id === 'shops') return <Store {...props} />;
  if (id === 'recipes') return <ChefHat {...props} />;
  if (id === 'blend') return <Sparkles {...props} />;
  if (id === 'orders') return <Package {...props} />;
  return <Clock3 {...props} />;
}
function pageLabel(page) {
  return ({ home: 'Home', spices: 'Shop spices', recipes: 'Recipe book', product: 'Product details', blend: 'Blend maker', shops: 'Local shops', 'shop-details': 'Shop details', cart: 'My wagon', tracking: 'Track your delivery', orders: 'My orders', subscriptions: 'Subscriptions', 'shop-dashboard': 'Mill dashboard', 'admin-login': 'Admin sign in', 'admin-dashboard': 'Admin dashboard', profile: 'Your profile' })[page] || 'Home';
}
function SectionEyebrow({ children }) { return <div className="eyebrow"><span />{children}</div>; }

function AdminSignInPage({ onSubmit, notify }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const signIn = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      await onSubmit(email.trim(), password);
    } catch (error) {
      notify(error.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className="inner-page admin-signin-page">
      <div className="inner-page-header">
        <SectionEyebrow>MARKETPLACE OPERATIONS</SectionEyebrow>
        <div className="title-and-side"><h1>Admin <em>sign in.</em></h1><p>Sign in with your provisioned administrator account to manage shops, orders and the catalog.</p></div>
      </div>
      <form className="profile-form admin-signin-form" onSubmit={signIn}>
        <span>ADMINISTRATOR ACCESS</span>
        <h2>Welcome <em>back.</em></h2>
        <label>Email address<input type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="admin@example.com" /></label>
        <label>Password<input type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Your administrator password" /></label>
        <button className="button-primary" disabled={busy}>{busy ? 'Signing in…' : 'Open admin dashboard'} <ArrowRight size={15} /></button>
        <p className="admin-signin-note">Admin accounts are created by a trusted operator; customer registration cannot grant administrator access.</p>
      </form>
      <Footer />
    </section>
  );
}

function HomePage({ onNavigate, onAdd, products: productList, inventoryByProduct, inventoryError, shops: availableShops, shopsLoading, shopsError, deliveryPincode, onProduct }) {
  const language = useLanguage();
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <SectionEyebrow>FROM INDIA’S NEIGHBORHOOD MILLS</SectionEyebrow>
          <h1>{language === 'ta' ? <>உண்மையான சுவைக்கு<br /><em>அருகில்.</em></> : <>A little closer<br />to <em>the real</em> thing.</>}</h1>
          <p>{language === 'ta' ? 'புதியதாக அரைக்கப்பட்ட மசாலாக்கள், உங்கள் அக்கம் பக்கத்திலிருந்து அன்புடன்.' : 'Sun-warmed spices, ground fresh by the people who know them best. Sourced close to home, delivered with love.'}</p>
          <div className="hero-actions"><button className="button-primary" onClick={() => onNavigate('spices')}>{translate('Explore the spice shelf', language)} <ArrowRight size={16} /></button><button className="text-button" onClick={() => onNavigate('blend')}>{language === 'ta' ? 'உங்கள் கலவையை உருவாக்குங்கள்' : 'Make your own blend'} <ArrowDownRight size={17} /></button></div>
          <div className="hero-note"><div className="avatar-stack"><span>R</span><span>A</span><span>M</span></div><span>Loved by <strong>2,400+</strong> home cooks nearby</span><span className="note-stars">★★★★★</span></div>
        </div>
        <div className="hero-photo">
          <img src={image('photo-1716816211590-c15a328a5ff0', 1200)} alt="An abundant collection of whole Indian spices" />
          <div className="photo-overlay" />
          <div className="floating-note"><span className="note-icon"><Leaf size={15} /></span><span><strong>Picked with care.</strong><small>Never sitting on a shelf.</small></span><BadgeCheck size={16} className="note-badge" /></div>
          <div className="hero-caption"><span>01 / 03</span><span>THE BEAUTY IS IN THE LITTLE THINGS</span><div className="hero-dots"><i className="selected" /><i /><i /></div></div>
        </div>
        <div className="hero-pagination"><span>SCROLL TO DISCOVER</span><ArrowDown size={14} /></div>
      </section>

      <section className="trust-strip">
        <div><span className="trust-icon"><Leaf size={17} /></span><span><strong>Traceable to its roots</strong><small>Know exactly where it grew</small></span></div>
        <div><span className="trust-icon"><Sparkles size={17} /></span><span><strong>Freshly ground for you</strong><small>Never months on a shelf</small></span></div>
        <div><span className="trust-icon"><Heart size={17} /></span><span><strong>Good to the last grain</strong><small>Plastic-free, always</small></span></div>
        <div><span className="trust-icon"><Truck size={17} /></span><span><strong>From your local mill</strong><small>Delivery timing confirmed by the shop</small></span></div>
      </section>

      <section className="section-block featured-section">
        <div className="section-heading"><div><SectionEyebrow>A FEW GOOD THINGS</SectionEyebrow><h2>The spice shelf,<br /><em>at its finest.</em></h2></div><button className="text-button" onClick={() => onNavigate('spices')}>Wander through all <ArrowRight size={16} /></button></div>
        {inventoryError && <p className="stock-check-error" role="status">Live stock could not be checked. The server will recheck quantities during checkout.</p>}
        <ProductGrid products={productList.slice(0, 4)} onAdd={onAdd} onProduct={onProduct} inventoryByProduct={inventoryByProduct} />
      </section>

      <section className="feature-banner">
        <div className="feature-banner-image"><img src={image('photo-1547592180-85f173990554', 1000)} alt="A cook creating a fragrant spice blend" /></div>
        <div className="feature-banner-content"><SectionEyebrow>MADE BY YOU, LOVED BY EVERYONE</SectionEyebrow><h2>Your kitchen.<br /><em>Your signature.</em></h2><p>A pinch more heat? A little less salt? Make the blend your family will ask for again.</p><button className="button-primary" onClick={() => onNavigate('blend')}>Meet the blend maker <ArrowRight size={16} /></button><span className="banner-caption">01 — THE ART OF YOUR EVERYDAY</span></div>
        <div className="banner-number">01</div>
      </section>

      <section className="section-block local-promo">
        <div className="local-promo-copy"><SectionEyebrow>DELIVERY COVERAGE</SectionEyebrow><h2>Local shops.<br /><em>Clear service areas.</em></h2><p>Enter your delivery postal code to see approved shops that serve your neighborhood.</p><button className="button-dark" onClick={() => onNavigate('shops')}>Check covered shops <MapPin size={16} /></button></div>
        {availableShops[0] ? <div className="local-shop-card"><div className="shop-card-image"><img src={image('photo-1716816211590-c15a328a5ff0', 800)} alt="Spices offered by a listed neighborhood shop" /><span className="open-pill">APPROVED SHOP</span></div><div className="local-shop-details"><div><span className="shop-overline">{deliveryPincode ? `SERVES POSTAL CODE ${deliveryPincode}` : 'APPROVED SHOP LISTING'}</span><h3>{availableShops[0].name}</h3><p>{availableShops[0].area}</p></div><div className="shop-score"><Store size={14} /> {availableShops[0].products}</div></div><button className="shop-card-link" onClick={() => onNavigate('shops')}>{deliveryPincode ? 'See covered shops' : 'See delivery areas'} <ArrowUpRight size={15} /></button></div> : <div className="local-shop-card local-shop-empty"><MapPin size={28} /><strong>{shopsLoading ? 'Checking shop coverage…' : shopsError ? 'Shop coverage unavailable' : 'No configured coverage'}</strong><p>{shopsError || (deliveryPincode ? 'No approved shop is configured for this postal code.' : 'Admins must add and approve shops with delivery postal codes.')}</p><button className="shop-card-link" onClick={() => onNavigate('shops')}>View service areas <ArrowUpRight size={15} /></button></div>}
      </section>
      <Footer onNavigate={onNavigate} />
    </>
  );
}

function ProductGrid({ products: list, onAdd, onProduct, inventoryByProduct = {} }) {
  const language = useLanguage();
  return <div className="product-grid">{list.map((product, index) => {
    const stock = inventoryByProduct[product.id];
    const soldOut = Number.isFinite(stock) && stock < 1;
    return <article className={`product-card ${soldOut ? 'product-sold-out' : ''}`} key={product.id} style={{ '--product-delay': `${index * 60}ms` }}><button className="product-image" onClick={() => onProduct?.(product)}><img src={product.image} alt={product.name} /><span className="product-tag">{soldOut ? (language === 'ta' ? 'இருப்பு இல்லை' : 'SOLD OUT') : product.tag}</span><span className="product-quick"><ArrowUpRight size={17} /></span></button><div className="product-info"><div className="product-title-row"><div><span className="product-origin">{product.origin} · {product.unit}</span><h3>{product.name}</h3><p>{product.subtitle}</p></div><button className="add-button" disabled={soldOut} onClick={() => onAdd(product)} aria-label={`Add ${product.name} to cart`}><Plus size={17} /></button></div><div className="product-meta"><span><Star size={13} fill="currentColor" /> {product.rating}</span><span>{formatPrice(product.price)} <small>/ {product.unit}</small></span></div>{Number.isFinite(stock) && stock > 0 && stock <= 5 && <small className="stock-warning">{language === 'ta' ? `கையிருப்பில் ${stock} மட்டும்` : `Only ${stock} left`}</small>}</div></article>;
  })}</div>;
}

function RecipesPage({ recipes: recipeList, inventoryByProduct, onAddIngredients }) {
  const language = useLanguage();
  const tamil = language === 'ta';
  return <section className="inner-page recipes-page">
    <div className="inner-page-header">
      <SectionEyebrow>{tamil ? 'சென்னையின் சமையல் சுவைகள்' : 'A LITTLE INSPIRATION FOR YOUR KITCHEN'}</SectionEyebrow>
      <div className="title-and-side"><h1>{tamil ? <>சமையல் <em>குறிப்புகள்.</em></> : <>Recipes for <em>real life.</em></>}</h1><p>{tamil ? 'வீட்டுச் சமையலுக்கு எளிய தமிழ் சுவைகள். மசாலாப் பொட்டலங்களை நேரடியாகக் கூடையில் சேர்க்கவும்.' : 'Simple, original Tamil Nadu-inspired recipes. Add the spice packs you need straight to your wagon.'}</p></div>
    </div>
    <div className="recipe-grid">
      {recipeList.map((recipe) => {
        const missingSpices = recipe.ingredients.filter(({ productId }) => Number.isFinite(inventoryByProduct[productId]) && inventoryByProduct[productId] < 1);
        return <article className="recipe-card" key={recipe.id}>
          <div className="recipe-card-image"><img src={recipe.image} alt="" loading="lazy" /><span><Clock3 size={13} /> {recipe.time}</span></div>
          <div className="recipe-card-content">
            <span className="recipe-servings">{recipe.servings} · {tamil ? 'வீட்டுச் சமையல்' : 'Tamil Nadu home cooking'}</span>
            <h2>{tamil ? recipe.tamilName : recipe.name}</h2>
            <p>{recipe.description}</p>
            <div className="recipe-ingredients"><strong>{tamil ? 'மசாலாக்கள்' : 'SPICES TO PICK UP'}</strong>{recipe.ingredients.map(({ productId, amount }) => {
              const product = products.find((item) => item.id === productId);
              return <span key={productId}>{product?.name || productId}<small>{amount}</small></span>;
            })}</div>
            <div className="recipe-ingredients recipe-pantry"><strong>{tamil ? 'வீட்டில் தேவை' : 'PANTRY STAPLES'}</strong><span>{recipe.pantry.join(' · ')}</span></div>
            <details className="recipe-method"><summary>{tamil ? 'செய்முறையைப் பார்க்க' : 'View method'}</summary><ol>{recipe.steps.map((step) => <li key={step}>{step}</li>)}</ol></details>
            {missingSpices.length > 0 && <small className="recipe-stock-note">{tamil ? 'சில மசாலாக்கள் தற்போது கையிருப்பில் இல்லை.' : `Currently out of stock: ${missingSpices.map(({ productId }) => products.find((item) => item.id === productId)?.name).join(', ')}`}</small>}
            <button className="button-primary recipe-add-button" disabled={missingSpices.length > 0} onClick={() => onAddIngredients(recipe)}>{tamil ? 'மசாலாக்களை கூடையில் சேர்' : 'Add spice packs to wagon'} <ShoppingBag size={15} /></button>
          </div>
        </article>;
      })}
    </div>
    <p className="recipes-note">{tamil ? 'குறிப்பில் கூறிய அளவு வழிகாட்டுதலுக்கானது. கூடையில் ஒவ்வொரு மசாலாவுக்கும் ஒரு முழுப் பொட்டலம் சேர்க்கப்படும்.' : 'Recipe amounts are cooking guidance. The button adds one full catalog pack of each listed spice; pantry staples are not added.'}</p>
    <Footer />
  </section>;
}

function SpicesPage({ products: list, category, setCategory, onAdd, onProduct, inventoryByProduct, inventoryError }) {
  const language = useLanguage();
  const t = (text) => translate(text, language);
  return <section className="inner-page"><div className="inner-page-header"><SectionEyebrow>{language === 'ta' ? 'அனைத்தும் ஒரே இடத்தில்' : 'THE GOOD STUFF, ALL IN ONE PLACE'}</SectionEyebrow><div className="title-and-side"><h1>{t('The spice shelf.')}</h1><p>{t('Honest, sun-kissed ingredients from small growers and neighborhood mills.')}</p></div></div><div className="catalog-controls"><div className="category-chips">{['All spices', 'Whole spices', 'Single origin'].map((item) => <button className={category === item ? 'chip-active' : ''} key={item} onClick={() => setCategory(item)}>{t(item)}</button>)}</div><span className="catalog-count">{list.length} {language === 'ta' ? 'பொருட்கள்' : 'lovely things'}</span></div>{inventoryError && <p className="stock-check-error" role="status">{language === 'ta' ? 'நேரடி கையிருப்பைச் சரிபார்க்க முடியவில்லை. ஆர்டர் செய்யும் போது மீண்டும் சரிபார்க்கப்படும்.' : `Live stock could not be checked: ${inventoryError}. Stock is checked again at checkout.`}</p>}<ProductGrid products={list} onAdd={onAdd} onProduct={onProduct} inventoryByProduct={inventoryByProduct} />{list.length === 0 && <div className="empty-state">No spices quite match that search. Try something else?</div>}<Footer /></section>;
}

function ProductPage({ product, stock, onBack, onAdd, onSubscribe }) {
  const language = useLanguage();
  const [quantity, setQuantity] = useState(1);
  const soldOut = Number.isFinite(stock) && stock < 1;
  return <section className="inner-page product-detail-page"><button className="back-link" onClick={onBack}><ArrowLeft size={15} /> {language === 'ta' ? 'மசாலா அலமாரிக்குத் திரும்பு' : 'Back to the spice shelf'}</button><div className="product-detail"><div className="product-detail-photo"><img src={product.image} alt={product.name} /><span className="product-tag">{soldOut ? (language === 'ta' ? 'இருப்பு இல்லை' : 'SOLD OUT') : product.tag}</span><div className="image-caption">GROWN WITH CARE IN {product.origin.toUpperCase()}</div></div><div className="product-detail-copy"><SectionEyebrow>SMALL BATCH · SINGLE ORIGIN</SectionEyebrow><h1>{product.name.split(' ').slice(0, -1).join(' ')} <em>{product.name.split(' ').slice(-1)}</em></h1><p className="detail-intro">{product.subtitle}. Grown slowly, harvested by hand, and milled right here in your neighborhood—just as it should be.</p><div className="detail-rating"><Star size={15} fill="currentColor" /> {product.rating} <span>· 38 thoughtful reviews</span></div><div className="detail-price">{formatPrice(product.price)} <small>/ {product.unit}</small><span>Freshly milled to order</span></div><div className="quantity-select"><span>{language === 'ta' ? 'எவ்வளவு வேண்டும்?' : 'HOW MUCH WOULD YOU LIKE?'}</span><div><button onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus size={15} /></button><strong>{quantity} × {product.unit}</strong><button disabled={soldOut || (Number.isFinite(stock) && quantity >= stock)} onClick={() => setQuantity(quantity + 1)}><Plus size={15} /></button></div></div><button className="button-primary full-button" disabled={soldOut} onClick={() => onAdd(product, quantity)}>{soldOut ? (language === 'ta' ? 'தற்போது கையிருப்பில் இல்லை' : 'Currently out of stock') : `${language === 'ta' ? 'கூடையில் சேர்' : 'Add to my wagon'} · ${formatPrice(quantity * product.price)}`} <ShoppingBag size={16} /></button><button className="subscribe-link" onClick={onSubscribe}><Clock3 size={15} /> Make it a little ritual <ArrowRight size={14} /></button><div className="detail-promises"><span><Leaf size={15} /> Grown responsibly</span><span><Truck size={15} /> Free delivery over ₹499</span><span><BadgeCheck size={15} /> Quality checked</span></div><div className="detail-origin"><span>THE GROWING STORY</span><p>Our growers in {product.origin} have nurtured these little beauties with care through every monsoon, harvest and sunny morning. That's why they taste like somewhere.</p></div></div></div><div className="detail-extra"><span>01 / THE LITTLE DETAILS</span><span>Whole spice · Sun dried · No additives</span><span>Best before 12 months from milling</span></div><Footer /></section>;
}

function BlendPage({ name, setName, weights, onWeight, onAddIngredient, onRemoveIngredient, controls, setControls, price, onAdd, onSave, savedBlends, onLoad, onDelete }) {
  const [ingredientToAdd, setIngredientToAdd] = useState('');
  const [deletingBlend, setDeletingBlend] = useState('');
  const profile = describeBlend(weights, controls);
  const deleteSavedBlend = async (blend) => {
    if (!window.confirm(`Delete the saved blend “${blend.name}”? This cannot be undone.`)) return;
    setDeletingBlend(blend._id);
    try {
      await onDelete(blend._id);
    } finally {
      setDeletingBlend('');
    }
  };
  const setControl = (key, value) => setControls((current) => ({ ...current, [key]: Number(value) }));
  const totalPercentage = Object.values(weights).reduce((total, value) => total + value, 0);
  return (
    <section className="inner-page blend-page">
      <div className="blend-heading">
        <div>
          <SectionEyebrow>A PINCH OF THIS. A LITTLE OF THAT.</SectionEyebrow>
          <h1>Your kitchen.<br /><em>Your blend.</em></h1>
          <p>Every great family recipe starts somewhere. Here’s your somewhere.</p>
        </div>
        <div className="blend-illustration"><img src={image('photo-1716816211590-c15a328a5ff0', 500)} alt="Colorful raw spices to inspire your custom blend" /><span><Sparkles size={17} /> Blended just for you</span></div>
      </div>
      {savedBlends.length > 0 && (
        <div className="saved-blends">
          <span>YOUR SAVED BLENDS</span>
          {savedBlends.map((blend) => (
            <div className="saved-blend" key={blend._id}>
              <button className="saved-blend-load" onClick={() => onLoad(blend)}><Sparkles size={13} /><span>{blend.name}<small>{Object.values(blend.ingredients).join('% · ')}% · {blend.quantity} g</small></span></button>
              <button className="saved-blend-delete" disabled={deletingBlend === blend._id} onClick={() => deleteSavedBlend(blend)} aria-label={`Delete ${blend.name}`}><Trash2 size={14} /><span>{deletingBlend === blend._id ? 'Deleting…' : 'Delete'}</span></button>
            </div>
          ))}
        </div>
      )}
      <div className="blend-workspace">
        <div className="blend-controls-panel">
          <div className="blend-panel-heading">
            <div><span className="section-index">01 / YOUR RECIPE</span><h2>Build the good stuff.</h2></div>
            <span className={`ingredient-total ${totalPercentage === 100 ? '' : 'ingredient-total-error'}`}><Check size={13} /> {totalPercentage}% TOTAL</span>
          </div>
          <label className="blend-name-label">GIVE YOUR BLEND A NAME<input value={name} maxLength="42" onChange={(event) => setName(event.target.value)} placeholder="A name with a little meaning" /></label>
          <div className="ingredients-title">
            <span>INGREDIENTS</span>
            <label className="add-ingredient-select">
              <select value={ingredientToAdd} onChange={(event) => { if (event.target.value) onAddIngredient(event.target.value); setIngredientToAdd(''); }}>
                <option value="">+ Add ingredient</option>
                {blendIngredients.filter((ingredient) => !Object.hasOwn(weights, ingredient.id)).map((ingredient) => <option value={ingredient.id} key={ingredient.id}>{ingredient.name}</option>)}
              </select>
            </label>
          </div>
          <div className="ingredient-list">
            {Object.keys(weights).map((id) => {
              const ingredient = blendIngredients.find((item) => item.id === id) || { id, name: id, note: 'A little something special', color: '#8a795b' };
              return (
                <div className="ingredient-row" key={ingredient.id}>
                  <div className="ingredient-dot" style={{ backgroundColor: ingredient.color }} />
                  <div className="ingredient-label"><strong>{ingredient.name}</strong><small>{ingredient.note}</small></div>
                  <input aria-label={`${ingredient.name} percentage`} className="ingredient-slider" type="range" min="0" max="100" value={weights[ingredient.id]} style={{ '--slider-color': ingredient.color, '--slider-value': `${weights[ingredient.id]}%` }} onChange={(event) => onWeight(ingredient.id, event.target.value)} />
                  <output>{weights[ingredient.id]}<small>%</small></output>
                  <button className="remove-ingredient-button" type="button" disabled={Object.keys(weights).length <= 2} title={Object.keys(weights).length <= 2 ? 'Keep at least two ingredients in your masala' : `Remove ${ingredient.name}`} aria-label={`Remove ${ingredient.name} from blend`} onClick={() => onRemoveIngredient(ingredient.id)}><Trash2 size={14} /><span>Remove</span></button>
                </div>
              );
            })}
          </div>
          <p className="blend-ingredients-hint">Keep at least two spices. Removing one redistributes the remaining recipe to 100%.</p>
          <div className="blend-adjustments">
            {[['spice', 'Spice level', 'A little warmth'], ['heat', 'Heat level', 'A gentle glow'], ['salt', 'Salt level', 'Just enough']].map(([key, label, hint]) => (
              <div className="adjustment-row" key={key}>
                <span><strong>{label}</strong><small>{hint}</small></span>
                <input aria-label={label} type="range" min="0" max="100" value={controls[key]} onChange={(event) => setControl(key, event.target.value)} />
                <span className="adjustment-value">{controls[key] < 34 ? 'Gentle' : controls[key] < 68 ? 'Just right' : 'More please'}</span>
              </div>
            ))}
          </div>
          <div className="quantity-row"><span>YOUR LITTLE BATCH</span><div>{[100, 200, 500].map((quantity) => <button key={quantity} className={controls.quantity === quantity ? 'quantity-active' : ''} onClick={() => setControl('quantity', quantity)}>{quantity} g</button>)}</div></div>
          <div className="blend-cart-row">
            <div><small>YOUR CUSTOM BLEND</small><strong>{formatPrice(price)} <span>/ {controls.quantity} g</span></strong></div>
            <div className="blend-action-buttons"><button className="button-outline" onClick={onSave}><Heart size={14} /> Save recipe</button><button className="button-primary" disabled={totalPercentage !== 100} onClick={onAdd}>Add your blend <ArrowRight size={15} /></button></div>
          </div>
        </div>
        <aside className="blend-preview">
          <div className="preview-top"><span>YOUR BLEND, AT A GLANCE</span><span className="preview-live"><i /> LIVE PREVIEW</span></div>
          <div className="blend-jar"><img src={image('photo-1716816211590-c15a328a5ff0', 550)} alt="A custom blend of hand-selected spices" /><span className="jar-caption"><Sparkles size={13} /> YOUR RECIPE · NO. 01</span><h3>{name || profile.productName}</h3><span className="jar-weight">{controls.quantity} g · Freshly milled for you</span></div>
          <div className="preview-profile">
            <span>THE FLAVOR PROFILE</span>
            <div className="flavor-bars">
              {Object.values(weights).map((percentage, index) => <div key={`${Object.keys(weights)[index]}-flavor`} style={{ height: `${18 + percentage * .45}px` }} />)}
              <div style={{ height: `${18 + controls.heat * .45}px` }} /><div style={{ height: `${18 + controls.spice * .45}px` }} />
            </div>
            <div className="flavor-labels"><span>BRIGHT</span><span>EARTHY</span><span>WARM</span><span>GOLDEN</span></div>
            <p className="blend-profile-summary"><strong>{profile.summary}</strong>{profile.description}</p>
            <p className="blend-composition"><span>YOUR RECIPE</span>{profile.composition}</p>
          </div>
          <div className="blend-note"><Sparkles size={15} /><p>Your blend is prepared by a neighborhood spice maker. The shop will confirm its preparation and delivery timing.</p></div>
        </aside>
      </div>
      <div className="blend-footnote"><span>GOOD SPICE HAS NOTHING TO HIDE.</span><span>Every ingredient is single origin, traceable and milled fresh after you place your order.</span></div>
      <Footer />
    </section>
  );
}

function ShopsPage({ shops: availableShops, loading, error, deliveryPincode, pincodeSearch, onPincodeSearch, selected, setSelected, mapFocus, userLocation, onLocate, onShop }) {
  const language = useLanguage();
  const [neighborhood, setNeighborhood] = useState('');
  const [pinInput, setPinInput] = useState(pincodeSearch);
  const [filterError, setFilterError] = useState('');
  useEffect(() => setPinInput(pincodeSearch), [pincodeSearch]);
  const matchingShops = availableShops.filter((item) => (!pincodeSearch || item.servicePincodes?.includes(pincodeSearch))
    && (!neighborhood.trim() || `${item.name} ${item.area}`.toLocaleLowerCase().includes(neighborhood.trim().toLocaleLowerCase())));
  const shop = matchingShops.find((item) => availableShops.indexOf(item) === selected) || matchingShops[0];
  const applyShopFilters = (event) => {
    event.preventDefault();
    const pin = pinInput.trim();
    if (pin && !/^\d{6}$/.test(pin)) {
      setFilterError('Enter a valid six-digit PIN code, or clear it to browse all approved shops.');
      return;
    }
    setFilterError('');
    onPincodeSearch(pin);
  };
  const distanceFor = (item) => {
    if (!userLocation || !Number.isFinite(item.lat) || !Number.isFinite(item.lng)) return 'Location unavailable';
    const [latitude, longitude] = userLocation;
    const toRadians = (degrees) => degrees * Math.PI / 180;
    const latitudeDelta = toRadians(item.lat - latitude);
    const longitudeDelta = toRadians(item.lng - longitude);
    const distance = 6371 * 2 * Math.asin(Math.sqrt(
      Math.sin(latitudeDelta / 2) ** 2
      + Math.cos(toRadians(latitude)) * Math.cos(toRadians(item.lat)) * Math.sin(longitudeDelta / 2) ** 2,
    ));
    return distance < 1 ? `${Math.round(distance * 1000)} m` : `${distance.toFixed(1)} km`;
  };
  return (
    <section className="inner-page shops-page">
      <div className="shops-heading">
        <div>
          <SectionEyebrow>GOOD SPICE, RIGHT AROUND THE CORNER</SectionEyebrow>
          <h1>{language === 'ta' ? <>உங்கள் பகுதி,<br /><em>மணம் நிறைந்தது.</em></> : <>Your neighborhood,<br /><em>well-seasoned.</em></>}</h1>
          <p>{translate('Only approved shops with configured postal-code coverage appear here.', language)} {language === 'ta' ? 'தூரம் உங்கள் சாதனத்தின் GPS இருப்பிடத்தைப் பயன்படுத்தும்.' : 'Distances use your device GPS when available.'}</p>
        </div>
        <button className="location-button" onClick={onLocate}><LocateFixed size={16} /> {translate('Use my location', language)}</button>
      </div>
      <div className="shop-finder">
        <div className="shop-list-panel">
          <form className="shop-discovery-filters" onSubmit={applyShopFilters}>
            <label>{translate('Find shops by PIN code', language)}<input inputMode="numeric" maxLength="6" value={pinInput} onChange={(event) => setPinInput(event.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="e.g. 600015" /></label>
            <label>{translate('Search a Chennai area', language)}<input value={neighborhood} onChange={(event) => setNeighborhood(event.target.value)} placeholder={language === 'ta' ? 'பகுதி அல்லது தெரு' : 'Area, street, or shop'} /></label>
            <button className="button-outline" type="submit">{translate('Apply filters', language)}</button>
            {filterError && <small role="alert">{filterError}</small>}
          </form>
          <div className="shop-list-header"><span>{deliveryPincode ? `${matchingShops.length} SHOPS SERVE ${deliveryPincode}` : `${matchingShops.length} APPROVED SHOPS`}</span></div>
          {loading && <p className="dashboard-empty">Loading approved shops and service areas…</p>}
          {!loading && error && <p className="dashboard-empty" role="alert">{error} Check your connection and retry by refreshing this page.</p>}
          {!loading && !error && matchingShops.length === 0 && <div className="shop-coverage-empty"><MapPin size={24} /><strong>{translate('No shops match these filters.', language)}</strong><span>{language === 'ta' ? 'மற்றொரு பகுதியை அல்லது PIN குறியீட்டை முயற்சிக்கவும்.' : 'Try another area or postal code, or clear the filters to browse all approved shops.'}</span></div>}
          {matchingShops.map((item) => (
            <button className={`shop-result ${shop?._id === item._id ? 'shop-result-active' : ''}`} key={item._id || item.name} onClick={() => setSelected(availableShops.indexOf(item))}>
              <div className="shop-result-top"><div className="shop-color-swatch" style={{ background: item.color }}><Store size={17} /></div><span className="open-state">{item.isDemo ? 'DEMO · TEST ONLY' : 'LISTED'}</span></div>
              <div className="shop-result-title"><h3>{item.name}</h3><span><Star size={13} fill="currentColor" /> {item.rating}</span></div>
              <p>{item.area}</p>
              <div className="shop-result-meta"><span><MapPin size={12} /> {distanceFor(item)}</span><span><Package size={12} /> {item.products}</span></div>
            </button>
          ))}
          <div className="shop-list-foot"><span>APPROVED SHOP LISTINGS</span><span>{deliveryPincode ? `Coverage includes ${deliveryPincode}` : 'Add a postal code to check coverage'}</span></div>
        </div>
        <div className="map-panel">
          <MapContainer center={mapFocus} zoom={14} scrollWheelZoom={false} className="leaflet-map">
            <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {matchingShops.filter((item) => Number.isFinite(item.lat) && Number.isFinite(item.lng)).map((item) => {
              const index = availableShops.indexOf(item);
              return (
              <CircleMarker key={item.name} center={[item.lat, item.lng]} eventHandlers={{ click: () => setSelected(index) }} pathOptions={{ color: selected === index ? '#a64732' : '#fffdf8', fillColor: item.color, fillOpacity: 1, weight: selected === index ? 4 : 2, radius: selected === index ? 12 : 9 }}>
                <Popup><strong>{item.name}</strong><br />{item.area}<br />Delivery time confirmed by the shop</Popup>
              </CircleMarker>
              );
            })}
            {userLocation && <CircleMarker center={userLocation} pathOptions={{ color: '#fffdf8', fillColor: '#252a22', fillOpacity: 1, weight: 3, radius: 7 }}><Popup>You’re here</Popup></CircleMarker>}
            <MapFocus point={mapFocus} />
          </MapContainer>
          <div className="map-legend"><span><i className="legend-shop" /> Approved shops</span>{userLocation && <span><i className="legend-home" /> You are here</span>}</div>
          {shop && <div className="map-selection-card">
            <div><span className="map-card-eyebrow">APPROVED MILL · {distanceFor(shop).toUpperCase()}</span><strong>{shop.name}</strong><span>{shop.area} · delivery timing confirmed with shop</span></div>
            <button onClick={onShop} aria-label="See shop details"><ArrowUpRight size={17} /></button>
          </div>}
          <div className="map-scale"><span>0</span><i /><span>500 m</span></div>
        </div>
      </div>
      <div className="shops-promise"><Leaf size={15} /><span>Our shopkeepers are neighbors, not warehouses. Every purchase stays in your community.</span><ArrowRight size={15} /></div>
      <Footer />
    </section>
  );
}
function MapFocus({ point }) { const map = useMap(); useEffect(() => { map.flyTo(point, 14, { duration: 0.8 }); }, [map, point[0], point[1]]); return null; }

function LocationPreview({ location, label }) {
  const point = [location.latitude, location.longitude];
  return (
    <div className="location-preview">
      <div className="location-preview-map">
        <MapContainer key={`${location.latitude}-${location.longitude}`} center={point} zoom={16} scrollWheelZoom={false} className="location-map">
          <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <CircleMarker center={point} pathOptions={{ color: '#fffdf8', fillColor: '#a64732', fillOpacity: 1, weight: 3, radius: 9 }}>
            <Popup>{label}</Popup>
          </CircleMarker>
        </MapContainer>
      </div>
      <div className="location-preview-details"><strong>{label}</strong><span>Saved map pin</span><a className="map-pin-link" href={`https://www.openstreetmap.org/?mlat=${encodeURIComponent(location.latitude)}&mlon=${encodeURIComponent(location.longitude)}#map=17/${encodeURIComponent(location.latitude)}/${encodeURIComponent(location.longitude)}`} target="_blank" rel="noreferrer">Open this location in OpenStreetMap</a><small>GPS accuracy ±{Math.round(location.accuracy || 0)} m · This pin is separate from your written street address.</small></div>
    </div>
  );
}

function ShopDetailsPage({ shop, onBack, onAdd }) {
  return (
    <section className="inner-page shop-details-page">
      <button className="back-link" onClick={onBack}><ArrowLeft size={15} /> Back to the neighborhood</button>
      <div className="shop-detail-hero">
        <div className="shop-detail-photo">
          <img src={image('photo-1716816211590-c15a328a5ff0', 1000)} alt={`${shop.name} freshly milled spices`} />
          <span className="open-pill"><i /> {shop.status.toUpperCase()}</span>
        </div>
        <div className="shop-detail-copy">
          <SectionEyebrow>APPROVED MARKETPLACE SHOP</SectionEyebrow>
          <h1>{shop.name.split(' ').slice(0, -1).join(' ')}<br /><em>{shop.name.split(' ').slice(-1)}.</em></h1>
          {shop.rating !== 'New' && <div className="detail-rating"><Star size={15} fill="currentColor" /> {shop.rating} <span>· Shop listing rating</span></div>}
          <p>{shop.description || `Shop address: ${shop.area}. Delivery coverage is configured for postal codes ${shop.servicePincodes?.join(', ') || 'not listed'}.`}</p>
          <div className="shop-facts">
            <span><MapPin size={15} /> {shop.area}</span>
            <span><Clock3 size={15} /> {shop.status}</span>
            <span><Bike size={15} /> Confirm delivery time with the shop</span>
            <span><Package size={15} /> {shop.products} freshly milled here</span>
            <span><MapPin size={15} /> Serves postal codes {shop.servicePincodes?.join(', ') || 'not listed'}</span>
          </div>
          <div className="shop-certifications"><BadgeCheck size={15} /> Approved marketplace shop</div>
        </div>
      </div>
      <div className="shop-inventory-heading"><div><span>MARKETPLACE CATALOG</span><h2>Spices for your <em>kitchen.</em></h2></div><span className="catalog-count">Catalog items · not shop-specific inventory</span></div>
      <ProductGrid products={products.slice(0, 3)} onAdd={onAdd} />
      <Footer />
    </section>
  );
}

function CartPage({ cart, subtotal, onQuantity, onCheckout, onShop, inventoryByProduct }) {
  const language = useLanguage();
  return (
    <section className="inner-page cart-page">
      <div className="inner-page-header">
        <SectionEyebrow>GOOD THINGS ARE ON THEIR WAY</SectionEyebrow>
        <div className="title-and-side"><h1>{translate('Your wagon.', language)}</h1><p>{translate('A little something good for your kitchen.', language)}</p></div>
      </div>
      {cart.length ? (
        <div className="cart-layout">
          <div className="cart-items">
            {cart.map(({ product, quantity }) => (
              <article className="cart-item" key={product.id}>
                <img src={product.image} alt={product.name} />
                <div className="cart-item-info">
                  <span>{product.origin} · {product.unit}</span>
                  <h3>{product.name}</h3>
                  <p>{product.subtitle}</p>
                  <div className="cart-quantity">
                    <button onClick={() => onQuantity(product.id, -1)} aria-label={`Remove one ${product.name}`}><Minus size={13} /></button>
                    <strong>{quantity}</strong>
                    <button disabled={Number.isFinite(inventoryByProduct[product.id]) && quantity >= inventoryByProduct[product.id]} onClick={() => onQuantity(product.id, 1)} aria-label={`Add one ${product.name}`}><Plus size={13} /></button>
                  </div>
                </div>
                <strong className="cart-item-price">{formatPrice(product.price * quantity)}</strong>
              </article>
            ))}
            <button className="continue-shopping" onClick={onShop}><ArrowLeft size={14} /> Keep wandering the spice shelf</button>
          </div>
          <aside className="cart-summary">
            <span>THE LITTLE RECAP</span>
            <div><span>Subtotal</span><strong>{formatPrice(subtotal)}</strong></div>
            <div><span>Neighborhood delivery</span><strong>{subtotal >= 499 ? 'On us' : '₹40'}</strong></div>
            <div className="free-delivery-meter">
              <span>{subtotal >= 499 ? 'Lovely, delivery is on us!' : `Add ${formatPrice(499 - subtotal)} for free delivery`}</span>
              <div><i style={{ width: `${Math.min(100, subtotal / 499 * 100)}%` }} /></div>
            </div>
            <div className="summary-total"><span>All in, just</span><strong>{formatPrice(subtotal + (subtotal >= 499 ? 0 : 40))}</strong></div>
            <button className="button-primary full-button" onClick={onCheckout}>{translate('On to checkout', language)} <ArrowRight size={16} /></button>
            <p className="secure-note"><BadgeCheck size={14} /> Pay safely, shop locally</p>
            <div className="cart-reassurance"><Leaf size={15} /><small>Every order arrives in a reusable, plastic-free paper pouch.</small></div>
          </aside>
        </div>
      ) : (
        <div className="empty-cart">
          <div className="empty-cart-art"><img src={image('photo-1596040033229-a9821ebd058d', 550)} alt="An inviting assortment of spices" /></div>
          <span>NOT A SINGLE SPICE IN SIGHT</span>
          <h2>It’s a little quiet<br />in your <em>wagon.</em></h2>
          <p>Your next favorite flavor is just around the corner.</p>
          <button className="button-primary" onClick={onShop}>Find something lovely <ArrowRight size={15} /></button>
        </div>
      )}
      <Footer />
    </section>
  );
}

function TrackingPage({ order, step, onOrders }) {
  const language = useLanguage();
  if (!order) return <section className="inner-page"><div className="empty-state tracking-empty"><Truck size={36} /><h2>Nothing on the road just yet.</h2><p>When you place an order, we’ll show its little journey right here.</p><button className="button-primary" onClick={onOrders}>See my orders <ArrowRight size={15} /></button></div></section>;
  const currentStep = Math.max(0, Math.min(steps.length - 1, step));
  const history = [...(order.statusHistory || [])].reverse();
  const latestUpdate = history[0];
  const terminalStatus = ['Rejected', 'Cancelled'].includes(order.status);
  return (
    <section className="inner-page tracking-page">
      <div className="tracking-header">
        <div><SectionEyebrow>FRESHLY MILLED. ALREADY MOVING.</SectionEyebrow><h1>{language === 'ta' ? <>உங்கள் மசாலா<br /><em>பயணம்.</em></> : <>Your spice story,<br /><em>in motion.</em></>}</h1><p>Order <strong>#{String(order.id).slice(-6)}</strong> · A small batch, made just for you.</p></div>
        <div className="delivery-eta"><span>{translate('CURRENT STATUS', language)}</span><strong className="tracking-status-heading">{translate(order.status, language)}</strong><small>{latestUpdate?.at ? `Last updated ${new Date(latestUpdate.at).toLocaleString(language === 'ta' ? 'ta-IN' : 'en-IN')}` : 'Waiting for the shop’s first update'}</small></div>
      </div>
      <div className="tracking-map-wrap tracking-status-note"><Truck size={21} /><div><strong>Order updates are based on confirmed status changes.</strong><span>This app does not receive rider GPS data. The shop or admin records each delivery milestone.</span></div></div>
      {order.deliveryLocation && <LocationPreview location={order.deliveryLocation} label="GPS delivery pin saved with this order" />}
      <div className="timeline-card">
        <div className="timeline-head"><div><span>{translate('THE LITTLE JOURNEY', language)}</span><h2>{language === 'ta' ? <>ஒவ்வொரு படியும், <em>புதிது.</em></> : <>Every step, <em>fresh.</em></>}</h2></div><span className="timeline-update">{translate('CURRENT STATUS', language)}</span></div>
        {!terminalStatus && <div className="timeline">
          <div className="timeline-progress" style={{ width: `${currentStep / (steps.length - 1) * 100}%` }} />
          {steps.map((item, index) => <div key={item} className={`timeline-step ${index < currentStep ? 'step-done' : ''} ${index === currentStep ? 'step-active' : ''}`}><span className="timeline-dot">{index < currentStep ? <Check size={12} /> : index === currentStep ? <i /> : ''}</span><span className="timeline-label">{translate(item, language)}</span></div>)}
        </div>}
        <div className="timeline-current"><span className="current-check"><CheckCircle2 size={18} /></span><div><strong>{translate(order.status, language)}</strong><small>{latestUpdate?.note || 'Waiting for the shop to record the next update.'}</small></div><span className="order-status-pill">{translate(order.status, language)}</span></div>
        {history.length > 0 && <div className="tracking-history">{history.map((entry, index) => <div className="tracking-history-row" key={`${entry.status}-${entry.at}-${index}`}><strong>{translate(entry.status, language)}</strong><span>{entry.note || 'Status updated'}</span><time>{entry.at ? new Date(entry.at).toLocaleString(language === 'ta' ? 'ta-IN' : 'en-IN') : 'Time unavailable'}</time></div>)}</div>}
      </div>
      <div className="tracking-assignment">
        <strong>DELIVERY TEAM</strong>
        <span>{order.shopName ? `Shop: ${order.shopName}` : 'Shop assignment pending'}</span>
        {order.courierName && <span>Courier: {order.courierName}{order.courierPhone ? ` · ${order.courierPhone}` : ''}{order.courierIsDemo ? ' · DEMO TEST ONLY' : ''}</span>}
      </div>
      <div className="tracking-address"><MapPin size={15} /><span>DELIVERING TO <address>{order.deliveryAddress}</address></span><button onClick={onOrders}>Order details <ArrowUpRight size={14} /></button></div>
      <Footer />
    </section>
  );
}

function OrdersPage({ orders, onTrack, onReorder, onShop }) {
  const language = useLanguage();
  return <section className="inner-page orders-page"><div className="inner-page-header"><SectionEyebrow>A LITTLE HISTORY, A LOT OF FLAVOR</SectionEyebrow><div className="title-and-side"><h1>{translate('Your orders.', language)}</h1><p>{translate('The good things you’ve brought home, all in one place.', language)}</p></div></div>{orders.length ? <div className="orders-list">{orders.map((order) => {
    const latest = order.statusHistory?.[order.statusHistory.length - 1];
    return <article className="order-card" key={order.id}><div className="order-card-header"><div><span>ORDER #{String(order.id).slice(-6)}</span><h3>{language === 'ta' ? 'உங்கள் ஆர்டர் பயணம்' : 'On its little journey'}</h3><small>{new Date(order.createdAt).toLocaleDateString(language === 'ta' ? 'ta-IN' : 'en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</small></div><span className="order-status-pill">{translate(order.status, language)}</span></div><div className="order-latest-update"><Bell size={14} /><span><strong>{translate(order.status, language)}</strong>{latest?.note && ` · ${latest.note}`}</span><time>{latest?.at ? new Date(latest.at).toLocaleString(language === 'ta' ? 'ta-IN' : 'en-IN') : 'Time unavailable'}</time></div><div className="order-card-items">{order.items.map(({ product, quantity }) => <div key={product.id}><img src={product.image} alt="" /><span>{product.name}<small>{quantity} × {product.unit}</small></span></div>)}</div><div className="order-card-footer"><span>{translate(order.paymentStatus, language)} · <strong>{formatPrice(order.total)}</strong></span><div><button className="button-outline" onClick={() => onReorder(order)}>{translate('Order again', language)} <ArrowDownRight size={14} /></button><button className="button-primary" onClick={() => onTrack(order)}>{translate('Follow along', language)} <ArrowRight size={14} /></button></div></div></article>;
  })}</div> : <div className="empty-state"><Package size={35} /><h2>It’s a fresh start.</h2><p>Your past orders and their stories will appear here.</p><button className="button-primary" onClick={onShop}>Explore the spice shelf <ArrowRight size={15} /></button></div>}<Footer /></section>;
}

function SubscriptionsPage({ subscriptions, onAction, onBrowse, onCreate, openHistory, setOpenHistory }) {
  const activeCount = subscriptions.filter((item) => item.status === 'Active').length;
  return (
    <section className="inner-page subscriptions-page">
      <div className="subscription-hero">
        <div>
          <SectionEyebrow>GOOD THINGS, ON A LITTLE SCHEDULE</SectionEyebrow>
          <h1>The good stuff,<br /><em>on repeat.</em></h1>
          <p>Your favorite flavors, right when you run out. Pause, skip or switch things up anytime.</p>
          <button className="button-primary" onClick={onCreate}>Start a little ritual <ArrowRight size={15} /></button>
        </div>
        <div className="subscription-art">
          <img src={image('photo-1716816211590-c15a328a5ff0', 800)} alt="Fresh ingredients for a spice subscription" />
          <div className="subscription-art-note"><span>01</span><strong>Your kitchen,<br />never without.</strong></div>
        </div>
      </div>
      <div className="subscription-stats">
        <div><span>YOUR LITTLE RITUALS</span><strong>{activeCount.toString().padStart(2, '0')} <small>active</small></strong></div>
        <div><span>NEXT DELIVERY</span><strong>{subscriptions.find((item) => item.status === 'Active')?.date || 'Nothing scheduled'}</strong></div>
        <div><span>SKIP ANYTIME</span><strong>Always on your terms</strong></div>
        <div><span>PAUSE OR CANCEL</span><strong>One tap away</strong></div>
      </div>
      <div className="sub-list-heading">
        <div><span>THE GOOD THINGS YOU LOVE</span><h2>Your little <em>rituals.</em></h2></div>
        <span>{activeCount} ACTIVE RITUALS</span>
      </div>
      <div className="subscription-list">
        {subscriptions.map((item) => (
          <article className={`subscription-card ${item.status !== 'Active' ? 'subscription-paused' : ''}`} key={item.id}>
            <div className="subscription-product-image"><img src={item.image} alt={item.name} /><span className={`sub-status ${item.status.toLowerCase()}`}><i /> {item.status}</span></div>
            <div className="subscription-card-body">
              <span className="sub-overline">YOUR FAVORITE, ON REPEAT</span>
              <h3>{item.name}</h3>
              <p>{item.detail}</p>
              <div className="next-delivery"><Clock3 size={14} /><span>NEXT LITTLE DELIVERY <strong>{item.status === 'Active' ? item.date : 'When you’re ready'}</strong></span></div>
              <div className="subscription-actions">
                <button onClick={() => onAction(item.id, item.status === 'Active' ? 'Pause' : 'Resume')}>{item.status === 'Active' ? 'Pause for now' : 'Resume ritual'}</button>
                <button onClick={() => onAction(item.id, 'Skip')}>Skip next</button>
                <button onClick={() => onAction(item.id, 'Cancel')}>Cancel</button>
                <button onClick={() => setOpenHistory(openHistory === item.id ? null : item.id)}>{openHistory === item.id ? 'Hide history' : 'History'}</button>
              </div>
              {openHistory === item.id && <div className="subscription-history">{(item.history?.length ? item.history : [{ action: 'Started your spice ritual', date: 'Recently' }]).map((entry, index) => <span key={`${entry.action}-${index}`}><CheckCircle2 size={12} />{entry.action} · {entry.date || new Date(entry.at).toLocaleDateString('en-IN')}</span>)}</div>}
            </div>
            <button className="sub-edit-button" onClick={() => onAction(item.id, 'Change')}>Change <ArrowUpRight size={14} /></button>
          </article>
        ))}
      </div>
      <button className="add-subscription-link" onClick={onCreate}><Plus size={15} /> Add something lovely to the rotation</button>
      <button className="add-subscription-link" onClick={onBrowse}>Browse spices before choosing <ArrowRight size={14} /></button>
      <Footer />
    </section>
  );
}

function ProfilePage({ user, onUser, deliveryLocation, onLocate, onReverseAddress, notify }) {
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [address, setAddress] = useState(user?.address || '');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const saveProfile = async (event) => {
    event.preventDefault();
    if (!name.trim() || !email.includes('@')) return notify('Please enter a name and a valid email');
    if (!user?.token && password.length < 8) return notify('Choose a password with at least 8 characters');
    setBusy(true);
    try {
      let account = user;
      if (user?.token) {
        const response = await fetch('/api/auth/me', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
          body: JSON.stringify({ name, email, address, ...(password ? { password } : {}) }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Unable to update your profile');
        account = { ...data, token: user.token };
      } else {
        const response = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, address, password, ...(deliveryLocation ? { deliveryLocation } : {}) }) });
        const data = await response.json();
        if (!response.ok && response.status !== 409) throw new Error(data.message || 'Unable to create your account');
        if (response.status === 409) {
          const loginResponse = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
          const loginData = await loginResponse.json();
          if (!loginResponse.ok) throw new Error(loginData.message || 'Enter your account password to sign in');
          const profileResponse = await fetch('/api/auth/me', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${loginData.token}` },
            body: JSON.stringify({ name, email, address }),
          });
          const profileData = await profileResponse.json();
          if (!profileResponse.ok) throw new Error(profileData.message || 'Unable to update your profile');
          account = { ...profileData, token: loginData.token };
        } else account = data;
      }
      onUser(account);
      localStorage.setItem('spicewagon-user', JSON.stringify(account));
      setPassword('');
      notify('Your little corner is up to date');
    } catch (error) {
      notify(error.message);
    } finally { setBusy(false); }
  };
  const lookupAddress = async () => {
    const resolved = await onReverseAddress();
    if (resolved) setAddress(resolved);
  };
  return (
    <section className="inner-page profile-page">
      <div className="inner-page-header">
        <SectionEyebrow>YOUR LITTLE CORNER OF THE WAGON</SectionEyebrow>
        <div className="title-and-side"><h1>Your <em>profile.</em></h1><p>Keep your details close and your favorite deliveries closer.</p></div>
      </div>
      <div className="profile-layout">
        <aside className="profile-card">
          <div className="profile-avatar">{(name || 'Y').charAt(0).toUpperCase()}</div>
          <span>THE NEIGHBORHOOD COOK</span>
          <h3>{name || 'Your name here'}</h3>
          <p>{email || 'Add your email address'}</p>
          <div className="profile-points"><Leaf size={15} /><span>Spice-curious since <strong>October 2026</strong></span></div>
        </aside>
        <form className="profile-form" onSubmit={saveProfile}>
          <span>YOUR DETAILS</span>
          <h2>A little about <em>you.</em></h2>
          <label>Your name<input required value={name} onChange={(event) => setName(event.target.value)} placeholder="How should we call you?" /></label>
          <label>Email address<input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@somewhere.com" /></label>
          <label>{user?.token ? 'New password' : 'Password'} <small>{user?.token ? 'Leave blank to keep your current password' : 'Choose a password (8+ characters)'}</small><input type="password" required={!user?.token} value={password} onChange={(event) => setPassword(event.target.value)} placeholder={user?.token ? 'Optional password change' : 'Your account password'} minLength="8" /></label>
          <label>Delivery address<textarea required minLength="10" rows="3" value={address} onChange={(event) => setAddress(event.target.value)} placeholder="House, street, neighborhood, city and six-digit postal code" /></label>
          <div className="gps-location-control">
            <button className="button-outline" type="button" onClick={onLocate}><LocateFixed size={15} /> Use this device’s GPS</button>
            {deliveryLocation ? <span>GPS pin saved · accuracy ±{Math.round(deliveryLocation.accuracy || 0)} m</span> : <span>GPS is optional; your written street address is still required.</span>}
          </div>
          {deliveryLocation && <div className="address-lookup-control"><button className="button-outline" type="button" onClick={lookupAddress}>Look up address from GPS</button><small>Only when you click: coordinates are sent to OpenStreetMap/Nominatim. Review and edit the result before saving.</small></div>}
          {deliveryLocation && <LocationPreview location={deliveryLocation} label="Saved delivery location" />}
          <div className="profile-form-footer">
            <span><BadgeCheck size={14} /> Your details are kept safe</span>
            <button className="button-primary" disabled={busy}>{busy ? 'Saving…' : user?.token ? 'Save my details' : 'Create account / sign in'} <ArrowRight size={15} /></button>
          </div>
        </form>
      </div>
      <Footer />
    </section>
  );
}

function SubscriptionEditorModal({ subscription, onClose, onSave }) {
  const [productId, setProductId] = useState(subscription?.productId || 'turmeric');
  const [quantity, setQuantity] = useState(subscription?.quantity || 1);
  const [interval, setInterval] = useState(subscription?.interval || 'monthly');
  const [intervalDays, setIntervalDays] = useState(subscription?.intervalDays || 14);
  const [saving, setSaving] = useState(false);
  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    await onSave({ productId, quantity: Number(quantity), interval, intervalDays: Number(intervalDays) });
    setSaving(false);
  };
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form className="checkout-modal subscription-editor-modal" role="dialog" aria-modal="true" aria-labelledby="subscription-editor-title" onSubmit={submit} onClick={(event) => event.stopPropagation()}>
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close"><X size={18} /></button>
        <SectionEyebrow>A LITTLE RITUAL, YOUR WAY</SectionEyebrow>
        <h2 id="subscription-editor-title">{subscription?._id ? 'Change your ' : 'Start a new '}<em>favorite.</em></h2>
        <p>Freshly milled, right when you need a little more.</p>
        <label className="subscription-field">YOUR SPICE
          <select value={productId} onChange={(event) => setProductId(event.target.value)}>
            {products.map((product) => <option value={product.id} key={product.id}>{product.name}</option>)}
            <option value="custom-blend">My custom blend</option>
          </select>
        </label>
        <label className="subscription-field">HOW OFTEN?
          <select value={interval} onChange={(event) => setInterval(event.target.value)}>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="custom">Custom interval</option>
          </select>
        </label>
        {interval === 'custom' && <label className="subscription-field">DELIVERY EVERY (DAYS)<input type="number" min="1" max="365" value={intervalDays} onChange={(event) => setIntervalDays(event.target.value)} required /></label>}
        <label className="subscription-field">QUANTITY (PACKS)<input type="number" min="1" max="50" value={quantity} onChange={(event) => setQuantity(event.target.value)} required /></label>
        <div className="checkout-total"><span>Easy to pause, skip or change anytime</span><strong>{products.find((product) => product.id === productId)?.unit || 'Your recipe'}</strong></div>
        <button className="button-primary full-button" disabled={saving}>{saving ? 'Saving your ritual…' : 'Save my subscription'} <ArrowRight size={16} /></button>
        <span className="checkout-safe"><BadgeCheck size={14} /> No surprise charges. Skip any delivery.</span>
      </form>
    </div>
  );
}

function ShopDashboardPage({ user, notify }) {
  const [dashboard, setDashboard] = useState({ shops: [], orders: [], products: [], openOrders: 0 });
  const [shopId, setShopId] = useState('');
  const [shopName, setShopName] = useState('');
  const [shopAddress, setShopAddress] = useState('');
  const [servicePincodes, setServicePincodes] = useState('');
  const [shopLocation, setShopLocation] = useState(null);
  const [productForm, setProductForm] = useState({ name: '', price: '', unit: '100 g', origin: '', inventory: 0 });
  const [busy, setBusy] = useState(false);
  const loadDashboard = async () => {
    const data = await apiRequest('/api/owner/dashboard', user?.token);
    setDashboard(data);
    const activeShop = data.shops.find((shop) => shop._id === shopId) || data.shops[0];
    setShopId(activeShop?._id || '');
    if (activeShop) {
      setShopName(activeShop.name);
      setShopAddress(activeShop.address);
      setServicePincodes(activeShop.servicePincodes?.join(', ') || '');
      setShopLocation(activeShop.location || null);
    }
  };
  useEffect(() => {
    if (!user?.token) return;
    loadDashboard().catch((error) => notify(error.message));
  }, [user?.token]);
  const submitShop = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      const shopChanges = {
        name: shopName,
        address: shopAddress,
        servicePincodes: servicePincodes.split(/[,\s]+/).filter(Boolean),
        ...(shopLocation ? { location: shopLocation } : shopId ? { location: null } : {}),
      };
      if (shopId) {
        await apiRequest(`/api/shops/${shopId}`, user.token, { method: 'PATCH', body: JSON.stringify(shopChanges) });
        notify('Your mill profile and delivery coverage have been updated');
      } else {
        const data = await apiRequest('/api/shops', user.token, { method: 'POST', body: JSON.stringify(shopChanges) });
        setShopId(data.shop._id);
        notify('Shop submitted for review. Add a map pin before admin approval.');
      }
      await loadDashboard();
    } catch (error) { notify(error.message); }
    finally { setBusy(false); }
  };
  const submitProduct = async (event) => {
    event.preventDefault();
    if (!shopId) return notify('Create or select your shop first');
    setBusy(true);
    try {
      await apiRequest('/api/products', user.token, { method: 'POST', body: JSON.stringify({ ...productForm, price: Number(productForm.price), inventory: Number(productForm.inventory), shopId }) });
      setProductForm({ name: '', price: '', unit: '100 g', origin: '', inventory: 0 });
      await loadDashboard();
      notify('Fresh stock added to your spice shelf');
    } catch (error) { notify(error.message); }
    finally { setBusy(false); }
  };
  const updateOrder = async (event, order) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      await apiRequest(`/api/orders/${order._id}/status`, user.token, { method: 'PATCH', body: JSON.stringify({ status: form.get('status'), batchId: form.get('batchId'), shelfLife: form.get('shelfLife'), storageInstructions: form.get('storageInstructions'), millingDate: form.get('millingDate') || undefined }) });
      await loadDashboard();
      notify('Order journey updated for your customer');
    } catch (error) { notify(error.message); }
  };
  const updateInventory = async (event, product) => {
    event.preventDefault();
    const inventory = Number(new FormData(event.currentTarget).get('inventory'));
    try {
      await apiRequest(`/api/products/${product.slug}`, user.token, { method: 'PATCH', body: JSON.stringify({ inventory }) });
      await loadDashboard();
      notify('Inventory count updated');
    } catch (error) { notify(error.message); }
  };
  const uploadCertification = async (event) => {
    event.preventDefault();
    if (!shopId) return notify('Create your shop profile before adding certifications');
    const form = new FormData(event.currentTarget);
    try {
      await apiRequest(`/api/shops/${shopId}/certifications`, user.token, { method: 'POST', body: form });
      event.currentTarget.reset();
      await loadDashboard();
      notify('Certification uploaded for admin verification');
    } catch (error) { notify(error.message); }
  };
  const selectedShop = dashboard.shops.find((shop) => shop._id === shopId);
  const shopReadiness = getShopReadiness(shopAddress, servicePincodes, shopLocation);
  return (
    <section className="inner-page dashboard-page">
      <div className="inner-page-header"><SectionEyebrow>THE MILLER’S LITTLE CORNER</SectionEyebrow><div className="title-and-side"><h1>Your mill, <em>in motion.</em></h1><p>One home for today's orders, your spice shelf and the people who love it.</p></div></div>
      <div className="dashboard-metrics"><div><span>YOUR NEIGHBORHOOD SHOPS</span><strong>{dashboard.shops.length}</strong></div><div><span>ORDERS NEEDING YOU</span><strong>{dashboard.openOrders}</strong></div><div><span>SPICES ON THE SHELF</span><strong>{dashboard.products.length}</strong></div></div>
      {dashboard.shops.length > 1 && <label className="dashboard-shop-select">MANAGE A DIFFERENT MILL<select value={shopId} onChange={(event) => { setShopId(event.target.value); const shop = dashboard.shops.find((entry) => entry._id === event.target.value); if (shop) { setShopName(shop.name); setShopAddress(shop.address); setServicePincodes(shop.servicePincodes?.join(', ') || ''); setShopLocation(shop.location || null); } }}>{dashboard.shops.map((shop) => <option value={shop._id} key={shop._id}>{shop.name}</option>)}</select></label>}
      <div className="dashboard-columns">
        <section className="dashboard-panel">
          <div className="dashboard-panel-heading"><div><span>YOUR PLACE IN THE NEIGHBORHOOD</span><h2>{selectedShop ? 'A little mill, a big heart.' : 'Meet the neighborhood.'}</h2></div>{selectedShop && <span className={`approval-status ${selectedShop.approved ? 'approved' : ''}`}>{selectedShop.approved ? 'APPROVED' : 'PENDING REVIEW'}</span>}</div>
          <form className="dashboard-form" onSubmit={submitShop}><label>Mill name<input required minLength="2" value={shopName} onChange={(event) => setShopName(event.target.value)} placeholder="Your shop’s name" /></label><label>Full shop address in Tamil Nadu<textarea required minLength="8" rows="3" value={shopAddress} onChange={(event) => { setShopAddress(event.target.value); setShopLocation(null); }} placeholder="Door number, street, area, Chennai, Tamil Nadu, PIN code" /></label><ShopAddressLookupControl address={shopAddress} location={shopLocation} onLocation={setShopLocation} onAddress={setShopAddress} notify={notify} /><label>Delivery postal codes<input required value={servicePincodes} onChange={(event) => setServicePincodes(event.target.value)} placeholder="Verified PIN codes, e.g. 600001, 600002" /></label><small>Submit the written shop details for review now. A map pin is required before the shop can be approved to accept orders.</small><ShopReadinessChecklist readiness={shopReadiness} /><button className="button-primary" disabled={busy}>{busy ? 'Saving…' : selectedShop ? 'Save shop and service area' : 'Submit shop for review'} <ArrowRight size={14} /></button></form>
          {selectedShop && <form className="certification-form" onSubmit={uploadCertification}><span>SHOW YOUR CERTIFICATIONS</span><div><input name="name" required placeholder="Certificate name" /><input name="document" type="file" accept=".pdf,.jpg,.jpeg,.png" required /><button className="button-outline">Upload for review <ArrowUpRight size={14} /></button></div></form>}
          <form className="dashboard-form product-admin-form" onSubmit={submitProduct}><span>ADD A FRESH-BATCH PRODUCT</span><div className="dashboard-form-grid"><label>Product name<input required value={productForm.name} onChange={(event) => setProductForm({ ...productForm, name: event.target.value })} /></label><label>Price (₹)<input type="number" min="1" required value={productForm.price} onChange={(event) => setProductForm({ ...productForm, price: event.target.value })} /></label><label>Pack size<input required value={productForm.unit} onChange={(event) => setProductForm({ ...productForm, unit: event.target.value })} /></label><label>Growing origin<input required value={productForm.origin} onChange={(event) => setProductForm({ ...productForm, origin: event.target.value })} /></label><label>Starting inventory<input type="number" min="0" value={productForm.inventory} onChange={(event) => setProductForm({ ...productForm, inventory: event.target.value })} /></label></div><button className="button-dark" disabled={busy}>Add to my spice shelf <Plus size={14} /></button></form>
        </section>
        <section className="dashboard-panel dashboard-inventory"><div className="dashboard-panel-heading"><div><span>FRESH FROM YOUR MILL</span><h2>Your spice shelf.</h2></div></div>{dashboard.products.length ? dashboard.products.map((product) => <form className="inventory-row" onSubmit={(event) => updateInventory(event, product)} key={product._id}><span><strong>{product.name}</strong><small>{product.origin} · {formatPrice(product.price)} / {product.unit}</small></span><input name="inventory" aria-label={`${product.name} inventory`} type="number" min="0" defaultValue={product.inventory} /><button className="button-outline">Update</button></form>) : <p className="dashboard-empty">Add your first mill-fresh product to get started.</p>}</section>
      </div>
      <section className="dashboard-panel dashboard-orders"><div className="dashboard-panel-heading"><div><span>THE ORDERS ON YOUR BENCH</span><h2>Every little journey.</h2></div><span>{dashboard.orders.length} RECENT</span></div>{dashboard.orders.length ? dashboard.orders.map((order) => <form className="owner-order-row" key={order._id} onSubmit={(event) => updateOrder(event, order)}><div className="owner-order-title"><strong>#{String(order._id).slice(-6)} · {order.items.map((item) => item.name).join(', ')}</strong><small>{order.items.some((item) => item.customization) ? `Custom recipe: ${JSON.stringify(order.items.find((item) => item.customization)?.customization.weights || {})}` : `Customer · ${order.deliveryAddress}`}</small>{order.deliveryLocation && <small>GPS pin saved · accuracy ±{Math.round(order.deliveryLocation.accuracy || 0)} m · location is separate from the written address</small>}</div><select name="status" defaultValue={order.status}>{orderStatusChoices(order.status).map((status) => <option key={status}>{status}</option>)}</select><input name="batchId" defaultValue={order.batchId || ''} placeholder="Batch ID" /><input name="millingDate" type="date" defaultValue={order.millingDate ? new Date(order.millingDate).toISOString().slice(0, 10) : ''} aria-label="Milling date" /><input name="shelfLife" defaultValue={order.shelfLife || ''} placeholder="Shelf life" /><input name="storageInstructions" defaultValue={order.storageInstructions || ''} placeholder="Storage instructions" /><button className="button-primary">Update journey <ArrowRight size={14} /></button></form>) : <p className="dashboard-empty">Your accepted orders and their custom recipes will appear here.</p>}</section>
      <Footer />
    </section>
  );
}

function AdminShopEditor({ shop, user, notify, onSaved }) {
  const [name, setName] = useState(shop?.name || '');
  const [address, setAddress] = useState(shop?.address || '');
  const [pincodes, setPincodes] = useState(shop?.servicePincodes?.join(', ') || '');
  const [location, setLocation] = useState(shop?.location || null);
  const [saving, setSaving] = useState(false);
  const readiness = getShopReadiness(address, pincodes, location);
  const saveShop = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        address: address.trim(),
        servicePincodes: pincodes.split(/[,\s]+/).filter(Boolean),
        ...(location ? { location } : shop ? { location: null } : {}),
      };
      await apiRequest(shop ? `/api/shops/${shop._id}` : '/api/shops', user.token, {
        method: shop ? 'PATCH' : 'POST',
        body: JSON.stringify(payload),
      });
      notify(shop ? 'Tamil Nadu shop details saved.' : 'Shop added for administrator review.');
      await onSaved();
    } catch (error) {
      notify(error.message);
    } finally {
      setSaving(false);
    }
  };
  return <form className="tn-shop-editor" onSubmit={saveShop}>
    <div className="tn-shop-editor-fields">
      <label>Shop name<input required minLength="2" value={name} onChange={(event) => setName(event.target.value)} placeholder="Shop or mill name" /></label>
      <label className="tn-shop-address-field">Full shop address<textarea required minLength="8" rows="3" value={address} onChange={(event) => { setAddress(event.target.value); setLocation(null); }} placeholder="Door number, street, area, Chennai, Tamil Nadu, PIN code" /></label>
      <ShopAddressLookupControl address={address} location={location} onAddress={setAddress} onLocation={setLocation} notify={notify} />
      <label className="tn-shop-pincode-field">Delivery PIN codes<input required value={pincodes} onChange={(event) => setPincodes(event.target.value)} placeholder="Verified PIN codes, e.g. 600001, 600002" /></label>
    </div>
    <div className="tn-shop-editor-status">{shop && <span className={`approval-status ${shop.approved ? 'approved' : ''}`}>{shop.approved ? 'APPROVED' : 'PENDING REVIEW'}</span>}<span>{location ? 'Map pin ready. Confirm the address and service PIN codes with the shop.' : 'You can submit these details for review now. A verified map pin is required before approval.'}</span></div>
    <ShopReadinessChecklist readiness={readiness} />
    <button className="button-primary" disabled={saving}>{saving ? 'Saving shop…' : shop ? 'Save shop details' : 'Add Tamil Nadu shop for review'} <ArrowRight size={14} /></button>
  </form>;
}

function ShopReadinessChecklist({ readiness }) {
  const items = [
    ['Full street address', readiness.address],
    ['Valid six-digit service PIN code(s)', readiness.servicePincodes],
    ['Map pin from address lookup', readiness.mapPin],
  ];
  return <div className="shop-readiness-wrap"><ul className="shop-readiness-list" aria-label="Shop review readiness">{items.map(([label, complete]) => <li className={complete ? 'readiness-complete' : ''} key={label}><span>{complete ? <Check size={13} /> : <Clock3 size={13} />}</span>{label}<strong>{complete ? 'Ready' : 'Needed'}</strong></li>)}</ul><small>“Ready” means the required field is present. An administrator must still confirm the real shop address and service area before approval.</small></div>;
}

function AdminInventoryRow({ product, onSave }) {
  const [inventory, setInventory] = useState(String(product.inventory ?? 0));
  const [saving, setSaving] = useState(false);
  useEffect(() => setInventory(String(product.inventory ?? 0)), [product.inventory]);
  const submit = async (event) => {
    event.preventDefault();
    const value = Number(inventory);
    if (!Number.isInteger(value) || value < 0) return;
    setSaving(true);
    try {
      await onSave(product, value);
    } finally {
      setSaving(false);
    }
  };
  return <form className="admin-product-row" onSubmit={submit}>
    <img src={product.image || image('photo-1596040033229-a9821ebd058d', 240)} alt={product.name} loading="lazy" onError={(event) => { if (event.currentTarget.dataset.fallbackApplied) return; event.currentTarget.dataset.fallbackApplied = 'true'; event.currentTarget.src = image('photo-1596040033229-a9821ebd058d', 240); }} />
    <div className="admin-product-info"><strong>{product.name}</strong><span>{product.origin} · {formatPrice(product.price)} / {product.unit}</span><small className={product.inventory <= 5 ? 'stock-warning' : ''}>{product.inventory <= 0 ? 'Out of stock' : product.inventory <= 5 ? `Low stock · ${product.inventory} left` : product.active ? 'Available in catalog' : 'Hidden from catalog'}</small></div>
    <label className="admin-product-stock">Stock<input type="number" min="0" step="1" value={inventory} onChange={(event) => setInventory(event.target.value)} aria-label={`${product.name} stock`} /></label>
    <button className="button-outline" disabled={saving}>{saving ? 'Saving…' : 'Save stock'}</button>
  </form>;
}

function AdminDashboardPage({ user, notify }) {
  const [dashboard, setDashboard] = useState(null);
  const [shopsList, setShopsList] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [orderStatusErrors, setOrderStatusErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const refresh = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const results = await Promise.all([
        apiRequest('/api/admin/overview', user?.token),
        apiRequest('/api/admin/shops', user?.token),
        apiRequest('/api/admin/customers?page=1', user?.token),
        apiRequest('/api/orders', user?.token),
        apiRequest('/api/products?limit=50', user?.token),
      ]);
      setDashboard(results[0]);
      setShopsList(results[1].shops);
      setCustomers(results[2].customers);
      setOrders(results[3].orders);
      setProductsList(results[4].items);
    } catch (error) {
      setLoadError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (!user?.token) return;
    refresh().catch((error) => notify(error.message));
  }, [user?.token]);
  const approveShop = async (shop, approved) => {
    try {
      await apiRequest(`/api/admin/shops/${shop._id}/approval`, user.token, { method: 'PATCH', body: JSON.stringify({ approved }) });
      await refresh();
      notify(approved ? 'Neighborhood maker approved' : 'Shop approval updated');
    } catch (error) { notify(error.message); }
  };
  const verifyCertification = async (shop, certification, verified) => {
    try {
      await apiRequest(`/api/admin/shops/${shop._id}/certifications/${certification._id}`, user.token, { method: 'PATCH', body: JSON.stringify({ verified }) });
      await refresh();
      notify('Certification review saved');
    } catch (error) { notify(error.message); }
  };
  const updateOrder = async (order, status) => {
    setOrderStatusErrors((errors) => {
      const next = { ...errors };
      delete next[order._id];
      return next;
    });
    try {
      await apiRequest(`/api/orders/${order._id}/status`, user.token, { method: 'PATCH', body: JSON.stringify({ status }) });
      await refresh();
      notify('Marketplace order updated');
    } catch (error) {
      setOrderStatusErrors((errors) => ({ ...errors, [order._id]: error.message }));
      notify(error.message);
    }
  };
  const updateInventory = async (product, inventory) => {
    try {
      await apiRequest(`/api/products/${product.slug}`, user.token, { method: 'PATCH', body: JSON.stringify({ inventory: Number(inventory) }) });
      await refresh();
      notify(`${product.name} inventory updated`);
    } catch (error) { notify(error.message); }
  };
  return (
    <section className="inner-page dashboard-page">
      <div className="inner-page-header"><SectionEyebrow>CHENNAI · TAMIL NADU MARKETPLACE</SectionEyebrow><div className="title-and-side"><h1>Local makers, <em>well managed.</em></h1><p>Manage Chennai and Tamil Nadu shops, service PIN codes, orders and catalog updates in one place.</p></div></div>
      {loadError && <div className="dashboard-error" role="alert"><span>{loadError}</span><button className="button-outline" onClick={() => refresh().catch(() => {})}>Retry</button></div>}
      {loading && !dashboard && <p className="dashboard-empty">Loading admin data…</p>}
      <div className="dashboard-metrics">{[['CUSTOMERS', dashboard?.customers], ['APPROVED TAMIL NADU SHOPS', dashboard?.shops], ['ORDERS PLACED', dashboard?.orders], ['ACTIVE RITUALS', dashboard?.activeSubscriptions], ['ORDER VALUE', dashboard ? formatPrice(dashboard.orderValue) : '—']].map(([label, value]) => <div key={label}><span>{label}</span><strong>{value ?? '—'}</strong></div>)}</div>
      <section className="dashboard-panel tn-admin-service-panel"><div className="dashboard-panel-heading"><div><span>CHENNAI & TAMIL NADU SERVICE AREAS</span><h2>Add a local shop by its street address.</h2></div><span>LIVE SHOPS REQUIRE VERIFIED DETAILS</span></div><p className="tn-admin-intro">For live shops, enter a real street address and verified service PIN codes, then add its map pin and approve it. Demo shops are clearly labeled, use fictional addresses and sample PIN codes, and are available only in local/test mode.</p><AdminShopEditor key="new-shop" shop={null} user={user} notify={notify} onSaved={refresh} /></section>
      <section className="dashboard-panel tn-admin-shops-panel">
        <div className="dashboard-panel-heading"><div><span>MEET THE MAKERS</span><h2>Shop addresses and approvals.</h2></div><span>{shopsList.filter((shop) => !shop.approved).length} TO REVIEW</span></div>
        {shopsList.length ? shopsList.map((shop) => {
          const readiness = getShopReadiness(shop.address, shop.servicePincodes?.join(', '), shop.location);
          const canApprove = Object.values(readiness).every(Boolean);
          return <article className="tn-admin-shop-card" key={shop._id}>
            <div className="tn-admin-shop-card-heading">
              <div><h3>{shop.name} {shop.isDemo && <span className="demo-shop-badge">DEMO · TEST ONLY</span>}</h3><address>{shop.address}</address></div>
              <div className="tn-shop-approval-action">
                <button className="button-outline" disabled={!shop.approved && !canApprove} title={!shop.approved && !canApprove ? 'Complete the address, PIN code, and map pin checklist before approval.' : undefined} onClick={() => approveShop(shop, !shop.approved)}>{shop.approved ? 'Pause shop' : canApprove ? 'Approve shop' : 'Complete checklist to approve'}</button>
              </div>
            </div>
            <AdminShopEditor shop={shop} user={user} notify={notify} onSaved={refresh} />
            {shop.certifications?.length > 0 && <div className="tn-certifications">{shop.certifications.map((certification) => <span className="admin-cert-row" key={certification._id}>{certification.name} · {certification.verified ? 'Verified' : 'Needs review'}{certification.documentUrl && <a href={certification.documentUrl} target="_blank" rel="noreferrer">View file</a>}{!certification.verified && <button onClick={() => verifyCertification(shop, certification, true)}>Verify</button>}</span>)}</div>}
          </article>;
        }) : <p className="dashboard-empty">No shops are registered yet. Add a Chennai or Tamil Nadu shop above.</p>}
      </section>
      <div className="dashboard-columns">
        <section className="dashboard-panel"><div className="dashboard-panel-heading"><div><span>THE HOME COOKS</span><h2>Recent customers.</h2></div></div>{customers.map((customer) => <div className="admin-simple-row" key={customer._id}><span><strong>{customer.name}</strong><small>{customer.email}</small></span><span>{new Date(customer.createdAt).toLocaleDateString('en-IN')}</span></div>)}</section>
        <section className="dashboard-panel dashboard-catalog-panel"><div className="dashboard-panel-heading"><div><span>FRESH FROM THE MILLS</span><h2>Catalog & inventory.</h2></div><span>{productsList.length} PRODUCTS</span></div><p className="dashboard-catalog-intro">Product photos, origins, prices and current stock.</p>{productsList.length ? <div className="admin-catalog-list">{productsList.map((product) => <AdminInventoryRow key={product._id} product={product} onSave={updateInventory} />)}</div> : <p className="dashboard-empty">No catalog products are available.</p>}</section>
      </div>
      <section className="dashboard-panel dashboard-orders"><div className="dashboard-panel-heading"><div><span>THE WHOLE MARKETPLACE</span><h2>Orders & delivery.</h2></div></div>{orders.length ? orders.map((order) => {
        const latestUpdate = order.statusHistory?.[order.statusHistory.length - 1];
        return <div className="admin-order-group" key={order._id}>
          <div className="admin-simple-row admin-order-row"><span><strong>#{String(order._id).slice(-6)} · {order.items.map((item) => item.name).join(', ')}</strong><small>{order.paymentMethod === 'cod' ? 'Cash on delivery' : 'Razorpay'} · {order.paymentStatus} · {formatPrice(order.total)}</small><small>{latestUpdate?.at ? `Status updated ${new Date(latestUpdate.at).toLocaleString('en-IN')}` : 'No status history recorded yet'}</small><address className="admin-order-address">{order.deliveryAddress}</address>{order.shopId?.name && <small>Assigned shop: {order.shopId.name}{order.shopId.isDemo ? ' · DEMO TEST ONLY' : ''}</small>}{order.courierName && <small>Courier: {order.courierName} · {order.courierPhone}</small>}{order.deliveryLocation && <small>Optional GPS pin saved · accuracy ±{Math.round(order.deliveryLocation.accuracy || 0)} m</small>}{orderStatusErrors[order._id] && <small className="admin-order-status-error" role="alert">{orderStatusErrors[order._id]}</small>}</span><select aria-label={`Order ${order._id} status`} value={order.status} onChange={(event) => updateOrder(order, event.target.value)}>{orderStatusChoices(order.status).map((status) => <option key={status}>{status}</option>)}</select></div>
          <AdminOrderAssignment order={order} shops={shopsList} user={user} notify={notify} onSaved={refresh} />
        </div>;
      }) : <p className="dashboard-empty">No orders to review yet.</p>}</section>
      <Footer />
    </section>
  );
}

function AdminOrderAssignment({ order, shops, user, notify, onSaved }) {
  const [shopId, setShopId] = useState(String(order.shopId?._id || order.shopId || ''));
  const [courierName, setCourierName] = useState(order.courierName || '');
  const [courierPhone, setCourierPhone] = useState(order.courierPhone || '');
  const [courierIsDemo, setCourierIsDemo] = useState(order.courierIsDemo === true);
  const [saving, setSaving] = useState(false);
  const courierAssignable = ['Ready', 'Delivery assigned', 'Out for delivery'].includes(order.status);

  useEffect(() => {
    setShopId(String(order.shopId?._id || order.shopId || ''));
    setCourierName(order.courierName || '');
    setCourierPhone(order.courierPhone || '');
    setCourierIsDemo(order.courierIsDemo === true);
  }, [order.shopId, order.courierName, order.courierPhone, order.courierIsDemo]);

  const selectCourier = (event) => {
    const demoSelected = event.target.value === 'demo';
    setCourierIsDemo(demoSelected);
    if (demoSelected) {
      setCourierName('Demo Courier Arjun (TEST ONLY)');
      setCourierPhone('9000000001');
    } else if (courierIsDemo) {
      setCourierName('');
      setCourierPhone('');
    }
  };

  const saveAssignment = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await apiRequest(`/api/admin/orders/${order._id}/assignment`, user.token, {
        method: 'PATCH',
        body: JSON.stringify({ shopId: shopId || null, courierName, courierPhone, courierIsDemo }),
      });
      await onSaved();
      notify('Order assignment saved');
    } catch (error) {
      notify(error.message);
    } finally {
      setSaving(false);
    }
  };

  return <form className="admin-order-assignment" onSubmit={saveAssignment}>
    <label>ASSIGN SHOP
      <select value={shopId} onChange={(event) => setShopId(event.target.value)}>
        <option value="">Unassigned</option>
        {shops.filter((shop) => shop.approved).map((shop) => <option value={shop._id} key={shop._id}>{shop.name}{shop.isDemo ? ' · DEMO TEST ONLY' : ''}</option>)}
      </select>
    </label>
    <label>COURIER
      <select value={courierIsDemo ? 'demo' : 'manual'} onChange={selectCourier} disabled={!courierAssignable || !import.meta.env.DEV}>
        <option value="manual">Enter real courier details</option>
        {import.meta.env.DEV && <option value="demo">Demo Courier Arjun · TEST ONLY</option>}
      </select>
      <input aria-label="Courier name" value={courierName} onChange={(event) => { setCourierIsDemo(false); setCourierName(event.target.value); }} disabled={!courierAssignable || courierIsDemo} maxLength="100" placeholder={courierAssignable ? 'Courier full name' : 'Available when order is Ready'} />
      {courierIsDemo && <small className="demo-courier-note">Fictional test courier and phone number; not for contacting a real driver.</small>}
    </label>
    <label>COURIER PHONE
      <input value={courierPhone} onChange={(event) => { setCourierIsDemo(false); setCourierPhone(event.target.value); }} disabled={!courierAssignable || courierIsDemo} maxLength="20" inputMode="tel" placeholder="Courier contact number" />
    </label>
    <button className="button-outline" disabled={saving}>{saving ? 'Saving…' : 'Save assignment'}</button>
  </form>;
}

function CheckoutModal({ method, setMethod, busy, total, address, setAddress, deliveryLocation, onLocate, onReverseAddress, onClose, onSubmit }) {
  const language = useLanguage();
  const lookupAddress = async () => {
    const resolved = await onReverseAddress();
    if (resolved) setAddress(resolved);
  };
  return <div className="modal-backdrop" onClick={onClose}>
    <section className="checkout-modal" role="dialog" aria-modal="true" aria-labelledby="checkout-title" onClick={(event) => event.stopPropagation()}>
      <button className="modal-close" onClick={onClose} aria-label="Close"><X size={18} /></button>
      <SectionEyebrow>{language === 'ta' ? 'இறுதி விவரம்' : 'ONE LAST LITTLE THING'}</SectionEyebrow>
      <h2 id="checkout-title">{language === 'ta' ? <>உங்கள் <em>விருப்பப்படி.</em></> : <>Make it <em>yours.</em></>}</h2>
      <p>Enter a complete delivery address. The admin team will assign a shop for your area.</p>
      <label className="checkout-address"><MapPin size={17} /><span>{translate('DELIVERING TO', language)}<textarea aria-label="Delivery address" required minLength="10" maxLength="500" rows="3" value={address} onChange={(event) => setAddress(event.target.value)} placeholder="House, street, area, city, state and postal code (if available)" /></span></label>
      <div className="gps-location-control checkout-gps"><button className="button-outline" type="button" onClick={onLocate}><LocateFixed size={15} /> {deliveryLocation ? 'Refresh GPS pin' : 'Use this device’s GPS'}</button>{deliveryLocation ? <span>Pin saved · ±{Math.round(deliveryLocation.accuracy || 0)} m</span> : <span>Optional location pin; it does not replace the street address.</span>}</div>
      {deliveryLocation && <><button className="button-outline address-lookup-button" type="button" onClick={lookupAddress}>Look up address from GPS</button><small className="address-lookup-disclosure">Only when you click: coordinates are sent to OpenStreetMap/Nominatim. Review and edit the result before ordering.</small><LocationPreview location={deliveryLocation} label="Delivery GPS pin" /></>}
      <div className="checkout-coverage" role="status">Any complete delivery address is accepted. A shop is assigned by admin after the order is placed.</div>
      <span className="payment-label">{translate('HOW WOULD YOU LIKE TO PAY?', language)}</span>
      <div className="payment-options"><button type="button" className={method === 'cod' ? 'payment-selected' : ''} onClick={() => setMethod('cod')}><span className="payment-radio" /><span><strong>{translate('Cash on delivery', language)}</strong><small>Pay when your spices arrive</small></span><span className="cod-symbol">₹</span></button><button type="button" className={method === 'razorpay' ? 'payment-selected' : ''} onClick={() => setMethod('razorpay')}><span className="payment-radio" /><span><strong>{translate('Pay online securely', language)}</strong><small>UPI · Card · Net banking</small></span><span className="razorpay-mark">Razorpay</span></button></div>
      <div className="checkout-total"><span>All in, just</span><strong>{formatPrice(total + (total >= 499 ? 0 : 40))}</strong></div>
      <button className="button-primary full-button" disabled={busy || address.trim().length < 10} onClick={onSubmit}>{busy ? (language === 'ta' ? 'செயலாக்கப்படுகிறது…' : 'Processing…') : method === 'cod' ? translate('Place my order', language) : translate('Continue to secure payment', language)} <ArrowRight size={16} /></button>
      <span className="checkout-safe"><BadgeCheck size={14} /> Your payment details are always protected.</span>
    </section>
  </div>;
}

function Footer({ onNavigate = () => {} }) {
  return <footer className="footer"><div className="footer-brand"><span className="brand-mark"><span /><span /><span /></span><span>For the love<br />of the little things.</span></div><div className="footer-links"><button onClick={() => onNavigate('spices')}>The spice shelf</button><button onClick={() => onNavigate('shops')}>Our neighborhood mills</button><button onClick={() => onNavigate('blend')}>Make a little blend</button></div><div className="footer-end"><span>GROWN CLOSE. GROUND FRESH. DELIVERED WITH LOVE.</span><span>India · 2026</span></div></footer>;
}

export default App;
