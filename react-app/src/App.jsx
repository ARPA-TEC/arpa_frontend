import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LoginForm from './Login'
import LoginEstudiante from './Login_estudiante'
import Vista_estudiante from './Vista_estudiante'
import DashboardAdmin from './DashboardAdmin'
import DashboardTutor from './DashboardTutor'

function App() {
  const handleLogin = ({ email, password }) => {
    console.log('Login:', email, password)
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginForm onLogin={handleLogin} />} />
        <Route path="/Login_estudiante" element={<LoginEstudiante />} />
        <Route path="/vista" element={<Vista_estudiante />} />
        <Route path="/dashboard/admin" element={<DashboardAdmin />} />
        <Route path="/dashboard/tutor" element={<DashboardTutor />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App