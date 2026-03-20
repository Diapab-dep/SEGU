import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Footer } from './Footer';

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="layout">
      <header className="header">
        <Link to="/" className="logo">
        <img src="/deprisa-logo.png" alt="Deprisa" className="logo-img" />
      </Link>
        <nav>
          {user?.role === 'asesor' && (
            <>
              <Link to="/">Inicio</Link>
              <Link to="/admission">Admisión</Link>
              <Link to="/deprisacheck">DeprisaCheck</Link>
            </>
          )}
          {(user?.role === 'supervisor' || user?.role === 'admin') && (
            <>
              <Link to="/">Inicio</Link>
              <Link to="/supervisor">Supervisión</Link>
            </>
          )}
          {user?.role === 'admin' && <Link to="/users">Usuarios</Link>}
        </nav>
        <div className="user">
          <span>{user?.username}</span>
          <button onClick={handleLogout}>Salir</button>
        </div>
      </header>
      <main className="main">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
