
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  ExternalLink, 
  Sparkles,
  LayoutGrid,
  Loader2,
  ChevronRight,
  RefreshCw
} from 'lucide-react';

const SHEET_ID = '1kP3egzsm8fmgCxQG4mR2fzbpfGRvVenI-WdZDZi41XU';
const BASE_FETCH_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;

interface SheetLink {
  title: string;
  url: string;
}

interface SectionGroup {
  name: string;
  links: SheetLink[];
}

const DAILY_QUOTES = [
  "Semangat melayani dengan hati untuk BSKJI yang lebih baik.",
  "Setiap langkah kecil hari ini adalah kemajuan untuk masa depan.",
  "Bekerja bukan hanya tentang hasil, tapi tentang dedikasi.",
  "Awali hari dengan senyum, selesaikan tugas dengan pride.",
  "Kualitas pelayanan kita mencerminkan kualitas integritas kita.",
  "Tetap produktif, tetap bahagia, tetap memberikan yang terbaik.",
  "Kolaborasi yang hebat dimulai dari komunikasi yang sehat.",
  "Disiplin adalah kunci utama menuju kesuksesan bersama.",
  "Hari baru, energi baru untuk pelayanan yang lebih prima.",
  "Kesuksesan adalah hasil dari persiapan dan kerja keras hari ini.",
  "Jadilah solusi, bukan sekadar bagian dari masalah.",
  "Kreativitas dalam bekerja membuat setiap tugas terasa ringan.",
  "Integritas adalah melakukan hal yang benar saat tak ada yang melihat.",
  "Pelayanan tulus adalah ibadah yang tak ternilai harganya.",
  "Fokus pada solusi, rayakan setiap pencapaian tim.",
  "Eksistensi kita ditentukan oleh kontribusi kita hari ini.",
  "Bersyukur atas pekerjaan hari ini, optimis untuk hari esok.",
  "Komitmen hari ini adalah jembatan menuju mimpi masa depan.",
  "Wujudkan pelayanan OSDM yang responsif and transparan.",
  "Kesehatan mental di kantor dimulai dari saling menghargai."
];

const STORAGE_KEY = 'osdm_portal_sections_v5';
const SYNC_TIME_KEY = 'osdm_portal_last_sync_v5';
const KEMENPERIN_LOGO = "https://bumninc.com/wp-content/uploads/2021/02/Pendaftaran-CPNS-Kemenperin.png";

const App: React.FC = () => {
  const [sections, setSections] = useState<SectionGroup[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [lastSync, setLastSync] = useState<string | null>(() => localStorage.getItem(SYNC_TIME_KEY));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Theme Config
  const [siteTitle] = useState(() => 'Halo, PP.');
  const [siteSubtitle] = useState(() => 'Berikut Kumpulan Link OSDM BSKJI');

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const fetchUrl = `${BASE_FETCH_URL}&cb=${Date.now()}`;
      const response = await fetch(fetchUrl);
      const text = await response.text();
      
      const jsonStr = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
      const data = JSON.parse(jsonStr);
      
      const rows = data.table.rows;
      const sectionMap = new Map<string, SheetLink[]>();
      const sectionList: string[] = [];

      rows.forEach((row: any, index: number) => {
        const getVal = (idx: number) => {
          if (!row.c || !row.c[idx]) return '';
          const cell = row.c[idx];
          return String(cell.v ?? cell.f ?? '').trim();
        };
        
        const colA = getVal(0); // Section Name
        const colB = getVal(1); // Title
        const colC = getVal(2); // URL

        // 1. Skip jika baris benar-benar kosong
        if (!colA && !colB) return;

        // 2. Skip jika baris header label (hanya jika di baris pertama)
        if (index === 0 && colA.toLowerCase() === 'section' && colB.toLowerCase() === 'judul') {
          return;
        }

        // 3. Tentukan nama section - Fallback ke 'Lainnya' sesuai permintaan user
        const sectionName = colA || 'Lainnya';

        // 4. Masukkan ke grouping
        if (!sectionMap.has(sectionName)) {
          sectionMap.set(sectionName, []);
          sectionList.push(sectionName);
        }

        // Tambahkan link jika ada judulnya
        if (colB) {
          sectionMap.get(sectionName)?.push({
            title: colB,
            url: colC || '#'
          });
        }
      });

      const finalSections = sectionList
        .map(name => ({
          name,
          links: sectionMap.get(name) || []
        }))
        .filter(s => s.links.length > 0);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(finalSections));
      const now = new Date().toLocaleString('id-ID', { 
        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit'
      });
      localStorage.setItem(SYNC_TIME_KEY, now);
      
      setSections(finalSections);
      setLastSync(now);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Gagal memuat data. Periksa koneksi atau publikasi spreadsheet.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (sections.length === 0) {
      fetchData();
    }
  }, [fetchData, sections.length]);

  const dailyQuote = useMemo(() => {
    const today = new Date();
    const dateHash = today.getFullYear() * 1000 + today.getMonth() * 100 + today.getDate();
    return DAILY_QUOTES[dateHash % DAILY_QUOTES.length];
  }, []);

  return (
    <div className="min-h-screen bg-[#fff5f5] flex flex-col items-center px-4 py-10 pb-20 relative overflow-x-hidden">
      <div className="absolute top-0 left-0 w-full h-80 bg-gradient-to-b from-pink-100/50 to-transparent -z-10" />

      <header className="text-center mb-10 space-y-3 animate-in fade-in slide-in-from-top duration-700 mt-6">
        <div className="mb-6 mx-auto w-fit">
          <img 
            src="/logo_kemenperin.png"
            alt="Logo Kemenperin" 
            className="h-12 md:h-16 w-auto object-contain drop-shadow-md rounded-xl"
          />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight uppercase text-[#7c2d12]">{siteTitle}</h1>
        <p className="text-lg font-medium opacity-60 text-[#7c2d12]">{siteSubtitle}</p>
      </header>

      <div className="w-full max-w-md px-6 py-6 mb-12 bg-white/80 backdrop-blur-xl rounded-[2rem] border border-white shadow-xl shadow-pink-200/20 animate-in fade-in zoom-in duration-1000 flex flex-col items-center relative">
        <div className="flex items-center gap-2 mb-3 opacity-40">
          <span className="text-[10px] font-black tracking-[0.3em] uppercase text-[#7c2d12]">Daily Inspiration</span>
          <Sparkles size={14} className="text-pink-500" />
        </div>
        <p className="text-center italic text-sm font-semibold leading-relaxed text-[#7c2d12]/80">
          "{dailyQuote}"
        </p>
      </div>

      <main className="w-full max-w-lg space-y-12 mb-12">
        {isLoading && sections.length === 0 ? (
          <div className="space-y-8">
            {[1, 2].map(i => (
              <div key={i} className="bg-white/50 h-40 rounded-[2.5rem] animate-pulse" />
            ))}
          </div>
        ) : (
          sections.map((section, sIdx) => (
            <section key={sIdx} className="space-y-5 animate-in fade-in slide-in-from-bottom duration-500" style={{ animationDelay: `${sIdx * 150}ms` }}>
              <div className="flex items-center gap-4 px-2">
                <div className="h-0.5 flex-1 bg-gradient-to-r from-transparent to-pink-200" />
                <h2 className="text-[12px] font-black tracking-[0.3em] uppercase text-pink-500 whitespace-nowrap">
                  {section.name}
                </h2>
                <div className="h-0.5 flex-1 bg-gradient-to-l from-transparent to-pink-200" />
              </div>

              <div className="grid gap-3.5">
                {section.links.map((link, lIdx) => {
                  // Tentukan style kontras untuk section '2026' dan 'Lainnya'
                  let buttonBg = "bg-white hover:bg-pink-50/50 border-white hover:border-pink-200";
                  // Gunakan lebar konsisten untuk 2026 dan LAINNYA
                  let buttonWidth = "";
                  let buttonCenter = "";
                  const isSpecialSection = section.name === "2026" || section.name.toLowerCase() === "lainnya";
                  if (section.name === "2026") {
                    buttonBg = "bg-pink-200/80 hover:bg-pink-400/90 border-pink-300 hover:border-pink-500";
                  } else if (section.name.toLowerCase() === "lainnya") {
                    buttonBg = "bg-yellow-200/80 hover:bg-yellow-400/90 border-yellow-300 hover:border-yellow-500";
                  }
                  if (isSpecialSection) {
                    buttonWidth = "w-full max-w-md px-6 py-4";
                    buttonCenter = "mx-auto";
                  }
                  return (
                    <a
                      key={lIdx}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`group relative flex items-center justify-between rounded-[1.5rem] shadow-sm hover:shadow-xl hover:shadow-pink-200/30 transition-all duration-300 active:scale-[0.98] ${buttonBg} ${buttonWidth} ${buttonCenter} ${buttonWidth ? '' : 'p-6'}`}
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="text-base font-bold text-[#7c2d12] group-hover:text-pink-600 transition-colors">
                          {link.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                        <span className="text-[10px] font-black text-pink-500 uppercase tracking-tighter">Buka</span>
                        <ChevronRight size={18} className="text-pink-400" />
                      </div>
                      <ExternalLink size={14} className="absolute right-4 bottom-4 opacity-5 group-hover:opacity-10" />
                    </a>
                  );
                })}
              </div>
            </section>
          ))
        )}

        {sections.length === 0 && !isLoading && (
          <div className="text-center py-24 opacity-20 flex flex-col items-center gap-6">
            <LayoutGrid size={64} strokeWidth={1} />
            <p className="font-bold text-sm tracking-[0.2em] uppercase leading-relaxed text-center">
              Tidak ada data ditemukan.<br/>Pastikan kolom B terisi judul.
            </p>
          </div>
        )}
      </main>

      {/* Button Sync Moved to Bottom */}
      <div className="w-full max-w-lg flex justify-center mb-8">
        <button 
          onClick={fetchData}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-4 py-2 bg-white rounded-full border border-pink-100 shadow-md hover:shadow-lg active:scale-95 transition-all disabled:opacity-50 group min-h-0 min-w-0"
        >
          {isLoading ? (
            <Loader2 size={12} className="animate-spin text-pink-500" />
          ) : (
            <RefreshCw size={12} className="text-pink-500 group-hover:rotate-180 transition-transform duration-700" />
          )}
          <span className="text-[8px] font-extrabold uppercase tracking-[0.15em] text-[#7c2d12]">
            {isLoading ? 'Memuat Data...' : 'Sinkronkan Sekarang'}
          </span>
        </button>
      </div>

      {error && (
        <div className="fixed bottom-8 px-4 w-full max-w-sm z-50">
          <div className="bg-red-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center justify-between gap-4 border-2 border-white/20">
            <span className="text-xs font-bold">{error}</span>
            <button onClick={() => setError(null)} className="text-[8px] font-black uppercase bg-white/20 px-2 py-1 rounded-lg">OK</button>
          </div>
        </div>
      )}

      <footer className="mt-12 text-[10px] font-black tracking-[0.4em] uppercase opacity-25 text-center flex flex-col items-center gap-4 text-[#7c2d12]">
        <div className="w-12 h-[2px] bg-pink-300"></div>
        <span>OSDM BSKJI • 2026</span>
      </footer>
    </div>
  );
};

export default App;
