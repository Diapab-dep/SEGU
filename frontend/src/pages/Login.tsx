import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Footer } from '../components/Footer';

export function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [userList, setUserList] = useState<string[]>([]);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Cargar lista de usuarios habilitados para el dropdown (no requiere auth)
  useEffect(() => {
    fetch('/api/users/list-for-login')
      .then((r) => r.json())
      .then((data: { username: string }[]) => setUserList(data.map((u) => u.username)))
      .catch(() => setUserList([]));
  }, []);

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!username || !password) return;
    setLoading(true);
    setError('');
    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-card-header">
          <img src="/deprisa-logo-login.png" alt="Deprisa" className="login-logo" />
        </div>
        <div className="login-card-body">
          <div className="login-notice">
            <p>
              ¡Bienvenid@! Está accediendo a un sistema que contiene datos de carácter confidencial,
              restringido a usuarios autorizados por la Gerencia de Seguridad Integral de Deprisa, por
              ende, al acceder autoriza el tratamiento de sus datos en cumplimiento de la legislación
              vigente en materia de protección de datos de carácter personal.
            </p>
            <p>
              <strong>
                Pulsando el botón &quot;Ingresar&quot; declara que posee los entrenamientos vigentes
                requeridos por Deprisa para aceptar una mercancía peligrosa y/o especial.
              </strong>
            </p>
            <p>
              RECUERDE: El uso de las credenciales para ingresar a este sistema son de uso personal e
              intransferible, quedando prohibido el uso por otro funcionario para cualquier efecto, así
              como también ceder los datos a personas ajenas por un tiempo parcial o total.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <label className="login-label">
              Seleccione su usuario
              <div className="select-wrapper">
                <select
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={loading}
                >
                  <option value="">-- Seleccione --</option>
                  {userList.map((u) => (
                    <option key={u} value={u}>
                      {u.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
            </label>

            <label className="login-label">
              Contraseña
              <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
            </label>

            {error && <p className="error">{error}</p>}

            <button type="submit" className="btn-primary btn-full" disabled={loading || !username}>
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          <p className="login-forgot">
            ¿Olvidó su usuario/clave o desea registrarse para ingresar al sistema?<br />
            Por favor contactarse con su líder o enviar correo a{' '}
            <a href="mailto:david.jaramillo@deprisa.com">david.jaramillo@deprisa.com</a>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
