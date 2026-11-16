import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { installBasePath } from './lib/basePath'

installBasePath()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Pages written by the build carry a rendered copy of themselves (#a3-snapshot, see scripts/snapshot.js) so the largest
// element paints before this script has run. The live app above renders into the normal #root, hidden beside it by a
// style in that file. Once it has rendered and its entrance animations have settled, the snapshot is removed, which also
// reveals #root in the same place, so nothing visible changes. A snapshot that never gets removed is harmless.
const snapshot = document.getElementById('a3-snapshot')
if (snapshot) {
  const started = performance.now()
  const root = document.getElementById('root')
  const settled = () => root.getAnimations?.({ subtree: true }).every((animation) => {
    const timing = animation.effect?.getComputedTiming()
    return !timing || timing.iterations === Infinity || animation.playState !== 'running'
  }) ?? true
  const ready = () => root.querySelector('main') && !root.querySelector('[role="status"]') && settled()
  const check = () => {
    if (ready() || performance.now() - started > 4000) {
      const y = window.scrollY
      snapshot.remove()
      if (window.scrollY !== y) window.scrollTo(0, y)
    } else {
      setTimeout(check, 100)
    }
  }
  setTimeout(check, 100)
}
