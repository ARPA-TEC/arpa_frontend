import LoginForm from './Login'

function App() {
  const handleLogin = ({ email, password }) => {
    console.log('Login:', email, password)
  }

  return <LoginForm onLogin={handleLogin} />
}

export default App