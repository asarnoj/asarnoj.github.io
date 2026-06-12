import { useEffect, useRef, useCallback, useState } from 'react'
import './App.css'

const MOBILE_BREAKPOINT = 900 // px — matchar CSS-mediaqueries nedan

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    () => window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`).matches
  )
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`)
    const handler = (e) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return isMobile
}

// Gemensam logik för Caveat letter-spacing-kompensation
function useFontSwapHandlers(children) {
  const outerRef = useRef(null)
  const innerRef = useRef(null)

  const handleMouseEnter = useCallback(() => {
    const outer = outerRef.current
    const inner = innerRef.current
    if (!outer || !inner) return

    const reservedWidth = outer.getBoundingClientRect().width

    const probe = document.createElement('span')
    probe.style.cssText = [
      'position:fixed', 'top:-9999px', 'left:-9999px',
      'visibility:hidden', 'pointer-events:none',
      'font-family:CaveatFitted,cursive', 'font-weight:500',
      'font-size:16px', 'white-space:nowrap', 'letter-spacing:0',
    ].join(';')
    probe.textContent = children
    document.body.appendChild(probe)
    const caveatWidth = probe.getBoundingClientRect().width
    document.body.removeChild(probe)

    const gap = reservedWidth - caveatWidth
    const n = children.length
    if (n > 1 && Math.abs(gap) > 0.1) {
      inner.style.letterSpacing = `${gap / (n - 1)}px`
    }
    outer.style.width = `${reservedWidth}px`
  }, [children])

  const handleMouseLeave = useCallback(() => {
    if (!innerRef.current || !outerRef.current) return
    innerRef.current.style.letterSpacing = ''
    outerRef.current.style.width = ''
  }, [])

  return { outerRef, innerRef, handleMouseEnter, handleMouseLeave }
}

// Extern länk – leaving-icon utanför <a> så att bredduträkningen inte störs
function Link({ href, children }) {
  const { outerRef, innerRef, handleMouseEnter, handleMouseLeave } =
    useFontSwapHandlers(children)

  return (
    <span
      className="link-wrapper"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <a
        ref={outerRef}
        href={href}
        data-label={children}
        target="_blank"
        rel="noreferrer"
      >
        <span ref={innerRef}>{children}</span>
      </a>
      <img src="/leaving-page-icon.svg" className="leaving-icon leaving-icon--default" alt="" aria-hidden="true" draggable="false" />
      <img src="/leaving-page-icon-hover.svg" className="leaving-icon leaving-icon--hover" alt="" aria-hidden="true" draggable="false" />
    </span>
  )
}

// Klickbart element utan extern länk – font-swap på hover, öppnar panel/sida på click
function HoverableText({ children, onClick }) {
  const { outerRef, innerRef, handleMouseEnter, handleMouseLeave } =
    useFontSwapHandlers(children)

  return (
    <span
      ref={outerRef}
      className="hoverable-text"
      data-label={children}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      <span ref={innerRef}>{children}</span>
    </span>
  )
}

// Knapp med Caveat-swap (Back, Everything else)
function NavButton({ onClick, children, className = '' }) {
  const { outerRef, innerRef, handleMouseEnter, handleMouseLeave } =
    useFontSwapHandlers(children)

  return (
    <button
      ref={outerRef}
      type="button"
      className={className}
      data-label={children}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span ref={innerRef}>{children}</span>
    </button>
  )
}

function ProjectRow({ title, year, meta, href }) {
  const titleContent = href ? <Link href={href}>{title}</Link> : title
  return (
    <li>
      <div className="item-row">
        <div className="item-title">{titleContent}</div>
        <span className="item-date">{year}</span>
      </div>
      <div className="item-meta">{meta}</div>
    </li>
  )
}

// Höger panel / mobilsida – samma komponent i båda lägena
function RightPanelContent({ id }) {
  if (!id) return null

  if (id === 'name') {
    return (
      <div>
        <div className="detail-panel-title">Julius Reinholdsson</div>
        <div className="detail-panel-body">
          Placeholder – här kommer lite info om mig.
        </div>
      </div>
    )
  }

  const panels = {
    'langapp': {
      title: 'Language learning app',
      body: 'Generative linguistics & atomic spaced repetition. Placeholder – projektbeskrivning kommer här.',
      github: 'https://github.com/asarnoj/Spra-kprogrammet',
    },
    'pixeldepth': {
      title: 'Depth in pixel graphics',
      body: 'Creating dimensional depth in 2D pixel art. Placeholder – projektbeskrivning kommer här.',
      github: null,
    },
    'mixtape': {
      title: 'The Mixtape Project',
      website: 'https://themixtapeproject.online',
      github: 'https://github.com/asarnoj/themixtapeproject4',
      video: '/mixtape-showcase.mp4',
      body: [
        "I had this really simple idea that I've never seen on the internet before.",
        'The concept for the website is: each week you share one song recommendation and a text about what it means to you, like a personal story or just your thoughts on the track. And in return, you get five back.',
        "I've noticed that when a song recommendation has a story, it immediately becomes much more interesting and moving to listen to. And so far, the texts people write have been surprisingly thoughtful.",
        'To keep it personal, you rank the songs you receive, which helps the system map out music tastes and make your weekly recommendations a lot more personalized over time.',
      ],
    },
  }

  const panel = panels[id]
  if (!panel) return null

  const paragraphs = Array.isArray(panel.body) ? panel.body : [panel.body]

  return (
    <div>
      <div className="detail-panel-header">
        <div className="detail-panel-title">{panel.title}</div>
        {panel.website && <Link href={panel.website}>themixtapeproject.online</Link>}
        {panel.github && <Link href={panel.github}>GitHub</Link>}
      </div>
      {panel.video && (
        <video
          className="detail-panel-video"
          src={panel.video}
          autoPlay
          loop
          muted
          playsInline
        />
      )}
      {paragraphs.map((text, i) => (
        <p key={i} className="detail-panel-body">{text}</p>
      ))}
    </div>
  )
}

function App() {
  const isMobile = useIsMobile()
  const [page, setPage] = useState(
    () => window.location.pathname === '/everything-else' ? 'everythingElse' : 'home'
  )
  const [activePanel, setActivePanel] = useState(null)

  // Titel
  useEffect(() => {
    document.title = page === 'everythingElse'
      ? 'Everything else | Julius Reinholdsson'
      : 'Julius Reinholdsson'
  }, [page])

  // Browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      setPage(window.location.pathname === '/everything-else' ? 'everythingElse' : 'home')
      setActivePanel(null)
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // På mobil: navigera till detaljsida. På desktop: visa höger panel.
  const openPanel = useCallback((id) => {
    setActivePanel(id)
    if (isMobile) setPage('detail')
  }, [isMobile])

  const goToEverythingElse = () => {
    window.history.pushState({}, '', '/everything-else')
    setPage('everythingElse')
  }

  const goHome = () => {
    window.history.pushState({}, '', '/')
    setPage('home')
    setActivePanel(null)
  }

  // ── Detaljsida (mobil) ──────────────────────────────────────────
  if (page === 'detail') {
    return (
      <div className="single-pane">
        <NavButton className="back-button" onClick={goHome}>Back</NavButton>
        <RightPanelContent id={activePanel} />
      </div>
    )
  }

  // ── Everything else ─────────────────────────────────────────────
  if (page === 'everythingElse') {
    return (
      <div className="single-pane">
        <NavButton className="back-button" onClick={goHome}>Back</NavButton>
        <section className="projects-page">
          <div className="label">Everything else</div>
          <ul>
            <ProjectRow
              title="Polymarket arbitrage trader"
              year="2026–current"
              meta="A trading bot that finds arbitrage over time on cryptocurrency 5-minute prediction markets."
            />
            <ProjectRow
              title="LinkedIn webscraper"
              year="2024"
              meta="My school chapter needed to earn money by letting companies conduct lunch seminars for us. I built a webscraper to collect 700+ companies located in Stockholm related to our studies, and an automated system to find relevant employees to automatically contact."
            />
            <ProjectRow
              title="How I got a first-hand apartment contract by coding"
              year="2026"
              meta="I'm gatekeeping the method but if you're interested, I can tell you more in private."
            />
            <ProjectRow
              title="Optimal Yahtzee player using dynamic programming"
              year="2025"
              meta="A mathematically perfect solution for the game Yahtzee."
            />
          </ul>
        </section>
      </div>
    )
  }

  // ── Startsida ────────────────────────────────────────────────────
  return (
    <div className="layout">
      <div className="left-pane">
        <div className="header" itemScope itemType="https://schema.org/Person">
          <p className="greeting">Hello!</p>
          <p itemProp="description">
            <img src="/portfolio-emoji.svg" className="inline-icon" alt="" aria-hidden="true" draggable="false" />I'm{' '}
            <HoverableText onClick={() => openPanel('name')}>
              Julius Reinholdsson
            </HoverableText>
            <span itemProp="name" style={{ display: 'none' }}>Julius Reinholdsson</span>
            , a programmer chronically building new projects.
          </p>
        </div>

        <section>
          <div className="label">Background</div>
          <ul>
            <li>
              <div className="item-row">
                <div className="item-title">
                  <img src="/icon-1.svg" className="inline-icon" alt="" aria-hidden="true" draggable="false" />Masters in{' '}
                  <Link href="https://www.kth.se/en/studies/master/computer-science">Computer Science</Link>
                  {' '}at KTH
                </div>
                <span className="item-date">2026–2028</span>
              </div>
            </li>
            <li>
              <div className="item-row">
                <div className="item-title">
                  <img src="/icon-2.svg" className="inline-icon" alt="" aria-hidden="true" draggable="false" />Bachelors in{' '}
                  <Link href="https://www.kth.se/utbildning/civilingenjor/medieteknik/medieteknik-civilingenjor-300-hp-1.4150">Media Technology</Link>
                  {' '}at KTH
                </div>
                <span className="item-date">2023–2026</span>
              </div>
            </li>
            <li>
              <div className="item-row">
                <div className="item-title">
                  <img src="/icon-3.svg" className="inline-icon" alt="" aria-hidden="true" draggable="false" />TA in{' '}
                  <Link href="https://www.kth.se/student/kurser/kurs/DD1331?l=en">Computer Science</Link>
                  {' '}and{' '}
                  <Link href="https://www.kth.se/student/kurser/kurs/DT1175?l=en">Sound Physics</Link>
                </div>
                <span className="item-date">2024–current</span>
              </div>
            </li>
          </ul>
        </section>

        <section>
          <div className="label">Selected projects</div>
          <ul>
            <li>
              <div className="item-row">
                <div className="item-title">
                  <img src="/icon-4.svg" className="inline-icon" alt="" aria-hidden="true" draggable="false" />
                  <HoverableText onClick={() => openPanel('langapp')}>Language learning app</HoverableText>
                </div>
                <span className="item-date">current</span>
              </div>
              <div className="item-meta">Generative linguistics &amp; atomic spaced repetition</div>
            </li>
            <li>
              <div className="item-row">
                <div className="item-title">
                  <img src="/icon-5.svg" className="inline-icon" alt="" aria-hidden="true" draggable="false" />
                  <HoverableText onClick={() => openPanel('pixeldepth')}>Depth in pixel graphics</HoverableText>
                </div>
                <span className="item-date">2025</span>
              </div>
              <div className="item-meta">Creating dimensional depth in 2D pixel art</div>
            </li>
            <li>
              <div className="item-row">
                <div className="item-title">
                  <img src="/icon-6.svg" className="inline-icon" alt="" aria-hidden="true" draggable="false" />
                  <HoverableText onClick={() => openPanel('mixtape')}>Music sharing app</HoverableText>
                </div>
                <span className="item-date">2025</span>
              </div>
              <div className="item-meta">An iOS and Android app in React Native</div>
            </li>
          </ul>
          <NavButton className="project-link-button" onClick={goToEverythingElse}>
            Everything else
          </NavButton>
        </section>

        <section>
          <div className="label">Languages</div>
          <ul>
            <li className="lang-row">
              <span className="lang-level">Native</span>
              <span>Swedish, <span className="code">Python</span></span>
            </li>
            <li className="lang-row">
              <span className="lang-level">Fluent</span>
              <span>English, <span className="code">JavaScript</span>, <span className="code">React</span></span>
            </li>
            <li className="lang-row">
              <span className="lang-level">Basics</span>
              <span>German, <span className="code">C++</span>, <span className="code">Java</span></span>
            </li>
          </ul>
        </section>

        <footer>
          <Link href="mailto:julius@reinholdsson.se">julius@reinholdsson.se</Link>
          <Link href="https://github.com/asarnoj">GitHub</Link>
          <Link href="https://www.linkedin.com/in/julius-reinholdsson/">LinkedIn</Link>
        </footer>
      </div>

      <div className="right-pane">
        <RightPanelContent id={activePanel} />
      </div>
    </div>
  )
}

export default App
