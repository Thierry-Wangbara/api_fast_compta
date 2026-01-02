import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import Documentation from './pages/Documentation'
import Api from './pages/Api'
import ServerInfo from './components/ServerInfo'

function App() {
  return (
    <BrowserRouter>
      <ServerInfo />
      <Routes>
        <Route path="/" element={<Documentation />} />
        <Route path="/api" element={<Api />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
