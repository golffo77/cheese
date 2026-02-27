import Image from 'next/image';
import Link from 'next/link';

const sellers = [
  {
    id: 'alpenwiese',
    name: 'Alpenwiese Sennerei',
    location: 'Allgäu, Bayern',
    description: 'Traditionelle Bergkäse-Herstellung nach altem Familienrezept seit 1892.',
    image: 'https://images.unsplash.com/photo-1659367057365-7e62f61c2d3b?w=600&q=80',
    isLive: true,
    tag: null,
  },
  {
    id: 'ziegenhof-muehlbach',
    name: 'Ziegenhof Mühlbach',
    location: 'Schwarzwald, BW',
    description: 'Bio-zertifizierte Ziegenkäserei mit eigenem Weidegang und saisonalem Angebot.',
    image: 'https://images.unsplash.com/photo-1739066112286-be4f0662ec9f?w=600&q=80',
    isLive: false,
    tag: null,
  },
  {
    id: 'kaesekeller-donauland',
    name: 'Käsekeller Donauland',
    location: 'Wachau, NÖ',
    description: 'Reifekäse in historischen Gewölbekellern – Geduld ist das Geheimnis unserer Aromen.',
    image: 'https://images.unsplash.com/photo-1764685808717-2c2a6ec91f4d?w=600&q=80',
    isLive: false,
    tag: 'Neu',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#F9F6F1]" style={{ fontFamily: 'var(--font-inter), Inter, sans-serif' }}>

      {/* Navigation */}
      <header className="bg-[#F9F6F1] h-20 flex items-center justify-between px-16 sticky top-0 z-50 border-b border-[#E8DFD0]">
        <span className="text-[28px] text-[#2C2416]" style={{ fontFamily: 'var(--font-playfair), serif', fontStyle: 'italic' }}>
          Käserei
        </span>
        <nav className="flex items-center gap-12">
          {['Sortiment', 'Erzeuger', 'Wissen', 'Über uns'].map(link => (
            <Link key={link} href="#" className="text-[15px] text-[#2C2416] hover:text-[#7A6040] transition-colors">
              {link}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-6">
          <button className="text-[#2C2416] hover:text-[#7A6040] transition-colors" aria-label="Suche">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </button>
          <Link href="/customer" className="bg-[#2C2416] text-[#F9F6F1] text-[13px] font-medium px-5 py-2.5 rounded-sm hover:bg-[#3d3020] transition-colors">
            Warenkorb
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="flex h-[620px]">
        <div className="flex-1 flex flex-col justify-center gap-8 px-16 py-20">
          <div className="inline-flex items-center bg-[#E8DFD0] rounded-full px-4 py-1.5 w-fit">
            <span className="text-[12px] font-medium text-[#7A6040] tracking-wide">Handwerkliche Käsekultur</span>
          </div>
          <h1
            className="text-[72px] text-[#2C2416] leading-[1.05] w-[560px]"
            style={{ fontFamily: 'var(--font-playfair), serif', fontStyle: 'italic' }}
          >
            Vom Stall<br />zum Tisch.
          </h1>
          <p className="text-[17px] text-[#6B5C45] leading-[1.6] max-w-[440px]">
            Entdecke authentischen Käse direkt von regionalen Erzeugern — frisch, rein und mit Geschichte.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="#erzeuger"
              className="bg-[#2C2416] text-[#F9F6F1] text-[15px] font-medium px-8 py-4 rounded-sm hover:bg-[#3d3020] transition-colors"
            >
              Erzeuger entdecken
            </Link>
            <Link
              href="#info"
              className="border border-[#2C2416] text-[#2C2416] text-[15px] font-medium px-8 py-4 rounded-sm hover:bg-[#E8DFD0] transition-colors"
            >
              Mehr erfahren
            </Link>
          </div>
        </div>
        <div className="w-[660px] overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1664876642403-36c98ce2c910?w=1080&q=80"
            alt="Handwerklicher Käse"
            width={660}
            height={620}
            className="w-full h-full object-cover"
            priority
          />
        </div>
      </section>

      {/* Trust Bar */}
      <div className="bg-[#2C2416] h-20 flex items-center justify-center gap-20">
        {[
          { icon: <LeafIcon />, label: '100% Naturprodukte' },
          { icon: <MapPinIcon />, label: 'Direkt vom Erzeuger' },
          { icon: <ShieldCheckIcon />, label: 'Geprüfte Qualität' },
          { icon: <TruckIcon />, label: 'Frische Lieferung' },
        ].map(({ icon, label }) => (
          <div key={label} className="flex items-center gap-3">
            <span className="text-[#C8A97E]">{icon}</span>
            <span className="text-[#F9F6F1] text-[13px] font-medium">{label}</span>
          </div>
        ))}
      </div>

      {/* Sellers Section */}
      <section id="erzeuger" className="bg-[#F9F6F1] px-16 py-20 flex flex-col gap-12">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-3">
            <span className="text-[13px] font-medium text-[#7A6040] tracking-wide">— Unsere Erzeuger</span>
            <h2
              className="text-[48px] text-[#2C2416] leading-[1.1] w-[480px]"
              style={{ fontFamily: 'var(--font-playfair), serif', fontStyle: 'italic' }}
            >
              Wähle deinen<br />Lieblingserzeuger
            </h2>
          </div>
          <Link href="#" className="flex items-center gap-2 text-[14px] font-medium text-[#2C2416] hover:text-[#7A6040] transition-colors">
            Alle anzeigen
            <ArrowRightIcon />
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {sellers.map(seller => (
            <Link key={seller.id} href={`/erzeuger/${seller.id}`} className="group">
              <div className="bg-white rounded overflow-hidden flex flex-col">
                <div className="relative h-60 overflow-hidden">
                  <Image
                    src={seller.image}
                    alt={seller.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {seller.isLive && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white text-[11px] font-semibold px-3 py-1 rounded-full flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                      LIVE
                    </div>
                  )}
                </div>
                <div className="p-5 flex flex-col gap-2.5">
                  {seller.tag && (
                    <span className="bg-[#E8DFD0] text-[#7A6040] text-[11px] font-medium px-2.5 py-1 rounded w-fit">
                      {seller.tag}
                    </span>
                  )}
                  <h3 className="text-[20px] text-[#2C2416]" style={{ fontFamily: 'var(--font-playfair), serif', fontStyle: 'italic' }}>
                    {seller.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-[#7A6040]">
                    <MapPinIcon size={14} />
                    <span className="text-[13px]">{seller.location}</span>
                  </div>
                  <p className="text-[13px] text-[#6B5C45] leading-[1.5]">{seller.description}</p>
                  <div className="mt-1 bg-[#2C2416] text-[#F9F6F1] text-[13px] font-medium py-3 rounded-sm text-center group-hover:bg-[#3d3020] transition-colors">
                    Erzeuger entdecken
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Info Section */}
      <section id="info" className="bg-[#EDE6DA] flex">
        <div className="flex-1 flex flex-col justify-center gap-8 p-16">
          <span className="text-[12px] font-medium text-[#7A6040] tracking-wide">— Vom Ursprung zum Genuss</span>
          <h2
            className="text-[52px] text-[#2C2416] leading-[1.1] w-[420px]"
            style={{ fontFamily: 'var(--font-playfair), serif', fontStyle: 'italic' }}
          >
            Käse mit<br />Geschichte.
          </h2>
          <p className="text-[16px] text-[#6B5C45] leading-[1.7] max-w-[400px]">
            Jede Sorte erzählt von ihrer Region, dem Klima und den Menschen, die sie mit Sorgfalt herstellen. Wir verbinden dich direkt mit den Erzeugern — transparent, fair und leidenschaftlich.
          </p>
          <div className="flex flex-col gap-4">
            {[
              'Direkte Lieferkette ohne Zwischenhändler',
              'Live-Einblicke in die Käseproduktion',
              'Saisonale und regionale Spezialitäten',
            ].map(feature => (
              <div key={feature} className="flex items-center gap-3">
                <CircleCheckIcon />
                <span className="text-[14px] text-[#2C2416]">{feature}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="w-[560px] h-[480px] overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1736788265300-e1b8daab0ae7?w=1080&q=80"
            alt="Käseherstellung"
            width={560}
            height={480}
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#2C2416]">
        <div className="flex items-start justify-between px-16 py-15 gap-12">
          <div className="flex flex-col gap-4 w-[280px]">
            <span className="text-[32px] text-[#F9F6F1]" style={{ fontFamily: 'var(--font-playfair), serif', fontStyle: 'italic' }}>
              Käserei
            </span>
            <p className="text-[14px] text-[#A08060] leading-[1.6] max-w-[260px]">
              Authentischer Käse, direkt vom Erzeuger zu dir.
            </p>
            <div className="flex gap-4">
              {[InstagramIcon, FacebookIcon, YoutubeIcon].map((Icon, i) => (
                <Link key={i} href="#" className="text-[#A08060] hover:text-[#C8A97E] transition-colors">
                  <Icon />
                </Link>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <span className="text-[13px] font-medium text-[#F9F6F1]">Shop</span>
            {['Alle Käsesorten', 'Erzeuger', 'Saisonangebot', 'Geschenksets'].map(l => (
              <Link key={l} href="#" className="text-[13px] text-[#A08060] hover:text-[#C8A97E] transition-colors">{l}</Link>
            ))}
          </div>
          <div className="flex flex-col gap-4">
            <span className="text-[13px] font-medium text-[#F9F6F1]">Wissen</span>
            {['Käsekunde', 'Herstellung', 'Regionen', 'Blog'].map(l => (
              <Link key={l} href="#" className="text-[13px] text-[#A08060] hover:text-[#C8A97E] transition-colors">{l}</Link>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between px-16 h-14 bg-[#1E1810]">
          <span className="text-[12px] text-[#6B5040]">© 2025 Käserei. Alle Rechte vorbehalten.</span>
          <div className="flex gap-8">
            {['Datenschutz', 'Impressum', 'AGB'].map(l => (
              <Link key={l} href="#" className="text-[12px] text-[#6B5040] hover:text-[#A08060] transition-colors">{l}</Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

// Icons
function LeafIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/>
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
    </svg>
  );
}

function MapPinIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  );
}

function ShieldCheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      <path d="m9 12 2 2 4-4"/>
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/>
      <rect x="9" y="11" width="14" height="10" rx="2"/>
      <circle cx="12" cy="21" r="1"/>
      <circle cx="20" cy="21" r="1"/>
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
    </svg>
  );
}

function CircleCheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7A6040" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="m9 12 2 2 4-4"/>
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
  );
}

function YoutubeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
      <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/>
    </svg>
  );
}
