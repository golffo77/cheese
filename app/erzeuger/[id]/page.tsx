import { Fragment } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const sellerData: Record<string, {
  name: string;
  location: string;
  rating: string;
  years: string;
  products: string;
  avatar: string;
  image: string;
  isLive: boolean;
  viewers: number;
  description: string;
  cheeseItems: { name: string; price: string; weight: string; image: string }[];
  chatMessages: { user: string; avatar: string; text: string }[];
}> = {
  'alpenwiese': {
    name: 'Alpenwiese Sennerei',
    location: 'Allgäu, Bayern',
    rating: '4.9',
    years: '130',
    products: '24',
    avatar: 'https://images.unsplash.com/photo-1769954559240-6b7d58677b68?w=128&q=80',
    image: 'https://images.unsplash.com/photo-1659367057365-7e62f61c2d3b?w=1080&q=80',
    isLive: true,
    viewers: 143,
    description: 'Traditionelle Bergkäse-Herstellung nach altem Familienrezept seit 1892.',
    cheeseItems: [
      { name: 'Allgäuer Bergkäse', price: '€ 24,90 / kg', weight: 'ab 200g', image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&q=80' },
      { name: 'Emmentaler', price: '€ 19,50 / kg', weight: 'ab 200g', image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&q=80' },
      { name: 'Weichkäse Alpe', price: '€ 28,00 / kg', weight: 'ab 150g', image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&q=80' },
    ],
    chatMessages: [
      { user: 'Maria K.', avatar: 'M', text: 'Wie lange reift der Bergkäse?' },
      { user: 'Stefan W.', avatar: 'S', text: 'Gibt es heute noch Weichkäse?' },
      { user: 'Julia L.', avatar: 'J', text: 'Tolles Angebot, danke! 🧀' },
    ],
  },
  'ziegenhof-muehlbach': {
    name: 'Ziegenhof Mühlbach',
    location: 'Schwarzwald, BW',
    rating: '4.8',
    years: '25',
    products: '18',
    avatar: 'https://images.unsplash.com/photo-1739066112286-be4f0662ec9f?w=128&q=80',
    image: 'https://images.unsplash.com/photo-1739066112286-be4f0662ec9f?w=1080&q=80',
    isLive: false,
    viewers: 0,
    description: 'Bio-zertifizierte Ziegenkäserei mit eigenem Weidegang und saisonalem Angebot.',
    cheeseItems: [
      { name: 'Ziegenfrischkäse', price: '€ 18,90 / kg', weight: 'ab 150g', image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&q=80' },
      { name: 'Chèvre Natur', price: '€ 22,50 / kg', weight: 'ab 200g', image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&q=80' },
      { name: 'Ziegenkäse im Glas', price: '€ 9,50 / Stück', weight: '200ml', image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&q=80' },
    ],
    chatMessages: [],
  },
  'kaesekeller-donauland': {
    name: 'Käsekeller Donauland',
    location: 'Wachau, NÖ',
    rating: '5.0',
    years: '40',
    products: '31',
    avatar: 'https://images.unsplash.com/photo-1764685808717-2c2a6ec91f4d?w=128&q=80',
    image: 'https://images.unsplash.com/photo-1764685808717-2c2a6ec91f4d?w=1080&q=80',
    isLive: false,
    viewers: 0,
    description: 'Reifekäse in historischen Gewölbekellern – Geduld ist das Geheimnis unserer Aromen.',
    cheeseItems: [
      { name: 'Donau-Hartkäse 18M', price: '€ 34,90 / kg', weight: 'ab 100g', image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&q=80' },
      { name: 'Wachauer Schnitt', price: '€ 26,00 / kg', weight: 'ab 200g', image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&q=80' },
      { name: 'Kellerreife Special', price: '€ 42,00 / kg', weight: 'ab 50g', image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&q=80' },
    ],
    chatMessages: [],
  },
};

export default async function ErzeugerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const seller = sellerData[id] ?? sellerData['alpenwiese'];

  return (
    <div className="min-h-screen bg-[#F9F6F1]" style={{ fontFamily: 'var(--font-inter), Inter, sans-serif' }}>

      {/* Navigation */}
      <header className="bg-[#F9F6F1] h-20 flex items-center justify-between px-16 border-b border-[#E8DFD0]">
        <Link href="/" className="text-[28px] text-[#2C2416]" style={{ fontFamily: 'var(--font-playfair), serif', fontStyle: 'italic' }}>
          Käserei
        </Link>
        <nav className="flex items-center gap-12">
          {['Sortiment', 'Erzeuger', 'Wissen', 'Über uns'].map(link => (
            <Link key={link} href="#" className="text-[15px] text-[#2C2416] hover:text-[#7A6040] transition-colors">{link}</Link>
          ))}
        </nav>
        <div className="flex items-center gap-6">
          <button className="text-[#2C2416] hover:text-[#7A6040]" aria-label="Suche">
            <SearchIcon />
          </button>
          <Link href="/customer" className="bg-[#2C2416] text-[#F9F6F1] text-[13px] font-medium px-5 py-2.5 rounded-sm hover:bg-[#3d3020] transition-colors">
            Warenkorb
          </Link>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="bg-[#EDE6DA] flex items-center gap-2 px-16 py-3">
        <Link href="/" className="text-[13px] text-[#7A6040] hover:text-[#2C2416] transition-colors">Startseite</Link>
        <ChevronRightIcon />
        <Link href="/#erzeuger" className="text-[13px] text-[#7A6040] hover:text-[#2C2416] transition-colors">Erzeuger</Link>
        <ChevronRightIcon />
        <span className="text-[13px] font-medium text-[#2C2416]">{seller.name}</span>
      </div>

      {/* Main Content */}
      <div className="flex gap-10 px-16 py-10">

        {/* Left Column */}
        <div className="flex-1 flex flex-col gap-8">

          {/* Livestream */}
          <div className="bg-[#1A1208] rounded overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-5 py-3.5">
              {seller.isLive ? (
                <div className="bg-[#E05A2B] text-white text-[12px] font-semibold px-3.5 py-1.5 rounded-full flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                  LIVE
                </div>
              ) : (
                <div className="bg-[#333] text-[#aaa] text-[12px] font-medium px-3.5 py-1.5 rounded-full">
                  OFFLINE
                </div>
              )}
              {seller.isLive && (
                <div className="flex items-center gap-2 text-[#F9F6F1] text-[13px]">
                  <EyeIcon />
                  <span>{seller.viewers}</span>
                </div>
              )}
            </div>
            <div className="relative h-[480px]">
              <Image
                src={seller.image}
                alt={`${seller.name} Livestream`}
                fill
                className="object-cover"
              />
              {seller.isLive && (
                <div className="absolute inset-0 bg-black/15 flex items-center justify-center">
                  <Link
                    href="/customer"
                    className="bg-[#2C2416] text-[#F9F6F1] text-[14px] font-medium px-6 py-3 rounded-sm hover:bg-[#3d3020] transition-colors flex items-center gap-2"
                  >
                    <PlayIcon />
                    Live beraten lassen
                  </Link>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between px-5 py-3.5 bg-[#0D0A06]">
              <span className="text-[12px] text-[#A08060]">
                {seller.isLive ? 'Gestartet um 09:30 Uhr' : 'Nächste Sendung: morgen 10:00 Uhr'}
              </span>
              <div className="flex items-center gap-4 text-[#A08060]">
                <button className="hover:text-[#C8A97E] transition-colors"><ShareIcon /></button>
                <button className="hover:text-[#C8A97E] transition-colors"><BellIcon /></button>
              </div>
            </div>
          </div>

          {/* Products */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h2 className="text-[26px] text-[#2C2416]" style={{ fontFamily: 'var(--font-playfair), serif', fontStyle: 'italic' }}>
                Aktuelles Angebot
              </h2>
              <span className="text-[13px] text-[#7A6040]">{seller.cheeseItems.length * 4} Produkte</span>
            </div>
            <div className="grid grid-cols-3 gap-5">
              {seller.cheeseItems.map(item => (
                <div key={item.name} className="bg-white rounded overflow-hidden">
                  <div className="relative h-40">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="p-4 flex flex-col gap-1">
                    <h3 className="text-[14px] font-medium text-[#2C2416]">{item.name}</h3>
                    <p className="text-[13px] text-[#7A6040]">{item.weight}</p>
                    <p className="text-[15px] font-semibold text-[#2C2416] mt-1">{item.price}</p>
                    <button className="mt-2 bg-[#2C2416] text-[#F9F6F1] text-[12px] font-medium py-2 rounded-sm hover:bg-[#3d3020] transition-colors">
                      In den Warenkorb
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="w-[380px] flex flex-col gap-6">

          {/* Seller Info */}
          <div className="bg-white rounded p-6 flex flex-col gap-5">
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 rounded-full overflow-hidden">
                <Image src={seller.avatar} alt={seller.name} fill className="object-cover" />
              </div>
              <div className="flex flex-col gap-1">
                <h2 className="text-[18px] text-[#2C2416]" style={{ fontFamily: 'var(--font-playfair), serif', fontStyle: 'italic' }}>
                  {seller.name}
                </h2>
                <div className="flex items-center gap-1.5 text-[#7A6040] text-[13px]">
                  <MapPinIcon />
                  {seller.location}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              {[
                { value: seller.rating, label: '⭐ Bewertung' },
                { value: `${seller.years}J`, label: 'Erfahrung' },
                { value: seller.products, label: 'Produkte' },
              ].map((stat, i, arr) => (
                <Fragment key={stat.label}>
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[20px] font-semibold text-[#2C2416]">{stat.value}</span>
                    <span className="text-[12px] text-[#7A6040]">{stat.label}</span>
                  </div>
                  {i < arr.length - 1 && <div className="w-px h-10 bg-[#E8DFD0]" />}
                </Fragment>
              ))}
            </div>
          </div>

          {/* Live Chat */}
          <div className="bg-white rounded overflow-hidden flex flex-col border border-[#E8DFD0]">
            <div className="bg-[#2C2416] flex items-center justify-between px-5 py-4">
              <span className="text-[16px] text-[#F9F6F1]" style={{ fontFamily: 'var(--font-playfair), serif', fontStyle: 'italic' }}>
                Live Chat
              </span>
              <div className="flex items-center gap-1.5 text-[12px] text-[#C8A97E]">
                <span className="w-1.5 h-1.5 bg-[#4ade80] rounded-full" />
                {seller.isLive ? `${seller.viewers} online` : 'Chat offline'}
              </div>
            </div>
            <div className="bg-[#F9F6F1] flex flex-col gap-3.5 p-4 min-h-[200px]">
              {seller.chatMessages.length > 0 ? seller.chatMessages.map(msg => (
                <div key={msg.user} className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-[#E8DFD0] flex items-center justify-center text-[11px] font-medium text-[#7A6040] shrink-0">
                    {msg.avatar}
                  </div>
                  <div>
                    <span className="text-[12px] font-medium text-[#2C2416]">{msg.user}: </span>
                    <span className="text-[13px] text-[#6B5C45]">{msg.text}</span>
                  </div>
                </div>
              )) : (
                <p className="text-[13px] text-[#A08060] text-center mt-4">
                  {seller.isLive ? 'Sei der Erste im Chat!' : 'Chat ist derzeit offline.'}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3 p-3 border-t border-[#E8DFD0] bg-white">
              <div className="flex-1 bg-[#F9F6F1] rounded-full h-9 flex items-center px-3.5">
                <input
                  type="text"
                  placeholder="Nachricht eingeben..."
                  className="bg-transparent w-full text-[13px] text-[#2C2416] placeholder:text-[#A08060] outline-none"
                />
              </div>
              <button className="bg-[#2C2416] text-[#F9F6F1] text-[13px] font-medium px-4 py-2 rounded-full hover:bg-[#3d3020] transition-colors">
                Senden
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Icons
function SearchIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A08060" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6"/>
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5 3 19 12 5 21 5 3"/>
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
    </svg>
  );
}
