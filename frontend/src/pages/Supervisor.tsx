import { useAuth } from '../context/AuthContext';

export function Supervisor() {
  const { user } = useAuth();

  return (
    <div className="page">
      <h1>Panel de Supervisión</h1>
      <p>Bienvenido, {user?.username}</p>
      <div className="info-box">
        <p>En esta vista podrá consultar admisiones en curso, estados y métricas.</p>
        <p><em>Funcionalidad en desarrollo: integración con endpoint de listado de admisiones.</em></p>
      </div>
    </div>
  );
}
