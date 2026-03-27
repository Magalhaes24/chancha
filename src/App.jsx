import { Routes, Route } from 'react-router-dom'
import Home      from './pages/Home'
import Bingo     from './pages/Bingo'
import Aura      from './pages/Aura'
import GuessSong from './pages/GuessSong'

export default function App() {
  return (
    <Routes>
      <Route path="/"           element={<Home />} />
      <Route path="/bingo"      element={<Bingo />} />
      <Route path="/aura"       element={<Aura />} />
      <Route path="/guess-song" element={<GuessSong />} />
    </Routes>
  )
}
