import { useEffect, useRef, useState } from 'react'
import { projects } from '../data/projects'

function ProjectImage({ project }) {
  const [failedImage, setFailedImage] = useState(null)
  if (project.image && failedImage !== project.image) {
    return <img src={project.image} alt={project.imageAlt || `${project.title} screenshot`} loading="lazy" className="aspect-[16/10] w-full object-cover" onError={() => setFailedImage(project.image)} />
  }
  return (
    <div className="project-grid relative flex aspect-[16/10] items-center justify-center overflow-hidden bg-[#172820] p-8" role="img" aria-label={`${project.title}: screenshot coming soon`}>
      <div aria-hidden="true" className="w-full max-w-xs rounded-lg border border-mint/20 bg-ink/90 shadow-2xl transition duration-500 group-hover:-translate-y-1">
        <div className="flex items-center gap-1.5 border-b border-line px-4 py-3"><span className="size-1.5 rounded-full bg-mint/70" /><span className="size-1.5 rounded-full bg-mint/30" /><span className="size-1.5 rounded-full bg-mint/15" /><span className="ml-auto font-sans text-[9px] text-muted">{project.preview === 'server' ? 'server / workspace' : 'java / decoder'}</span></div>
        <div className="space-y-3 p-5 font-sans text-[11px] sm:text-xs">
          {project.preview === 'server' ? <><p className="text-muted">$ building the foundation</p><p className="text-mint">request <span className="text-muted">→</span> server <span className="text-muted">→</span> response</p><div className="mt-5 flex gap-2">{[1, 2, 3, 4, 5, 6, 7].map(n => <span key={n} className={`h-7 flex-1 rounded-sm ${n < 5 ? 'bg-mint/30' : 'bg-mint/5'}`} />)}</div></> : <><p className="text-muted">Java / Unicode input</p><p className="pl-4 text-mint">{"\\u0048 \\u0069"} <span className="text-muted">→</span> Hi</p><p className="text-muted">decoded text</p><div className="flex gap-2 border-t border-line pt-3"><span className="h-1.5 w-1/2 rounded bg-mint/40" /><span className="h-1.5 w-1/4 rounded bg-mint/15" /></div></>}
        </div>
      </div>
      <span className="absolute bottom-3 left-4 font-sans text-[9px] tracking-widest text-muted uppercase">Illustrative placeholder · screenshot coming soon</span>
    </div>
  )
}

function ProjectModal({ project, onClose }) {
  const dialogRef = useRef(null)
  useEffect(() => {
    const dialog = dialogRef.current
    const previousOverflow = document.body.style.overflow
    dialog.showModal()
    document.body.style.overflow = 'hidden'
    return () => {
      dialog.close()
      document.body.style.overflow = previousOverflow
    }
  }, [])

  return <dialog ref={dialogRef} aria-labelledby="project-title" onClose={onClose} onClick={event => { if (event.target === event.currentTarget) onClose() }} className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto rounded-2xl border border-line bg-surface p-0 text-paper shadow-2xl">
    <div className="relative">
      <button type="button" autoFocus onClick={onClose} aria-label="Close project details" className="absolute top-4 right-4 z-10 flex size-10 items-center justify-center rounded-full border border-line bg-ink text-xl hover:text-mint">×</button>
      <ProjectImage project={project} />
      <div className="p-6 sm:p-9"><p className="eyebrow">{project.category} / {project.status}</p><h2 id="project-title" className="mt-4 text-3xl font-medium tracking-tight">{project.title}</h2><p className="mt-5 leading-8 text-muted">{project.description}</p><div className="mt-6 flex flex-wrap gap-2">{project.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}</div>
        {(project.githubUrl || project.liveUrl) && <div className="mt-8 flex flex-wrap gap-3">{project.githubUrl && <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="secondary-button">View source ↗</a>}{project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="primary-button">Live project ↗</a>}</div>}
      </div>
    </div>
  </dialog>
}

export default function Projects() {
  const [selectedProject, setSelectedProject] = useState(null)
  return <section id="work" className="border-y border-line bg-surface/40">
    <div className="page-width section-space">
      <div className="flex flex-wrap items-end justify-between gap-6"><div><p className="eyebrow">01 / Selected work</p><h2 className="section-heading mt-5">Built to solve.<br /><span className="text-muted">Made to evolve.</span></h2></div><p className="max-w-xs text-sm leading-7 text-muted">A look at what I’m building, what I’m exploring, and the problems that keep me curious.</p></div>
      <div className="mt-12 grid gap-7 md:grid-cols-2">{projects.map((project, index) => <article key={project.id} className="group overflow-hidden rounded-xl border border-line bg-ink transition hover:border-mint/50">
        <ProjectImage project={project} />
        <div className="p-6 sm:p-7"><div className="flex items-center justify-between gap-3"><p className="font-sans text-[10px] tracking-widest text-muted uppercase">{String(index + 1).padStart(2, '0')} / {project.category}</p><span className="flex shrink-0 items-center gap-2 text-[10px] text-mint"><span className="size-1.5 rounded-full bg-mint" />{project.status}</span></div><h3 className="mt-5 text-2xl font-medium tracking-tight">{project.title}</h3><p className="mt-3 text-sm leading-7 text-muted">{project.summary}</p><div className="mt-5 flex flex-wrap gap-2">{project.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}</div><button type="button" onClick={() => setSelectedProject(project)} aria-label={`Explore ${project.title}`} className="mt-7 flex w-full items-center justify-between border-t border-line pt-5 text-sm hover:text-mint">Explore project <span aria-hidden="true" className="text-xl text-mint">↗</span></button></div>
      </article>)}</div>
      <p className="mt-7 font-sans text-[11px] text-muted">Always building. More work on the way.</p>
    </div>
    {selectedProject && <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />}
  </section>
}
