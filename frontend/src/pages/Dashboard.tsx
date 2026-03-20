import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Dashboard() {
  const { user } = useAuth();

  const roleLabel =
    user?.role === 'asesor'
      ? 'Asesor'
      : user?.role === 'admin'
        ? 'Administrador'
        : 'Supervisor';

  return (
    <div className="page page-dashboard">
      <section className="hero">
        <h1>DeprisaCheck</h1>
        <h2>El momento de la admisión de mercancía digital es ahora</h2>
        <p className="hero-desc">
          DeprisaCheck es la herramienta integral para gestionar el proceso de admisión de mercancía en puntos de venta ciudad y aeropuerto — control operativo, cumplimiento y listas de comprobación, todo en una sola plataforma.
        </p>
        <p className="hero-welcome">
          Bienvenido, <strong>{user?.username}</strong> — <span className="role-badge">{roleLabel}</span>
        </p>
      </section>

      <section className="platform-modules">
        <h3>Módulos disponibles</h3>
        <div className="dashboard-cards">
          {user?.role === 'asesor' && (
            <>
              <Link to="/admission" className="card card-module">
                <h4>Nueva Admisión</h4>
                <p>Inicie el proceso de admisión de mercancía. Seleccione tipo, cliente y punto de venta.</p>
              </Link>
              <Link to="/deprisacheck" className="card card-module">
                <h4>DeprisaCheck</h4>
                <p>Diligencie listas de comprobación para mercancía peligrosa o especial.</p>
              </Link>
            </>
          )}

          {(user?.role === 'supervisor' || user?.role === 'admin') && (
            <Link to="/supervisor" className="card card-module">
              <h4>Supervisión</h4>
              <p>Consulte admisiones en curso, estados y métricas operativas.</p>
            </Link>
          )}

          {user?.role === 'admin' && (
            <>
              <Link to="/users" className="card card-module">
                <h4>Usuarios</h4>
                <p>Gestione usuarios, roles, puntos de venta y habilitación DeprisaCheck.</p>
              </Link>
              <Link to="/points-of-sale" className="card card-module">
                <h4>Puntos de Venta</h4>
                <p>Cree y gestione los puntos de venta ciudad y aeropuerto disponibles en la plataforma.</p>
              </Link>
              <Link to="/checklist-templates" className="card card-module">
                <h4>Plantillas de Checklist</h4>
                <p>Administre las plantillas y preguntas de los checklists por tipo de mercancía y POS.</p>
              </Link>
              <Link to="/client-restrictions" className="card card-module">
                <h4>Restricciones de Clientes</h4>
                <p>Defina qué tipos de mercancía están restringidos para cada cliente.</p>
              </Link>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
