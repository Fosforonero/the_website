// Shared building blocks: grain texture, scanlines, CRT vignette, P15 periodic
// box wordmark, project mock previews, project copy.
// All exported on window for the variant files to consume.

const PROJECTS = [
  {
    id: 'fitmesh',
    name: 'FitMesh Sync',
    url: 'https://www.fitmesh.fit',
    handle: 'fitmesh.fit',
    tagline: 'Sincronizzazione wearable e dashboard salute personale.',
    desc: 'Applicazione Android e dashboard web per la sincronizzazione di dispositivi Galaxy Watch e Wear OS. Visualizzazione di metriche e trend, esportazione dei dati, architettura privacy-first.',
    stack: ['Flutter', 'Supabase', 'Next.js'],
    status: 'LIVE',
    brand: '#22c55e',
    year: '2025',
  },
  {
    id: 'splitvote',
    name: 'SplitVote',
    url: 'https://splitvote.io',
    handle: 'splitvote.io',
    tagline: 'Voto e sondaggi per gruppi, senza registrazione.',
    desc: 'Piattaforma web per la creazione e gestione di sondaggi e votazioni di gruppo. Senza account, senza tracciamento. In evoluzione verso un’applicazione mobile dedicata.',
    stack: ['Next.js', 'Edge', 'TypeScript'],
    status: 'LIVE',
    brand: '#c084fc',
    year: '2024',
  },
];

// ────────────────────────────────────────────────────────────────
// P15 PERIODIC BOX (the wordmark/glyph)
// Phosphorus on the periodic table = element 15. "Fosforonero" =
// fosforo + nero. So the brand glyph is a chemistry tile.
// ────────────────────────────────────────────────────────────────
const P15Box = ({ size = 88, color = '#2BFE5C', dim = '#1f3a26', label = 'FOSFORONERO', glow = true }) => (
  <div style={{
    display:'inline-flex', flexDirection:'column', alignItems:'flex-start',
    fontFamily:"'JetBrains Mono', monospace", color, lineHeight:1,
  }}>
    <div style={{
      width:size, height:size, border:`1.5px solid ${color}`,
      padding: size*0.09, boxSizing:'border-box',
      display:'flex', flexDirection:'column', justifyContent:'space-between',
      position:'relative',
      boxShadow: glow ? `0 0 20px ${color}33, inset 0 0 18px ${color}11` : 'none',
      background: `linear-gradient(180deg, ${color}06, transparent 60%)`,
    }}>
      <div style={{fontSize:size*0.14, fontWeight:500, opacity:0.85, letterSpacing:'0.06em'}}>15</div>
      <div style={{fontSize:size*0.52, fontWeight:700, lineHeight:1, marginTop:-size*0.04}}>P</div>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-end', fontSize:size*0.10, opacity:0.75, letterSpacing:'0.04em'}}>
        <span>30.97</span>
        <span style={{color: dim}}>3p³</span>
      </div>
    </div>
    {label ? (
      <div style={{
        marginTop:8, fontSize:size*0.13, letterSpacing:'0.32em', fontWeight:500,
        textTransform:'uppercase',
      }}>{label}</div>
    ) : null}
  </div>
);

// ────────────────────────────────────────────────────────────────
// LAYERED CRT FX — used by every variant at different intensities
// ────────────────────────────────────────────────────────────────

// Scanlines (horizontal repeating line gradient)
const Scanlines = ({ opacity = 0.06, gap = 3 }) => (
  <div aria-hidden style={{
    position:'absolute', inset:0, pointerEvents:'none',
    backgroundImage:`repeating-linear-gradient(0deg, rgba(255,255,255,${opacity}) 0 1px, transparent 1px ${gap}px)`,
    mixBlendMode:'overlay', zIndex:5,
  }}/>
);

// Grain noise (SVG turbulence)
const Grain = ({ opacity = 0.08 }) => (
  <div aria-hidden style={{
    position:'absolute', inset:0, pointerEvents:'none', opacity, zIndex:4,
    backgroundImage:`url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1   0 0 0 0 1   0 0 0 0 1   0 0 0 1 0'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.5'/></svg>")`,
    mixBlendMode:'overlay',
  }}/>
);

// CRT vignette + tiny barrel feel via radial shadow
const CRTVignette = ({ intensity = 0.55 }) => (
  <div aria-hidden style={{
    position:'absolute', inset:0, pointerEvents:'none', zIndex:6,
    background:`radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,${intensity}) 100%)`,
  }}/>
);

// Oscilloscope grid (dotted + faint lines)
const OscGrid = ({ color = '#2BFE5C', minor = 24, major = 96, opacity = 0.07 }) => (
  <div aria-hidden style={{
    position:'absolute', inset:0, pointerEvents:'none', zIndex:1, opacity,
    backgroundImage: [
      `linear-gradient(${color} 1px, transparent 1px)`,
      `linear-gradient(90deg, ${color} 1px, transparent 1px)`,
      `linear-gradient(${color} 0.5px, transparent 0.5px)`,
      `linear-gradient(90deg, ${color} 0.5px, transparent 0.5px)`,
    ].join(','),
    backgroundSize:`${major}px ${major}px, ${major}px ${major}px, ${minor}px ${minor}px, ${minor}px ${minor}px`,
  }}/>
);

// Blinking cursor
const Cursor = ({ color = '#2BFE5C', w = 10, h = 18 }) => (
  <span aria-hidden style={{
    display:'inline-block', width:w, height:h, background:color,
    verticalAlign:'-0.18em', marginLeft:6,
    boxShadow:`0 0 6px ${color}99`,
    animation:'fnBlink 1.05s steps(2,start) infinite',
  }}/>
);

// Inject keyframes once
if (typeof document !== 'undefined' && !document.getElementById('fn-keyframes')) {
  const s = document.createElement('style');
  s.id = 'fn-keyframes';
  s.textContent = `
    @keyframes fnBlink { 0%,49%{opacity:1} 50%,100%{opacity:0} }
    @keyframes fnFlicker { 0%,100%{opacity:1} 92%{opacity:0.85} 95%{opacity:1} 97%{opacity:0.7} }
    @keyframes fnScanRoll { 0%{transform:translateY(-100%)} 100%{transform:translateY(100vh)} }
    @keyframes fnGlowPulse { 0%,100%{filter:drop-shadow(0 0 6px currentColor)} 50%{filter:drop-shadow(0 0 14px currentColor)} }
    @keyframes fnTrace { 0%{stroke-dashoffset:1000} 100%{stroke-dashoffset:0} }
    @keyframes fnRotate3 {
      0%, 25% { transform: translateY(0); }
      33.3%, 58.3% { transform: translateY(-1em); }
      66.6%, 91.6% { transform: translateY(-2em); }
      100% { transform: translateY(-3em); }
    }
    @keyframes fnTicker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
    .fn-glow-soft { text-shadow: 0 0 1px currentColor, 0 0 10px currentColor; }
    .fn-glow-strong { text-shadow: 0 0 2px currentColor, 0 0 12px currentColor, 0 0 24px currentColor; }
    .fn-reveal { opacity: 0; transform: translateY(28px); transition: opacity .9s cubic-bezier(0.16,1,0.3,1), transform .9s cubic-bezier(0.16,1,0.3,1); will-change: opacity, transform; }
    .fn-reveal.is-in { opacity: 1; transform: translateY(0); }
    .fn-card-hover { transition: transform .35s cubic-bezier(0.16,1,0.3,1), box-shadow .35s cubic-bezier(0.16,1,0.3,1); }
    .fn-card-hover:hover { transform: translateY(-4px); }
    .fn-link-underline { position: relative; }
    .fn-link-underline::after {
      content: ''; position: absolute; left: 0; right: 0; bottom: -2px; height: 1.5px;
      background: currentColor; transform: scaleX(0); transform-origin: left;
      transition: transform .45s cubic-bezier(0.16,1,0.3,1);
    }
    .fn-link-underline:hover::after { transform: scaleX(1); }
    @media (prefers-reduced-motion: reduce) {
      .fn-reveal { opacity: 1 !important; transform: none !important; transition: none !important; }
      .fn-rotator, .fn-ticker { animation: none !important; }
      .fn-card-hover:hover { transform: none !important; }
      .fn-link-underline::after { transition: none !important; }
    }
  `;
  document.head.appendChild(s);
}

// ────────────────────────────────────────────────────────────────
// PROJECT MOCK PREVIEWS — small fidelity recreations
// ────────────────────────────────────────────────────────────────

// FitMesh — phone-shaped mock with green health graph
const FitMeshMock = ({ accent = '#22c55e', frameColor = 'rgba(255,255,255,0.08)', bg = '#050816' }) => (
  <div style={{
    width:'100%', aspectRatio:'16/10', borderRadius:10, overflow:'hidden',
    background:`linear-gradient(135deg, ${bg} 0%, #0a1226 100%)`,
    border:`1px solid ${frameColor}`, position:'relative',
    fontFamily:"'JetBrains Mono', monospace",
  }}>
    {/* nav */}
    <div style={{display:'flex', justifyContent:'space-between', padding:'10px 14px', color:'#9aa3b2', fontSize:9}}>
      <span style={{color:accent, fontWeight:600}}>FITMESH</span>
      <span>● ● ●</span>
    </div>
    {/* metric */}
    <div style={{padding:'2px 14px'}}>
      <div style={{fontSize:8, color:'#6b7280', letterSpacing:'0.1em'}}>HEART RATE · 24H</div>
      <div style={{display:'flex', alignItems:'baseline', gap:6, color:'#e5e7eb', fontSize:22, fontWeight:700}}>
        72 <span style={{fontSize:9, color:accent}}>BPM</span>
      </div>
    </div>
    {/* graph */}
    <svg viewBox="0 0 240 80" style={{width:'100%', height:'52%', display:'block'}}>
      <defs>
        <linearGradient id="fmg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={accent} stopOpacity="0.55"/>
          <stop offset="100%" stopColor={accent} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d="M0,50 L20,48 L30,40 L40,55 L55,38 L70,42 L85,30 L100,46 L115,28 L130,50 L150,36 L170,44 L190,32 L210,40 L240,28 L240,80 L0,80 Z" fill="url(#fmg)"/>
      <path d="M0,50 L20,48 L30,40 L40,55 L55,38 L70,42 L85,30 L100,46 L115,28 L130,50 L150,36 L170,44 L190,32 L210,40 L240,28"
        fill="none" stroke={accent} strokeWidth="1.2"/>
    </svg>
  </div>
);

// SplitVote — poll-card mock with two competing options
const SplitVoteMock = ({ accent = '#c084fc', frameColor = 'rgba(255,255,255,0.08)', bg = '#070718' }) => (
  <div style={{
    width:'100%', aspectRatio:'16/10', borderRadius:10, overflow:'hidden',
    background:`linear-gradient(135deg, ${bg} 0%, #1a0d2e 100%)`,
    border:`1px solid ${frameColor}`, position:'relative',
    fontFamily:"'JetBrains Mono', monospace",
  }}>
    <div style={{display:'flex', justifyContent:'space-between', padding:'10px 14px', color:'#a78bfa', fontSize:9}}>
      <span style={{fontWeight:600, color:accent}}>SPLITVOTE</span>
      <span style={{color:'#6b7280'}}>·io</span>
    </div>
    <div style={{padding:'4px 14px 0'}}>
      <div style={{fontSize:11, color:'#e9d5ff', fontWeight:600, lineHeight:1.2}}>Pizza o sushi stasera?</div>
      <div style={{fontSize:8, color:'#6b7280', marginTop:2}}>247 voti · 3h fa</div>
    </div>
    <div style={{padding:'10px 14px', display:'flex', flexDirection:'column', gap:6}}>
      <div style={{display:'flex', alignItems:'center', gap:6}}>
        <div style={{flex:1, height:14, borderRadius:3, background:'rgba(192,132,252,0.12)', position:'relative', overflow:'hidden'}}>
          <div style={{position:'absolute', inset:0, width:'63%', background:`linear-gradient(90deg, ${accent}, #f472b6)`}}/>
          <div style={{position:'relative', padding:'0 6px', fontSize:8, color:'#fff', lineHeight:'14px', fontWeight:500}}>Pizza</div>
        </div>
        <span style={{fontSize:9, color:accent, fontWeight:600, minWidth:24}}>63%</span>
      </div>
      <div style={{display:'flex', alignItems:'center', gap:6}}>
        <div style={{flex:1, height:14, borderRadius:3, background:'rgba(192,132,252,0.08)', position:'relative', overflow:'hidden'}}>
          <div style={{position:'absolute', inset:0, width:'37%', background:'rgba(167,139,250,0.5)'}}/>
          <div style={{position:'relative', padding:'0 6px', fontSize:8, color:'#e9d5ff', lineHeight:'14px'}}>Sushi</div>
        </div>
        <span style={{fontSize:9, color:'#a78bfa', minWidth:24}}>37%</span>
      </div>
    </div>
  </div>
);

Object.assign(window, {
  PROJECTS, P15Box, Scanlines, Grain, CRTVignette, OscGrid, Cursor,
  FitMeshMock, SplitVoteMock,
  useInView, Reveal, RotatingWord, Ticker, BLOG_POSTS,
});

// ────────────────────────────────────────────────────────────────
// ANIMATION PRIMITIVES
// All respect prefers-reduced-motion via the CSS classes above.
// ────────────────────────────────────────────────────────────────

// useInView — IntersectionObserver that fires once
function useInView(options = { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }) {
  const ref = React.useRef(null);
  const [inView, setInView] = React.useState(false);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') { setInView(true); return; }
    const ob = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setInView(true); ob.unobserve(el); }
    }, options);
    ob.observe(el);
    return () => ob.disconnect();
  }, []);
  return [ref, inView];
}

// Reveal — wrap content; fades + slides up when scrolled into view
function Reveal({ children, delay = 0, as = 'div', style, className = '', ...rest }) {
  const [ref, inView] = useInView();
  const As = as;
  return (
    <As ref={ref}
      className={`fn-reveal ${inView ? 'is-in' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms`, ...style }}
      {...rest}
    >
      {children}
    </As>
  );
}

// RotatingWord — cycles through 3 words via pure CSS keyframes.
// Clean, GPU-friendly, no React state churn. Reserves max-width
// via an invisible sizer so the layout never shifts.
function RotatingWord({ words, color }) {
  if (!words || words.length !== 3) {
    // Fallback for non-3 word arrays — just show the first
    return <span style={{ color }}>{words?.[0] ?? ''}</span>;
  }
  const longest = words.reduce((a, b) => (a.length >= b.length ? a : b));
  return (
    <span style={{ display: 'inline-block', position: 'relative', verticalAlign: 'top', color }}>
      {/* invisible sizer — reserves space so neighbouring text doesn't shift */}
      <span aria-hidden style={{ visibility: 'hidden', whiteSpace: 'nowrap' }}>{longest}</span>
      {/* mask + rotator */}
      <span style={{
        position: 'absolute', inset: 0, overflow: 'hidden',
        lineHeight: 'inherit',
      }}>
        <span className="fn-rotator" style={{
          display: 'block', animation: 'fnRotate3 9s infinite',
        }} aria-live="polite">
          {[...words, words[0]].map((w, i) => (
            <span key={i} style={{ display: 'block', whiteSpace: 'nowrap' }}>{w}</span>
          ))}
        </span>
      </span>
    </span>
  );
}

// Ticker — horizontally scrolling list, hover-pauseable in CSS
function Ticker({ items, color = 'currentColor', dim, separator = '·', speedSec = 60, style }) {
  // duplicate the content so the loop appears seamless
  return (
    <div style={{
      overflow: 'hidden', whiteSpace: 'nowrap',
      maskImage: 'linear-gradient(90deg, transparent, black 8%, black 92%, transparent)',
      WebkitMaskImage: 'linear-gradient(90deg, transparent, black 8%, black 92%, transparent)',
      ...style,
    }}>
      <div className="fn-ticker" style={{
        display: 'inline-block', animation: `fnTicker ${speedSec}s linear infinite`,
        whiteSpace: 'nowrap',
      }}>
        {[0, 1].map(rep => (
          <span key={rep} style={{ display: 'inline-block' }}>
            {items.map((it, i) => (
              <span key={i} style={{ display: 'inline-block', padding: '0 24px' }}>
                <span style={{ color }}>{it}</span>
                <span style={{ color: dim || color, opacity: 0.4, marginLeft: 24 }}>{separator}</span>
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// BLOG MOCK DATA — placeholders sober & honest for an indie dev
// ────────────────────────────────────────────────────────────────
const BLOG_POSTS = [
  {
    slug: 'galaxy-watch-android-senza-samsung-health',
    title: 'Sincronizzare Galaxy Watch su Android senza Samsung Health',
    excerpt: 'Cosa ho imparato integrando Health Services di Wear OS in FitMesh, e perché Samsung Health non era la strada giusta.',
    date: '2026-03-12',
    readingTime: '8 min',
    tag: 'FitMesh',
  },
  {
    slug: 'splitvote-niente-account',
    title: 'Perché SplitVote non ha un sistema di account',
    excerpt: 'Un giro veloce sul perché la registrazione è il primo punto di abbandono in uno strumento di voto rapido, e come l\u2019ho aggirata.',
    date: '2026-02-04',
    readingTime: '5 min',
    tag: 'SplitVote',
  },
  {
    slug: 'fitmesh-primo-anno-produzione',
    title: 'Note dal primo anno di FitMesh in produzione',
    excerpt: 'Cosa ha tenuto, cosa ho riscritto, cosa cambierei. Una retrospettiva di un\u2019app indie con utenti veri.',
    date: '2026-01-18',
    readingTime: '12 min',
    tag: 'Retrospettiva',
  },
  {
    slug: 'stack-2026',
    title: 'Lo stack che uso nel 2026',
    excerpt: 'Flutter, Next.js, Supabase. Perché ho scelto questi tre, dove faticano, e cosa li tiene insieme.',
    date: '2025-12-02',
    readingTime: '6 min',
    tag: 'Stack',
  },
];

Object.assign(window, { useInView, Reveal, RotatingWord, Ticker, BLOG_POSTS });
