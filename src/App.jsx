import { useEffect, useRef, useCallback, useState } from 'react'
import './App.css'

function Link({ href, children }) {
  const aRef = useRef(null)    // mäter reservedWidth från ::before (DM Sans)
  const spanRef = useRef(null) // tar emot letter-spacing (inte ::before)

  const handleMouseEnter = useCallback(() => {
    const a = aRef.current
    const span = spanRef.current
    if (!a || !span) return

    // reservedWidth = <a>-bredden = DM Sans-bredden (styrs av ::before)
    const reservedWidth = a.getBoundingClientRect().width

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
      span.style.letterSpacing = `${gap / (n - 1)}px`
    }
    // Lås <a>-bredden explicit så att span-expansionen inte drar med underlinjen
    a.style.width = `${reservedWidth}px`
  }, [children])

  const handleMouseLeave = useCallback(() => {
    if (!spanRef.current || !aRef.current) return
    spanRef.current.style.letterSpacing = ''
    aRef.current.style.width = ''
  }, [])

  return (
    <a
      ref={aRef}
      href={href}
      data-label={children}
      target="_blank"
      rel="noreferrer"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span ref={spanRef}>{children}</span>
    </a>
  )
}

function NavButton({ onClick, children, className = '' }) {
  const buttonRef = useRef(null)
  const spanRef = useRef(null)

  const handleMouseEnter = useCallback(() => {
    const button = buttonRef.current
    const span = spanRef.current
    if (!button || !span) return

    const reservedWidth = button.getBoundingClientRect().width

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
      span.style.letterSpacing = `${gap / (n - 1)}px`
    }

    button.style.width = `${reservedWidth}px`
  }, [children])

  const handleMouseLeave = useCallback(() => {
    if (!spanRef.current || !buttonRef.current) return
    spanRef.current.style.letterSpacing = ''
    buttonRef.current.style.width = ''
  }, [])

  return (
    <button
      ref={buttonRef}
      type="button"
      className={className}
      data-label={children}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span ref={spanRef}>{children}</span>
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

function App() {
  const [page, setPage] = useState(() => window.location.pathname === '/everything-else' ? 'everythingElse' : 'home')

  useEffect(() => {
    document.title = page === 'everythingElse'
      ? 'Everything else | Julius Reinholdsson'
      : 'Julius Reinholdsson'
  }, [page])

  useEffect(() => {
    const handlePopState = () => {
      setPage(window.location.pathname === '/everything-else' ? 'everythingElse' : 'home')
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const goToEverythingElse = () => {
    window.history.pushState({}, '', '/everything-else')
    setPage('everythingElse')
  }

  const goHome = () => {
    window.history.pushState({}, '', '/')
    setPage('home')
  }

  if (page === 'everythingElse') {
    return (
      <>
        <NavButton className="back-button" onClick={goHome}>
          Back
        </NavButton>

        <section className="projects-page">
          <div className="label">Everything else</div>
          <ul>
            <ProjectRow
              title="Polymarket arbitrge trader"
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
      </>
    )
  }

  return (
    <>
      <div className="header" itemScope itemType="https://schema.org/Person">
        <p className="greeting">Hello!</p>
        <p itemProp="description">
          I'm <span itemProp="name">Julius Reinholdsson</span>, a programmer chronically building new projects.
        </p>
      </div>

      <section>
        <div className="label">Background</div>
        <ul>
          <li>
            <div className="item-row">
              <div className="item-title">
                Bachelors in{' '}
                <Link href="https://www.kth.se/utbildning/civilingenjor/medieteknik/medieteknik-civilingenjor-300-hp-1.4150">
                  Media Technology
                </Link>
                {' '}at KTH
              </div>
              <span className="item-date">2023–2026</span>
            </div>
          </li>
          <li>
            <div className="item-row">
              <div className="item-title">
                TA in{' '}
                <Link href="https://www.kth.se/student/kurser/kurs/DD1331?l=en">
                  Computer Science
                </Link>
                {' '}and{' '}
                <Link href="https://www.kth.se/student/kurser/kurs/DT1175?l=en">
                  Sound Physics
                </Link>
              </div>
              <span className="item-date">2024–current</span>
            </div>
          </li>
          <li>
            <div className="item-row">
              <div className="item-title">
                Masters in{' '}
                <Link href="https://www.kth.se/en/studies/master/computer-science">
                  Computer Science
                </Link>
                {' '}at KTH
              </div>
              <span className="item-date">2026–2028</span>
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
                <Link href="https://github.com/asarnoj/Spra-kprogrammet">Language learning app</Link>
              </div>
              <span className="item-date">current</span>
            </div>
            <div className="item-meta">
              Generative linguistics &amp; atomic spaced repetition
            </div>
          </li>
          <li>
            <div className="item-row">
              <div className="item-title">
                Depth in pixel graphics
              </div>
              <span className="item-date">2025</span>
            </div>
            <div className="item-meta">
              Creating dimensional depth in 2D pixel art
            </div>
          </li>
          <li>
            <div className="item-row">
              <div className="item-title">
                <Link href="https://github.com/asarnoj/themixtapeproject4">Music sharing app</Link>
              </div>
              <span className="item-date">2025</span>
            </div>
            <div className="item-meta">
              An iOS and Android app in React Native
            </div>
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
    </>
  )
}

export default App
