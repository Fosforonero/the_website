// VARIANT 6 — COOL STUDIO  (con animazioni scroll + area Blog)
// Near-white background, sharp charcoal type, electric phosphor green as
// surgical accent. All scroll animations respect prefers-reduced-motion.

const V6 = {
  bg: '#FBFBFA',
  surface: '#F4F4F1',
  ink: '#0A0A0A',
  ink2: '#1F1F1F',
  dim: '#6B6B66',
  rule: '#E7E7E2',
  accent: '#00A341',
  accentSoft: '#E6F7EC',
  font: "'Space Grotesk', system-ui, sans-serif",
  mono: "'JetBrains Mono', monospace",
};

const V6Pill = ({ children, color, bg }) => (
  <span style={{
    display:'inline-flex', alignItems:'center', gap:6,
    fontFamily:V6.mono, fontSize:10, letterSpacing:'0.16em',
    color: color || V6.dim, background: bg || V6.surface,
    padding:'4px 8px', borderRadius:4, fontWeight:500,
    textTransform:'uppercase', whiteSpace:'nowrap',
  }}>{children}</span>
);

// ──────────────────────────────────────────────────────────────
// PROJECT CARD
// ──────────────────────────────────────────────────────────────
const V6Project = ({ p, idx }) => {
  const Mock = p.id === 'fitmesh' ? FitMeshMock : SplitVoteMock;
  return (
    <article className="fn-card-hover" style={{
      background:'#fff', border:`1px solid ${V6.rule}`, borderRadius:14,
      overflow:'hidden',
      boxShadow:'0 1px 3px rgba(10,10,10,0.04), 0 12px 32px rgba(10,10,10,0.06)',
    }}>
      <div style={{padding:'18px 22px', borderBottom:`1px solid ${V6.rule}`, display:'flex', justifyContent:'space-between', alignItems:'center', background:V6.bg}}>
        <div style={{display:'flex', gap:10, alignItems:'center'}}>
          <V6Pill color={V6.dim}>0{idx+1}</V6Pill>
          <V6Pill color={V6.accent} bg={V6.accentSoft}>● {p.status}</V6Pill>
          <V6Pill color={V6.dim}>{p.year}</V6Pill>
        </div>
        <a className="fn-link-underline" style={{fontFamily:V6.mono, fontSize:12, color:V6.ink, letterSpacing:'0.06em', textDecoration:'none', fontWeight:500}}>
          {p.handle} <span style={{color:V6.accent}}>↗</span>
        </a>
      </div>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1.1fr', gap:36, padding:36, alignItems:'center'}}>
        <div>
          <h3 style={{
            fontFamily:V6.font, fontSize:48, fontWeight:600, color:V6.ink,
            margin:'0 0 10px', letterSpacing:'-0.025em', lineHeight:1.02,
          }}>{p.name}</h3>
          <div style={{fontFamily:V6.font, fontSize:18, color:V6.accent, fontWeight:500, marginBottom:18}}>
            {p.tagline}
          </div>
          <p style={{
            fontFamily:V6.font, fontSize:15, color:V6.ink2, opacity:0.78,
            lineHeight:1.65, margin:'0 0 22px', maxWidth:380,
          }}>{p.desc}</p>
          <div style={{display:'flex', flexWrap:'wrap', gap:6, marginBottom:24}}>
            {p.stack.map(s => (
              <span key={s} style={{
                fontFamily:V6.mono, fontSize:11, padding:'4px 10px',
                background:V6.surface, color:V6.ink2, borderRadius:4,
                letterSpacing:'0.04em',
              }}>{s}</span>
            ))}
          </div>
          <a href={p.url} target="_blank" rel="noopener noreferrer" style={{
            display:'inline-flex', alignItems:'center', gap:8,
            padding:'10px 18px', background:V6.ink, color:'#fff',
            border:'none', borderRadius:8, fontFamily:V6.font, fontSize:14,
            fontWeight:600, cursor:'pointer', textDecoration:'none',
          }}>
            Apri progetto <span style={{color:V6.accent}}>↗</span>
          </a>
        </div>
        <div>
          <Mock accent={p.brand}/>
        </div>
      </div>
    </article>
  );
};

// ──────────────────────────────────────────────────────────────
// BLOG POST ROW
// ──────────────────────────────────────────────────────────────
const V6BlogRow = ({ post, idx }) => {
  const dateStr = new Date(post.date).toLocaleDateString('it-IT', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
  return (
    <article className="fn-card-hover" style={{
      display:'grid', gridTemplateColumns:'120px 1fr auto', gap:32,
      padding:'28px 32px', background:'#fff',
      border:`1px solid ${V6.rule}`, borderRadius:14,
      alignItems:'center',
      boxShadow:'0 1px 3px rgba(10,10,10,0.03)',
    }}>
      <div>
        <div style={{fontFamily:V6.mono, fontSize:10, color:V6.dim, letterSpacing:'0.16em'}}>0{idx+1}</div>
        <div style={{fontFamily:V6.mono, fontSize:12, color:V6.ink2, marginTop:4, letterSpacing:'0.04em'}}>
          {dateStr}
        </div>
        <div style={{fontFamily:V6.mono, fontSize:11, color:V6.dim, marginTop:2}}>
          {post.readingTime}
        </div>
      </div>
      <div>
        <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:8}}>
          <V6Pill color={V6.accent} bg={V6.accentSoft}>{post.tag}</V6Pill>
        </div>
        <h3 style={{
          fontFamily:V6.font, fontSize:24, fontWeight:600, color:V6.ink,
          margin:'0 0 6px', letterSpacing:'-0.018em', lineHeight:1.2,
        }}>{post.title}</h3>
        <p style={{
          fontFamily:V6.font, fontSize:15, color:V6.ink2, opacity:0.75,
          lineHeight:1.55, margin:0, maxWidth:580,
        }}>{post.excerpt}</p>
      </div>
      <a href={`/blog/${post.slug}`} className="fn-link-underline" style={{
        fontFamily:V6.mono, fontSize:12, color:V6.ink, letterSpacing:'0.16em',
        textDecoration:'none', fontWeight:600,
      }}>
        LEGGI <span style={{color:V6.accent}}>↗</span>
      </a>
    </article>
  );
};

// ──────────────────────────────────────────────────────────────
// MAIN
// ──────────────────────────────────────────────────────────────
const VariantCoolStudio = () => (
  <div style={{
    width:'100%', minHeight:'100%', background:V6.bg, color:V6.ink,
    fontFamily:V6.font, position:'relative', overflow:'hidden',
  }}>
    {/* very subtle dot grid */}
    <div aria-hidden style={{
      position:'absolute', inset:0, pointerEvents:'none', zIndex:0, opacity:0.5,
      backgroundImage:`radial-gradient(${V6.rule} 1px, transparent 1px)`,
      backgroundSize:'28px 28px',
    }}/>

    {/* TOP NAV */}
    <header style={{
      display:'flex', justifyContent:'space-between', alignItems:'center',
      padding:'20px 32px', margin:'24px 32px', position:'sticky', top:24, zIndex:50,
      background:'rgba(255,255,255,0.7)', backdropFilter:'blur(12px)',
      WebkitBackdropFilter:'blur(12px)',
      border:`1px solid ${V6.rule}`, borderRadius:14,
      boxShadow:'0 1px 3px rgba(10,10,10,0.04)',
    }}>
      <a href="#top" style={{display:'flex', alignItems:'center', gap:12, textDecoration:'none'}}>
        <P15Box size={30} color={V6.accent} dim={V6.dim} label="" glow={false}/>
        <span style={{fontFamily:V6.font, fontSize:17, fontWeight:600, color:V6.ink, letterSpacing:'-0.015em'}}>Fosforonero</span>
      </a>
      <nav style={{display:'flex', gap:4, fontSize:14, color:V6.ink2, alignItems:'center'}}>
        {[
          ['Chi sono', '#about'],
          ['Progetti', '#progetti'],
          ['Blog', '#blog'],
          ['Contatti', '#contatti'],
        ].map(([l, h]) => (
          <a key={l} href={h} className="fn-link-underline" style={{
            color:V6.ink2, textDecoration:'none', padding:'6px 12px', borderRadius:6,
          }}>{l}</a>
        ))}
        <span style={{width:1, height:18, background:V6.rule, margin:'0 8px'}}/>
        <V6Pill color={V6.ink} bg={V6.accentSoft}>IT</V6Pill>
        <V6Pill>EN</V6Pill>
      </nav>
    </header>

    {/* HERO */}
    <section id="top" style={{padding:'80px 64px 120px', position:'relative'}}>
      <Reveal>
        <div style={{
          display:'inline-flex', alignItems:'center', gap:10,
          padding:'6px 14px 6px 8px', background:'#fff',
          border:`1px solid ${V6.rule}`, borderRadius:999,
          fontFamily:V6.mono, fontSize:11, color:V6.dim, letterSpacing:'0.08em',
          boxShadow:'0 1px 3px rgba(10,10,10,0.04)',
        }}>
          <span style={{
            display:'inline-block', width:6, height:6, borderRadius:'50%',
            background:V6.accent, boxShadow:`0 0 0 4px ${V6.accentSoft}`,
          }}/>
          <span style={{color:V6.ink}}>SVILUPPATORE INDIPENDENTE</span>
          <span>·</span>
          <span>Roma</span>
          <span>·</span>
          <span>Dal 2017</span>
        </div>
      </Reveal>

      <Reveal delay={120}>
        <h1 style={{
          fontFamily:V6.font, fontSize:128, fontWeight:600, lineHeight:0.95,
          color:V6.ink, margin:'32px 0 0', letterSpacing:'-0.045em', maxWidth:1100,
        }}>
          Sviluppo software<br/>
          <RotatingWord
            words={['indipendente.', 'sostenibile.', 'su misura.']}
            color={V6.accent}
          />
        </h1>
      </Reveal>

      <Reveal delay={240}>
        <p style={{
          fontFamily:V6.font, fontSize:22, color:V6.ink2, opacity:0.75,
          maxWidth:640, lineHeight:1.5, marginTop:36,
        }}>
          Sono <span style={{color:V6.ink, fontWeight:500}}>Matteo Pizzi</span>,
          sviluppatore con base a Roma. <span style={{color:V6.ink, fontWeight:500}}>Fosforonero</span> è il nome
          sotto cui pubblico i miei progetti: applicazioni, dashboard e strumenti per web e mobile.
        </p>
      </Reveal>

      <Reveal delay={340}>
        <div style={{display:'flex', gap:12, marginTop:36}}>
          <a href="#progetti" style={{
            padding:'14px 22px', background:V6.ink, color:'#fff', borderRadius:10,
            fontFamily:V6.font, fontSize:15, fontWeight:600,
            display:'inline-flex', alignItems:'center', gap:10, textDecoration:'none',
          }}>Esplora i progetti <span style={{color:V6.accent}}>→</span></a>
          <a href="#contatti" style={{
            padding:'14px 22px', background:'#fff', color:V6.ink,
            border:`1px solid ${V6.rule}`, borderRadius:10,
            fontFamily:V6.font, fontSize:15, fontWeight:500, textDecoration:'none',
          }}>Contatti</a>
        </div>
      </Reveal>

      {/* metric strip */}
      <Reveal delay={120}>
        <div style={{
          marginTop:80, padding:'28px 32px', background:'#fff',
          border:`1px solid ${V6.rule}`, borderRadius:14,
          display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:32,
          boxShadow:'0 1px 3px rgba(10,10,10,0.04)',
        }}>
          {[
            ['PROGETTI', '02', 'attivi'],
            ['DAL', '2017', 'sviluppo software'],
            ['BASE', 'Roma', 'Italia'],
            ['STACK', 'Flutter · TS', 'principali'],
          ].map(([k,v,sub]) => (
            <div key={k}>
              <div style={{fontFamily:V6.mono, fontSize:10, color:V6.dim, letterSpacing:'0.24em'}}>{k}</div>
              <div style={{fontFamily:V6.font, fontSize:36, color:V6.ink, fontWeight:600, marginTop:8, letterSpacing:'-0.02em'}}>{v}</div>
              <div style={{fontFamily:V6.font, fontSize:13, color:V6.dim, marginTop:2}}>{sub}</div>
            </div>
          ))}
        </div>
      </Reveal>
    </section>

    {/* TECH TICKER — separator between hero and about */}
    <Reveal>
      <div style={{
        padding:'24px 0', borderTop:`1px solid ${V6.rule}`, borderBottom:`1px solid ${V6.rule}`,
        background:'#fff',
      }}>
        <Ticker
          items={['TypeScript', 'Flutter', 'Next.js', 'Supabase', 'React', 'Dart', 'PostgreSQL', 'Tailwind', 'Vercel', 'Android', 'Wear OS', 'Edge runtime']}
          color={V6.ink}
          dim={V6.dim}
          separator="·"
          speedSec={50}
          style={{fontFamily:V6.mono, fontSize:14, fontWeight:500, letterSpacing:'0.04em'}}
        />
      </div>
    </Reveal>

    {/* ABOUT */}
    <section id="about" style={{padding:'120px 64px', background:V6.surface, position:'relative'}}>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1.5fr', gap:80, maxWidth:1280, margin:'0 auto'}}>
        <Reveal>
          <V6Pill color={V6.accent} bg={V6.accentSoft}>§ I — Chi sono</V6Pill>
          <h2 style={{
            fontFamily:V6.font, fontSize:64, fontWeight:600, color:V6.ink,
            margin:'24px 0 0', letterSpacing:'-0.035em', lineHeight:1,
          }}>
            Matteo<br/>Pizzi.
          </h2>
          <div style={{
            marginTop:28, padding:18, background:'#fff', border:`1px solid ${V6.rule}`,
            borderRadius:10, fontFamily:V6.mono, fontSize:12, color:V6.ink2, lineHeight:2,
            letterSpacing:'0.04em',
          }}>
            <div><span style={{color:V6.dim}}>// sede</span></div>
            <div>Roma, Italia</div>
            <div style={{marginTop:6}}><span style={{color:V6.dim}}>// stack</span></div>
            <div>Flutter · Next.js · Supabase · TypeScript</div>
            <div style={{marginTop:6}}><span style={{color:V6.dim}}>// dal</span></div>
            <div><span style={{color:V6.accent}}>2017</span></div>
          </div>
        </Reveal>
        <Reveal delay={140}>
          <div style={{fontFamily:V6.font, fontSize:21, lineHeight:1.55, color:V6.ink2, paddingTop:32}}>
            <p style={{margin:'0 0 24px'}}>
              Sviluppo software dal 2017. Ho lavorato in agenzie e team di prodotto;
              da qualche tempo dedico la maggior parte del tempo a progetti propri.
            </p>
            <p style={{margin:'0 0 24px'}}>
              <span style={{color:V6.accent, fontWeight:500}}>Fosforonero</span> è il nome
              sotto cui raggruppo questi progetti. Niente azienda, niente team —
              solo un punto unico per chi vuole sapere a cosa lavoro.
            </p>
            <p style={{margin:0, fontSize:17, color:V6.dim, paddingTop:24, borderTop:`1px solid ${V6.rule}`}}>
              Disponibile per consulenze tecniche, sviluppo di prototipi e
              supporto a progetti esistenti. Per richieste, contattami via email.
            </p>
          </div>
        </Reveal>
      </div>
    </section>

    {/* PROJECTS */}
    <section id="progetti" style={{padding:'120px 64px', position:'relative'}}>
      <Reveal>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:48}}>
          <div>
            <V6Pill color={V6.accent} bg={V6.accentSoft}>§ II — Progetti</V6Pill>
            <h2 style={{
              fontFamily:V6.font, fontSize:72, fontWeight:600, color:V6.ink,
              margin:'14px 0 0', letterSpacing:'-0.04em', lineHeight:1,
            }}>Progetti.</h2>
          </div>
          <div style={{fontFamily:V6.mono, fontSize:12, color:V6.dim, textAlign:'right', letterSpacing:'0.16em', lineHeight:1.8}}>
            02 ATTIVI · 01 IN SVILUPPO
          </div>
        </div>
      </Reveal>
      <div style={{display:'flex', flexDirection:'column', gap:24}}>
        {PROJECTS.map((p,i) => (
          <Reveal key={p.id} delay={i * 90}>
            <V6Project p={p} idx={i}/>
          </Reveal>
        ))}
        <Reveal delay={180}>
          <div style={{
            background:'#fff', border:`1px dashed ${V6.rule}`, borderRadius:14,
            padding:'32px 36px', display:'flex', justifyContent:'space-between', alignItems:'center',
          }}>
            <div style={{display:'flex', gap:14, alignItems:'center'}}>
              <V6Pill color={V6.dim}>03 · IN SVILUPPO</V6Pill>
              <div style={{fontSize:24, color:V6.dim, fontWeight:500}}>
                Progetto non ancora pubblico<Cursor color={V6.accent} h={20}/>
              </div>
            </div>
            <span style={{fontFamily:V6.mono, fontSize:12, color:V6.dim, fontWeight:600, letterSpacing:'0.24em'}}>PROSSIMAMENTE</span>
          </div>
        </Reveal>
      </div>
    </section>

    {/* BLOG */}
    <section id="blog" style={{padding:'120px 64px', background:V6.surface, position:'relative'}}>
      <Reveal>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:48, maxWidth:1280, margin:'0 auto 48px'}}>
          <div>
            <V6Pill color={V6.accent} bg={V6.accentSoft}>§ III — Scritti</V6Pill>
            <h2 style={{
              fontFamily:V6.font, fontSize:72, fontWeight:600, color:V6.ink,
              margin:'14px 0 12px', letterSpacing:'-0.04em', lineHeight:1,
            }}>Note tecniche.</h2>
            <p style={{
              fontFamily:V6.font, fontSize:18, color:V6.ink2, opacity:0.75,
              margin:0, maxWidth:520, lineHeight:1.5,
            }}>
              Note di lavoro, retrospettive di progetti, scelte tecniche.
              Aggiornato quando ho qualcosa di concreto da raccontare.
            </p>
          </div>
          <a href="/blog" className="fn-link-underline" style={{
            fontFamily:V6.mono, fontSize:12, color:V6.ink, letterSpacing:'0.16em',
            textDecoration:'none', fontWeight:600,
          }}>
            TUTTI GLI ARTICOLI <span style={{color:V6.accent}}>→</span>
          </a>
        </div>
      </Reveal>
      <div style={{display:'flex', flexDirection:'column', gap:14, maxWidth:1280, margin:'0 auto'}}>
        {BLOG_POSTS.map((post, i) => (
          <Reveal key={post.slug} delay={i * 80}>
            <V6BlogRow post={post} idx={i}/>
          </Reveal>
        ))}
      </div>
    </section>

    {/* CONTACT */}
    <section id="contatti" style={{padding:'120px 64px', position:'relative'}}>
      <div style={{maxWidth:1280, margin:'0 auto'}}>
        <Reveal>
          <V6Pill color={V6.accent} bg={V6.accentSoft}>§ IV — Contatti</V6Pill>
          <h2 style={{
            fontFamily:V6.font, fontSize:112, fontWeight:600, color:V6.ink,
            margin:'24px 0 0', letterSpacing:'-0.045em', lineHeight:0.95,
          }}>Contatti.</h2>
          <p style={{fontSize:22, color:V6.ink2, opacity:0.75, maxWidth:620, marginTop:24, lineHeight:1.45}}>
            Per qualsiasi richiesta, scrivere direttamente all'indirizzo email. Rispondo entro pochi giorni.
          </p>
        </Reveal>
        <Reveal delay={120}>
          <a href="mailto:matteo@fosforonero.com" style={{
            marginTop:48, display:'flex', gap:14, alignItems:'center',
            padding:'18px 22px', background:'#fff', border:`1.5px solid ${V6.ink}`,
            borderRadius:14, maxWidth:580, textDecoration:'none',
            boxShadow:`0 2px 0 ${V6.ink}, 0 12px 32px rgba(10,10,10,0.08)`,
          }}>
            <span style={{
              fontFamily:V6.mono, fontSize:11, color:V6.dim, letterSpacing:'0.16em',
              padding:'4px 8px', background:V6.surface, borderRadius:4,
            }}>EMAIL</span>
            <span style={{fontFamily:V6.font, fontSize:22, color:V6.ink, fontWeight:500}}>
              matteo@fosforonero.com
            </span>
            <span style={{flex:1}}/>
            <span style={{color:V6.accent, fontSize:22, fontWeight:600}}>↗</span>
          </a>
        </Reveal>
        <Reveal delay={200}>
          <div style={{display:'flex', gap:14, marginTop:18, flexWrap:'wrap'}}>
            {[
              ['GitHub', 'github.com/fosforonero', 'https://github.com/fosforonero'],
              ['LinkedIn', 'in/matteopizzi', 'https://linkedin.com/in/matteopizzi'],
              ['Hugging Face', 'huggingface.co/fosforonero', 'https://huggingface.co/fosforonero'],
            ].map(([k,v,href]) => (
              <a key={k} href={href} target="_blank" rel="noopener noreferrer" className="fn-card-hover" style={{
                padding:'14px 20px', background:'#fff', border:`1px solid ${V6.rule}`,
                borderRadius:10, textDecoration:'none', display:'flex', gap:10, alignItems:'center',
                boxShadow:'0 1px 3px rgba(10,10,10,0.04)',
              }}>
                <span style={{fontFamily:V6.mono, fontSize:10, color:V6.dim, letterSpacing:'0.16em'}}>{k.toUpperCase()}</span>
                <span style={{fontFamily:V6.font, fontSize:14, color:V6.ink, fontWeight:500}}>{v}</span>
                <span style={{color:V6.accent}}>↗</span>
              </a>
            ))}
          </div>
        </Reveal>
      </div>
    </section>

    {/* FOOTER */}
    <footer style={{
      padding:'48px 64px', borderTop:`1px solid ${V6.rule}`,
      display:'flex', justifyContent:'space-between', alignItems:'flex-end',
    }}>
      <div>
        <P15Box size={28} color={V6.accent} dim={V6.dim} label=""/>
        <div style={{fontFamily:V6.mono, fontSize:11, color:V6.dim, marginTop:14, letterSpacing:'0.12em'}}>
          © MMXXVI · FOSFORONERO · ROMA, ITALIA
        </div>
      </div>
      <div style={{fontFamily:V6.mono, fontSize:11, color:V6.dim, textAlign:'right', letterSpacing:'0.12em', lineHeight:1.8}}>
        Matteo Pizzi · Sviluppatore<br/>
        <span style={{color:V6.accent, fontWeight:600}}>● Attivo dal 2017</span>
      </div>
    </footer>
  </div>
);

window.VariantCoolStudio = VariantCoolStudio;
