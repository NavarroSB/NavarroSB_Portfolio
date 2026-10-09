import { useState } from 'react'
import Projects from './components/Projects'
import { profile } from './data/projects'

const navigation = [['Work', 'work'], ['Expertise', 'expertise'], ['About', 'about']]

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-mint focus:p-4 focus:text-ink">Skip to content</a>
      <header className="border-b border-line">
        <div className="page-width relative flex h-24 items-center justify-between gap-6">
          <a href="#home" aria-label="Bradley Navarro home" className="flex items-center gap-3 font-semibold tracking-tight"><span className="flex size-10 items-center justify-center rounded-full border border-mint/40 font-sans text-sm text-mint">bn.</span><span>Bradley Navarro<span className="text-mint">.</span></span></a>
          <nav aria-label="Main navigation" className="hidden items-center gap-9 text-sm text-muted md:flex">{navigation.map(([label, id]) => <a key={id} href={`#${id}`} className="hover:text-mint">{label}</a>)}</nav>
          <a href="#contact" className="hidden items-center gap-6 rounded-full border border-line px-5 py-3 text-sm transition hover:border-mint hover:text-mint md:flex">Let’s talk <span aria-hidden="true">↗</span></a>
          <button type="button" className="rounded-lg border border-line px-4 py-2 text-sm md:hidden" aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? 'Close' : 'Menu'}</button>
          {menuOpen && <nav id="mobile-navigation" aria-label="Mobile navigation" className="absolute inset-x-0 top-24 z-30 flex flex-col border border-line bg-surface p-6 shadow-xl md:hidden">{[...navigation, ['Contact', 'contact']].map(([label, id]) => <a key={id} href={`#${id}`} onClick={() => setMenuOpen(false)} className="py-3 hover:text-mint">{label}</a>)}</nav>}
        </div>
      </header>
      <main id="main">
        <section id="home" className="page-width relative py-20 lg:pt-28 lg:pb-20">
          <div className="grid items-center gap-14 lg:grid-cols-[1.4fr_1fr] lg:gap-8">
            <div className="relative z-10">
              <p className="eyebrow mb-7 flex items-center gap-3"><span className="size-2 rounded-full bg-mint" /> Full-stack software developer</p>
              <h1 className="max-w-3xl text-[clamp(3rem,6.5vw,6.3rem)] leading-[1.04] font-medium tracking-[-0.065em]">Thoughtful<br />interfaces.<br /><span className="text-mint">Powerful backends.</span></h1>
              <p className="mt-8 max-w-lg text-base leading-8 text-muted sm:text-lg">I’m Bradley Navarro. I bring ideas to life through intuitive websites, purposeful applications, and the systems that power them.</p>
              <div className="mt-9 flex flex-wrap gap-4"><a href="#work" className="primary-button">Explore my work <span aria-hidden="true">↗</span></a><a href="#contact" className="secondary-button">Let’s build something <span aria-hidden="true">→</span></a></div>
            </div>
            <div aria-hidden="true" className="architecture relative mx-auto flex aspect-square w-full max-w-[430px] items-center justify-center">
              <div className="absolute inset-7 rounded-full border border-mint/10" /><div className="absolute inset-16 rounded-full border border-dashed border-mint/15" />
              <div className="relative w-[85%] -rotate-6 space-y-4">{[['01', 'The experience', 'React / Tailwind CSS', '⌘'], ['02', 'The engine', 'Node.js / Express', '⌁'], ['03', 'The foundation', 'MongoDB / Data', '▤']].map(([number, title, tech, icon], i) => <div key={number} className={`stack-layer flex items-center gap-5 rounded-xl border border-mint/20 bg-surface/95 p-5 shadow-2xl ${i === 1 ? 'translate-x-5' : ''}`}><span className="flex size-12 shrink-0 items-center justify-center rounded-lg border border-mint/20 bg-mint/5 text-3xl text-mint">{icon}</span><div className="flex-1"><p className="font-medium tracking-tight">{title}</p><p className="mt-1 font-sans text-[10px] text-muted sm:text-xs">{tech}</p></div><span className="self-start font-sans text-xs text-muted">{number}</span></div>)}</div>
              <span className="absolute right-0 bottom-4 rounded-full border border-line bg-ink px-4 py-2 font-sans text-[10px] tracking-widest text-muted">FROM INTERFACE TO INFRASTRUCTURE</span>
            </div>
          </div>
          <div className="mt-20 flex flex-wrap items-center justify-between gap-6 border-t border-line pt-7"><p className="font-sans text-[11px] tracking-widest text-muted uppercase">One developer. The whole stack.</p><div className="flex flex-wrap gap-x-8 gap-y-3 text-sm font-medium text-muted">{['React', 'Node.js', 'Express', 'MongoDB', 'Tailwind CSS'].map(tech => <span key={tech}>{tech}</span>)}</div></div>
        </section>
        <Projects />
        <section id="expertise" className="page-width section-space">
          <p className="eyebrow">02 / What I bring to the table</p>
          <div className="mt-5 grid gap-6 md:grid-cols-2 md:items-end"><h2 className="section-heading">From the first click<br />to the last query.</h2><p className="max-w-md leading-7 text-muted md:justify-self-end">A good product needs more than a great first impression. I connect considered design with the logic behind it.</p></div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">{[
            ['01', 'Interfaces that feel right.', 'Responsive websites and React interfaces that make the next step clear, on every screen.', ['React', 'JavaScript', 'Tailwind CSS']],
            ['02', 'Logic that does the work.', 'Backend services and APIs that connect your interface to the workflows behind your business.', ['Node.js', 'Express', 'REST APIs']],
            ['03', 'Data with a purpose.', 'Structured data and application flows that turn information into something useful.', ['MongoDB', 'Data parsing', 'Git']],
          ].map(([number, title, copy, skills]) => <article key={number} className="border-t border-line pt-7"><span className="font-sans text-xs text-mint">/{number}</span><h3 className="mt-7 text-xl font-medium tracking-tight">{title}</h3><p className="mt-4 leading-7 text-muted">{copy}</p><div className="mt-7 flex flex-wrap gap-2">{skills.map(skill => <span key={skill} className="tag">{skill}</span>)}</div></article>)}</div>
        </section>
        <section id="about" className="border-y border-line bg-surface/40"><div className="page-width section-space grid gap-12 md:grid-cols-[0.85fr_1.15fr] md:gap-20"><div><p className="eyebrow">03 / Behind the code</p><h2 className="section-heading mt-5">Curious by nature.<br /><span className="text-muted">Developer by craft.</span></h2></div><div><p className="text-xl leading-9 tracking-tight sm:text-2xl">I’m Bradley, a full-stack developer who enjoys understanding how things work—and making them work better.</p><p className="mt-6 leading-8 text-muted">My work spans the visible and the invisible: the interface someone interacts with, the server handling their request, and the data that ties it all together. From an HTML data parser to a web server in progress, I learn by building.</p><p className="mt-5 leading-8 text-muted">I bring that same curiosity to every project: understand the problem, keep the solution thoughtful, and pay attention to the details.</p><a href="#work" className="mt-7 inline-flex items-center gap-5 text-sm text-mint hover:underline">See what I’m building <span aria-hidden="true">↗</span></a></div></div></section>
        <section id="contact" className="page-width section-space text-center"><p className="eyebrow">04 / Your next idea starts here</p><h2 className="mt-7 text-[clamp(2.8rem,6vw,5.5rem)] leading-[1.08] font-medium tracking-[-0.06em]">Have something in mind?<br /><span className="text-mint">Let’s make it happen.</span></h2><p className="mx-auto mt-7 max-w-lg leading-8 text-muted">A website for your business. An application with a purpose. A developer for your team. I’d love to hear what you’re thinking.</p>{profile.email ? <a href={`mailto:${profile.email}`} className="primary-button mt-9">Start a conversation <span aria-hidden="true">↗</span></a> : <div className="mt-9 inline-flex flex-col items-center gap-3"><span className="rounded-full border border-line px-7 py-4 text-muted">Contact details coming soon</span><p className="text-xs text-muted">Direct inquiries will be available here shortly.</p></div>}</section>
      </main>
      <footer className="border-t border-line"><div className="page-width flex flex-col items-center justify-between gap-5 py-8 text-xs text-muted sm:flex-row"><p>© {new Date().getFullYear()} Bradley Navarro</p><p>Built with intention. React + Tailwind.</p><a href="#home" className="hover:text-mint">Back to top ↑</a></div></footer>
    </>
  )
}
export default App
