import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api, type ChecklistTemplate } from '../api/client';

export function DeprisaCheck() {
  const [searchParams] = useSearchParams();
  const merchandiseId = searchParams.get('merchandiseId');
  const merchandiseTypeIdParam = searchParams.get('merchandiseTypeId');
  const [templates, setTemplates] = useState<ChecklistTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ChecklistTemplate | null>(null);
  const [responses, setResponses] = useState<Record<string, string | boolean>>({});
  const [checklistId, setChecklistId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const typeId = merchandiseTypeIdParam;
    if (merchandiseId && typeId) {
      api
        .getChecklistTemplates(typeId, 'airport_ato')
        .then((t) => {
          setTemplates(t);
          if (t.length > 0 && !selectedTemplate) setSelectedTemplate(t[0]);
        })
        .catch((e) => setError(e.message));
    } else if (merchandiseId && !typeId) {
      setError('Falta merchandiseTypeId. Inicie admisión desde el flujo de admisión.');
    } else {
      setError('Falta merchandiseId en la URL');
    }
  }, [merchandiseId, merchandiseTypeIdParam]);

  const handleResponse = (itemId: string, value: string | boolean) => {
    setResponses((r) => ({ ...r, [itemId]: value }));
  };

  const handleSave = async () => {
    if (!merchandiseId || !selectedTemplate) return;
    setLoading(true);
    setError('');
    try {
      const created = await api.createChecklist({
        merchandiseId,
        templateId: selectedTemplate.id,
        responses,
      });
      setChecklistId(created.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!checklistId) {
      setError('Primero guarde la lista');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.submitChecklist(checklistId);
      setSubmitted(true);
      if (!res.accepted) setError('Lista incompleta o rechazada');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
    }
  };

  if (!merchandiseId) {
    return (
      <div className="page">
        <p className="error">Inicie una admisión con mercancía peligrosa/especial para acceder a DeprisaCheck.</p>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>DeprisaCheck - Lista de Comprobación</h1>
      <p>Mercancía ID: {merchandiseId}</p>
      {error && <p className="error">{error}</p>}
      {submitted ? (
        <div className="result-box">
          <p>Proceso completado.</p>
        </div>
      ) : (
        <>
          {templates.length > 0 && (
            <div className="checklist-section">
              <h3>{selectedTemplate?.name}</h3>
              <div className="checklist-items">
                {selectedTemplate?.items.map((item) => (
                  <label key={item.id} className="checklist-item">
                    <span>{item.text} {item.required && '*'}</span>
                    <input
                      type="checkbox"
                      checked={!!responses[item.id]}
                      onChange={(e) => handleResponse(item.id, e.target.checked)}
                    />
                  </label>
                ))}
              </div>
              <div className="button-group">
                <button onClick={handleSave} disabled={loading}>
                  {loading ? 'Guardando...' : 'Guardar lista'}
                </button>
                {checklistId && (
                  <button onClick={handleSubmit} disabled={loading}>
                    Enviar para aceptación
                  </button>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
