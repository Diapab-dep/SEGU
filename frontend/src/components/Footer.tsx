import { useState, useEffect } from 'react';

export function Footer() {
  const [version, setVersion] = useState<string>('—');

  useEffect(() => {
    fetch('/api/version')
      .then((r) => r.json())
      .then((d) => setVersion(d.version ?? '—'))
      .catch(() => setVersion('—'));
  }, []);

  return (
    <footer className="footer">
      <span>Área de Tecnología</span>
      <span className="footer-version">v{version}</span>
    </footer>
  );
}
