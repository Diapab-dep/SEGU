import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="page">
      <h1>Bienvenido, {user?.username}</h1>
      <p className="role-badge">
        {user?.role === 'asesor' ? 'Asesor' : user?.role === 'admin' ? 'Administrador' : 'Supervisor'}
      </p>
      <div className="dashboard-cards">
        {user?.role === 'asesor' && (
          <>
            <Link to="/admission" className="card">
              <h3>Nueva Admisión</h3>
              <p>Iniciar proceso de admisión de mercancía</p>
            </Link>
            <Link to="/deprisacheck" className="card">
              <h3>DeprisaCheck</h3>
              <p>Diligenciar listas de comprobación</p>
            </Link>
          </>
        )}
        {user?.role === 'supervisor' && (
          <Link to="/supervisor" className="card">
            <h3>Supervisión</h3>
            <p>Ver admisiones en curso</p>
          </Link>
        )}
        {user?.role === 'admin' && (
          <>
            <Link to="/supervisor" className="card">
              <h3>Supervisión</h3>
              <p>Ver admisiones en curso</p>
            </Link>
            <Link to="/users" className="card">
              <h3>Usuarios</h3>
              <p>Gestionar usuarios y roles</p>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
