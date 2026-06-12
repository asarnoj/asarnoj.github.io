import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const mq = window.matchMedia('(prefers-color-scheme: dark)')
const faviconLink = document.querySelector("link[rel='icon']")
function updateFavicon() {
  faviconLink.href = mq.matches ? '/portfolio-emoji.svg' : '/portfolio-emoji-dark.svg'
}
mq.addEventListener('change', updateFavicon)
updateFavicon()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
