import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import Documentation from './pages/Documentation'
import Api from './pages/Api'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Documentation />} />
        <Route path="/api" element={<Api />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
