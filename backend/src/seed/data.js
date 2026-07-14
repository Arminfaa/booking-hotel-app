export const seedUsers = [
  {
    name: "Armin Host",
    email: "host@cove.dev",
    password: "password123",
    role: "host",
    avatar: "https://i.pravatar.cc/150?img=12",
  },
  {
    name: "Demo Guest",
    email: "guest@cove.dev",
    password: "password123",
    role: "guest",
    avatar: "https://i.pravatar.cc/150?img=32",
  },
  {
    name: "Cove Admin",
    email: "admin@cove.dev",
    password: "password123",
    role: "admin",
    avatar: "https://i.pravatar.cc/150?img=5",
  },
];

const IMAGE_POOL = [
  [
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80",
    "https://images.unsplash.com/photo-1560448204-e02f11c3be61?w=1200&q=80",
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80",
  ],
  [
    "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=80",
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80",
  ],
  [
    "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=1200&q=80",
    "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=1200&q=80",
    "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=1200&q=80",
  ],
  [
    "https://images.unsplash.com/photo-1501183638710-841dd1904471?w=1200&q=80",
    "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&q=80",
    "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=1200&q=80",
  ],
  [
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80",
    "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200&q=80",
    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&q=80",
  ],
  [
    "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&q=80",
    "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=1200&q=80",
    "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=1200&q=80",
  ],
  [
    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&q=80",
    "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1200&q=80",
    "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200&q=80",
  ],
  [
    "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=1200&q=80",
    "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&q=80",
    "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=1200&q=80",
  ],
];

const PROPERTY_TYPES = ["apartment", "house", "villa", "cabin", "loft", "hotel"];

const AMENITY_SETS = [
  ["Wifi", "Kitchen", "Washer", "Heating"],
  ["Wifi", "Pool", "Kitchen", "Parking", "Air conditioning"],
  ["Wifi", "Fireplace", "Kitchen", "Mountain view", "Heating", "Parking"],
  ["Wifi", "Kitchen", "Elevator", "Washer", "Workspace"],
  ["Wifi", "Terrace", "Kitchen", "Air conditioning", "Washer"],
  ["Wifi", "Kitchenette", "Air conditioning", "Washer", "Near transit"],
  ["Wifi", "Ocean view", "Breakfast", "Air conditioning", "Parking", "Pool"],
  ["Wifi", "Kitchen", "Courtyard", "Washer", "Heating"],
];

const TITLE_PREFIXES = [
  "Sunlit",
  "Quiet",
  "Design",
  "Garden",
  "Rooftop",
  "Harbor",
  "Courtyard",
  "Skyline",
  "Boutique",
  "Classic",
  "Modern",
  "Hidden",
  "Bright",
  "Cozy",
  "Grand",
  "River",
];

const TITLE_SUFFIXES = [
  "Apartment",
  "Loft",
  "Villa",
  "House",
  "Suite",
  "Studio",
  "Retreat",
  "Flat",
  "Residence",
  "Stay",
];

/** Destinations — Iranian cities first so search filters show them easily. */
const DESTINATIONS = [
  // Iran (~28 listings across these cities)
  {
    city: "Tehran",
    country: "Iran",
    lng: 51.389,
    lat: 35.6892,
    addressBase: "Valiasr Ave",
    vibes: [
      "City-center stay near cafés and parks, with soft evening light over the skyline.",
      "Calm apartment above a leafy lane, minutes from galleries and bakeries.",
      "High-floor flat with mountain haze views and a kitchen made for late dinners.",
      "Bright stay steps from metro lines — easy base for exploring north Tehran.",
    ],
  },
  {
    city: "Isfahan",
    country: "Iran",
    lng: 51.6746,
    lat: 32.6539,
    addressBase: "Chahar Bagh",
    vibes: [
      "Tiles, courtyards, and morning walks toward Naqsh-e Jahan Square.",
      "Quiet house near the river with patterned textiles and slow afternoons.",
      "Sun-washed apartment close to historic bridges and evening bazaars.",
      "Courtyard loft where blue-domed mornings start with fresh bread.",
    ],
  },
  {
    city: "Shiraz",
    country: "Iran",
    lng: 52.5311,
    lat: 29.5918,
    addressBase: "Zand Blvd",
    vibes: [
      "Garden stay scented with orange blossom, near poetry gardens and old lanes.",
      "Warm apartment for long evenings after Persepolis day trips.",
      "Boutique flat with tiled floors and soft courtyard light.",
    ],
  },
  {
    city: "Tabriz",
    country: "Iran",
    lng: 46.2919,
    lat: 38.0962,
    addressBase: "Shahnaz St",
    vibes: [
      "Mountain-air apartment near the bazaar — carpets, tea, and clear winters.",
      "Solid brick house with heating and walks to historic neighborhoods.",
    ],
  },
  {
    city: "Mashhad",
    country: "Iran",
    lng: 59.6168,
    lat: 36.2605,
    addressBase: "Imam Reza Blvd",
    vibes: [
      "Comfortable stay close to the shrine district with easy transport links.",
      "Family apartment with a quiet kitchen and soft morning light.",
    ],
  },
  {
    city: "Yazd",
    country: "Iran",
    lng: 54.3675,
    lat: 31.8974,
    addressBase: "Fahadan",
    vibes: [
      "Adobe-walled hideaway in the old town — windcatchers and desert silence.",
      "Clay-courtyard stay with rooftop nights under a clear desert sky.",
    ],
  },
  {
    city: "Kish",
    country: "Iran",
    lng: 53.98,
    lat: 26.5578,
    addressBase: "Sadaf Beach Rd",
    vibes: [
      "Island suite with sea breeze evenings and short walks to the beach.",
      "Bright villa kitchen stocked for long island dinners after the sundown.",
    ],
  },
  {
    city: "Rasht",
    country: "Iran",
    lng: 49.5832,
    lat: 37.2808,
    addressBase: "Golsar",
    vibes: [
      "Green Caspian stay near markets — rain-soft mornings and hearty kitchens.",
    ],
  },
  {
    city: "Kerman",
    country: "Iran",
    lng: 57.0788,
    lat: 30.2832,
    addressBase: "Shariati St",
    vibes: [
      "Desert-edge apartment for Lut day trips and quiet bazaar evenings.",
    ],
  },
  // International destinations
  {
    city: "Amsterdam",
    country: "Netherlands",
    lng: 4.8735,
    lat: 52.3598,
    addressBase: "Overtoom",
    vibes: ["Canal loft with bike storage and soft morning light."],
  },
  {
    city: "Lisbon",
    country: "Portugal",
    lng: -9.4215,
    lat: 38.697,
    addressBase: "Cascais Coastal Road",
    vibes: ["Whitewashed villa with terraces and salt-air evenings."],
  },
  {
    city: "Interlaken",
    country: "Switzerland",
    lng: 7.8632,
    lat: 46.6863,
    addressBase: "Harderstrasse",
    vibes: ["Timber cabin above the valley with trailheads nearby."],
  },
  {
    city: "Paris",
    country: "France",
    lng: 2.3599,
    lat: 48.8606,
    addressBase: "Rue des Archives",
    vibes: ["Compact apartment with arched windows and café corners."],
  },
  {
    city: "Tokyo",
    country: "Japan",
    lng: 139.7006,
    lat: 35.6595,
    addressBase: "Shibuya",
    vibes: ["Minimalist studio near transit and a quiet public bath."],
  },
  {
    city: "Barcelona",
    country: "Spain",
    lng: 2.1589,
    lat: 41.3947,
    addressBase: "Carrer de Provença",
    vibes: ["Sun-drenched house with a rooftop terrace and tiled floors."],
  },
  {
    city: "Reykjavik",
    country: "Iceland",
    lng: -21.9278,
    lat: 64.145,
    addressBase: "Laugavegur",
    vibes: ["Warm Nordic loft for waterfall and coast day trips."],
  },
  {
    city: "Cape Town",
    country: "South Africa",
    lng: 18.3771,
    lat: -33.951,
    addressBase: "Victoria Road",
    vibes: ["Glass-front suite on the Atlantic seaboard."],
  },
  {
    city: "Toronto",
    country: "Canada",
    lng: -79.3817,
    lat: 43.6408,
    addressBase: "Queens Quay West",
    vibes: ["Harbor studio with skyline evenings and trail access."],
  },
  {
    city: "Istanbul",
    country: "Turkey",
    lng: 28.9744,
    lat: 41.0302,
    addressBase: "Asmalı Mescit",
    vibes: ["Courtyard apartment with patterned tiles and ferry horns."],
  },
  {
    city: "Dubai",
    country: "United Arab Emirates",
    lng: 55.2708,
    lat: 25.2048,
    addressBase: "Marina Walk",
    vibes: ["High-rise suite with marina glitter and pool decks."],
  },
  {
    city: "Rome",
    country: "Italy",
    lng: 12.4964,
    lat: 41.9028,
    addressBase: "Via del Corso",
    vibes: ["Stone-floored flat near piazzas and evening fountains."],
  },
  {
    city: "Berlin",
    country: "Germany",
    lng: 13.405,
    lat: 52.52,
    addressBase: "Prenzlauer Allee",
    vibes: ["Industrial loft with courtyard quiet and gallery walks."],
  },
  {
    city: "Bangkok",
    country: "Thailand",
    lng: 100.5018,
    lat: 13.7563,
    addressBase: "Sukhumvit Rd",
    vibes: ["Sky pool condo steps from markets and river boats."],
  },
  {
    city: "New York",
    country: "United States",
    lng: -73.9857,
    lat: 40.7484,
    addressBase: "W 34th St",
    vibes: ["Midtown loft with brick walls and skyline evenings."],
  },
  {
    city: "Seoul",
    country: "South Korea",
    lng: 126.978,
    lat: 37.5665,
    addressBase: "Gangnam-daero",
    vibes: ["Polished studio near nightlife and seamless transit."],
  },
  {
    city: "Marrakech",
    country: "Morocco",
    lng: -7.9811,
    lat: 31.6295,
    addressBase: "Derb Sidi el Mokhfi",
    vibes: ["Riads and rooftops — tea trays under a pink-hour sky."],
  },
  {
    city: "Bali",
    country: "Indonesia",
    lng: 115.1889,
    lat: -8.4095,
    addressBase: "Jl. Monkey Forest",
    vibes: ["Garden villa with rice-field hush and pool mornings."],
  },
  {
    city: "London",
    country: "United Kingdom",
    lng: -0.1276,
    lat: 51.5072,
    addressBase: "King's Cross Rd",
    vibes: ["Victorian flat near canals, museums, and late trains."],
  },
  {
    city: "Prague",
    country: "Czech Republic",
    lng: 14.4378,
    lat: 50.0755,
    addressBase: "Nerudova",
    vibes: ["Attic stay above cobbled lanes and morning spires."],
  },
  {
    city: "Athens",
    country: "Greece",
    lng: 23.7275,
    lat: 37.9838,
    addressBase: "Ermou St",
    vibes: ["Rooftop views of the Acropolis and olive-oil kitchens."],
  },
];

/** How many hotels per destination — sums to 80. */
const COUNTS = [
  6, 5, 4, 3, 3, 3, 2, 1, 1, // Iran: 28
  3, 3, 2, 3, 2, 3, 2, 2, 2, 3, // classic: 22
  2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, // more intl: 22 → total 72
];

// Pad remaining slots evenly across destinations to reach exactly 80
function buildSeedHotels(target = 80) {
  const hotels = [];
  let index = 0;

  for (let d = 0; d < DESTINATIONS.length; d += 1) {
    const dest = DESTINATIONS[d];
    const count = COUNTS[d] ?? 1;
    for (let n = 0; n < count; n += 1) {
      hotels.push(makeHotel(dest, index, n));
      index += 1;
    }
  }

  // Fill to target if COUNT sum drifts
  let fill = 0;
  while (hotels.length < target) {
    const dest = DESTINATIONS[fill % DESTINATIONS.length];
    hotels.push(makeHotel(dest, index, hotels.length));
    index += 1;
    fill += 1;
  }

  return hotels.slice(0, target);
}

function makeHotel(dest, globalIndex, localIndex) {
  const type = PROPERTY_TYPES[globalIndex % PROPERTY_TYPES.length];
  const prefix = TITLE_PREFIXES[globalIndex % TITLE_PREFIXES.length];
  const suffix = TITLE_SUFFIXES[(globalIndex + 3) % TITLE_SUFFIXES.length];
  const vibe = dest.vibes[localIndex % dest.vibes.length];
  const jitter = ((globalIndex % 17) - 8) * 0.008;

  const bedrooms = (globalIndex % 3) + 1;
  const bathrooms = Math.max(1, bedrooms - (globalIndex % 2));
  const beds = bedrooms + (globalIndex % 2);
  const maxGuests = Math.min(8, beds + 1 + (globalIndex % 2));
  const pricePerNight = 55 + ((globalIndex * 17) % 220);
  const cleaningFee = 15 + ((globalIndex * 7) % 50);

  return {
    title: `${prefix} ${suffix} in ${dest.city}`,
    description: `${vibe} A comfortable ${type} with honest amenities and clear pricing — ideal for ${maxGuests} guests.`,
    city: dest.city,
    country: dest.country,
    address: `${dest.addressBase} ${10 + (globalIndex % 90)}, ${dest.city}`,
    longitude: Number((dest.lng + jitter).toFixed(5)),
    latitude: Number((dest.lat + jitter * 0.7).toFixed(5)),
    images: IMAGE_POOL[globalIndex % IMAGE_POOL.length],
    pricePerNight,
    cleaningFee,
    maxGuests,
    bedrooms,
    beds,
    bathrooms,
    propertyType: type,
    amenities: AMENITY_SETS[globalIndex % AMENITY_SETS.length],
  };
}

export const seedHotels = buildSeedHotels(80);
