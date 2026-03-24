import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="dashboard-page">
      <div className="dashboard-page-header">
        <h1 className="dashboard-title">Dashboard</h1>
        <span className="dashboard-role-tag">
          {user?.role === 'asesor' ? 'Asesor' : user?.role === 'admin' ? 'Administrador' : 'Supervisor'}
        </span>
      </div>

      <div className="dashboard-welcome">
        <h2>Bienvenido, {user?.username}</h2>
        <p>Selecciona un módulo para continuar.</p>
      </div>

      <div className="dashboard-modules">
        {(user?.role === 'asesor' || user?.role === 'admin') && (
          <>
            <div className="module-card">
              <div className="module-card-icon module-icon-blue">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="12" y1="18" x2="12" y2="12"/>
                  <line x1="9" y1="15" x2="15" y2="15"/>
                </svg>
              </div>
              <h3>Nueva Admisión</h3>
              <p>Inicie el proceso de admisión de mercancía. Seleccione cliente, tipo y punto de venta.</p>
              <button className="module-btn module-btn-blue" onClick={() => navigate('/admission')}>
                Ir al módulo →
              </button>
            </div>

            <div className="module-card">
              <div className="module-card-icon module-icon-green">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 11l3 3L22 4"/>
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                </svg>
              </div>
              <h3>DeprisaCheck</h3>
              <p>Diligencie listas de comprobación para mercancía peligrosa o especial en puntos ATO.</p>
              <button className="module-btn module-btn-green" onClick={() => navigate('/deprisacheck')}>
                Ir al módulo →
              </button>
            </div>
          </>
        )}

        {(user?.role === 'supervisor' || user?.role === 'admin') && (
          <div className="module-card">
            <div className="module-card-icon module-icon-purple">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
              </svg>
            </div>
            <h3>Panel de Supervisión</h3>
            <p>Consulte admisiones en curso, estados y métricas operativas en tiempo real.</p>
            <button className="module-btn module-btn-purple" onClick={() => navigate('/supervisor')}>
              Ir al módulo →
            </button>
          </div>
        )}

        {user?.role === 'admin' && (
          <div className="module-card">
            <div className="module-card-icon module-icon-gray">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <h3>Gestión de Usuarios</h3>
            <p>Administre cuentas, roles, accesos y puntos de venta de los usuarios de la plataforma.</p>
            <button className="module-btn module-btn-blue" onClick={() => navigate('/users')}>
              Ir al módulo →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
