import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api, type ChecklistTemplate, type MerchandiseType } from '../api/client';
import { useAuth } from '../context/AuthContext';

// Categorías según flujo PDF
const CATEGORY_LABELS: Record<string, string> = {
  especial: 'Mercancías especiales',
  peligrosa: 'Mercancías peligrosas',
};

interface TemplateItemExtended {
  id: string;
  text: string;
  required: boolean;
  order: number;
  segment?: string;
  rejectsOnYes?: boolean;
  hasExpansion?: boolean;
  expansionLabel?: string;
}

interface ChecklistTemplateExtended extends ChecklistTemplate {
  category?: string;
  merchandiseTypeCode?: string;
  items: TemplateItemExtended[];
}

interface MerchandiseTypeExtended extends MerchandiseType {
  category?: string;
}

export function DeprisaCheck() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const merchandiseId = searchParams.get('merchandiseId');
  const merchandiseTypeIdParam = searchParams.get('merchandiseTypeId');

  // Tipos y selección
  const [types, setTypes] = useState<MerchandiseTypeExtended[]>([]);
  const [selectedTypeId, setSelectedTypeId] = useState(merchandiseTypeIdParam ?? '');
  const [templates, setTemplates] = useState<ChecklistTemplateExtended[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ChecklistTemplateExtended | null>(null);

  // Formulario
  const [guideNumber, setGuideNumber] = useState('');
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [expansions, setExpansions] = useState<Record<string, string>>({});

  // Estado checklist
  const [checklistId, setChecklistId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Resultado
  const [result, setResult] = useState<'accepted' | 'rejected' | null>(null);
  const [rejectedNumerals, setRejectedNumerals] = useState<string[]>([]);

  // Rechazo
  const [clientEmail, setClientEmail] = useState('');
  const [observations, setObservations] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  // startTime queda registrado en el backend al crear el checklist (campo startTime del modelo)
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // Actualizar reloj cada segundo
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Cargar tipos de mercancía
  useEffect(() => {
    api.getMerchandiseTypes().then((t) => setTypes(t as MerchandiseTypeExtended[])).catch(console.error);
  }, []);

  // Cargar templates cuando se selecciona tipo
  useEffect(() => {
    if (!selectedTypeId) return;
    setError('');
    api
      .getChecklistTemplates(selectedTypeId, 'ato')
      .then((t) => {
        setTemplates(t as ChecklistTemplateExtended[]);
        if (t.length > 0) setSelectedTemplate(t[0] as ChecklistTemplateExtended);
        else setSelectedTemplate(null);
      })
      .catch((e) => setError(e.message));
  }, [selectedTypeId]);

  // Si viene desde admisión, cargar tipo automáticamente
  useEffect(() => {
    if (merchandiseTypeIdParam && merchandiseTypeIdParam !== selectedTypeId) {
      setSelectedTypeId(merchandiseTypeIdParam);
    }
  }, [merchandiseTypeIdParam]);

  // Calcular resultado en tiempo real basado en respuestas
  const computeRealTimeResult = useCallback((): 'accepted' | 'rejected' | 'incomplete' => {
    if (!selectedTemplate) return 'incomplete';
    const items = selectedTemplate.items as TemplateItemExtended[];
    const requiredItems = items.filter((i) => i.required);
    const allAnswered = requiredItems.every((i) => responses[i.id]);
    if (!allAnswered) return 'incomplete';

    const autoRejected = items.filter(
      (i) => i.rejectsOnYes && responses[i.id] === 'true'
    );
    return autoRejected.length > 0 ? 'rejected' : 'accepted';
  }, [selectedTemplate, responses]);

  const realtimeResult = computeRealTimeResult();

  const handleResponse = (itemId: string, value: string) => {
    setResponses((r) => ({ ...r, [itemId]: value }));
  };

  const handleExpansion = (itemId: string, value: string) => {
    setExpansions((e) => ({ ...e, [itemId]: value }));
  };

  const handleLimpiar = () => {
    setResponses({});
    setExpansions({});
    setGuideNumber('');
    setClientEmail('');
    setObservations('');
    setChecklistId(null);
    setResult(null);
    setRejectedNumerals([]);
    setEmailSent(false);
    setError('');
  };

  const handleSaveAndSubmit = async () => {
    if (!merchandiseId || !selectedTemplate) {
      setError('Seleccione una mercancía y lista de comprobación');
      return;
    }
    if (!guideNumber.trim()) {
      setError('El número de guía es obligatorio');
      return;
    }
    setLoading(true);
    setError('');
    try {
      // Guardar lista con respuestas + número de guía
      const responsesWithExpansions = { ...responses, ...expansions };
      const created = await api.createChecklist({
        merchandiseId,
        templateId: selectedTemplate.id,
        responses: responsesWithExpansions,
        guideNumber,
      });
      const cid = created.id;
      setChecklistId(cid);

      // Enviar para aceptación
      const res = await api.submitChecklist(cid, { clientEmail, observations });
      if (res.accepted) {
        setResult('accepted');
      } else {
        setResult('rejected');
        setRejectedNumerals(res.rejectedItemNumbers ?? []);
        if (res.emailSent) setEmailSent(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
    }
  };

  const handleSendRejectionEmail = async () => {
    if (!checklistId) return;
    setLoading(true);
    try {
      const res = await api.submitChecklist(checklistId, { clientEmail, observations });
      if (res.emailSent) setEmailSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar correo');
    } finally {
      setLoading(false);
    }
  };

  // Agrupar items por segmento
  const itemsBySegment: Record<string, TemplateItemExtended[]> = {};
  if (selectedTemplate) {
    for (const item of selectedTemplate.items as TemplateItemExtended[]) {
      const seg = item.segment ?? 'General';
      if (!itemsBySegment[seg]) itemsBySegment[seg] = [];
      itemsBySegment[seg].push(item);
    }
  }

  // Agrupar tipos por categoría para el menú
  const typesByCategory: Record<string, MerchandiseTypeExtended[]> = {};
  for (const t of types.filter((t) => t.requiresChecklist)) {
    const cat = (t as MerchandiseTypeExtended).category ?? 'other';
    if (!typesByCategory[cat]) typesByCategory[cat] = [];
    typesByCategory[cat].push(t as MerchandiseTypeExtended);
  }

  const formatDateTime = (d: Date) =>
    d.toLocaleString('es-CO', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });

  // ---- VISTA: Sin mercancía seleccionada ----
  if (!merchandiseId) {
    return (
      <div className="page">
        <section className="page-header">
          <h1>Aceptación de mercancías peligrosas y/o especiales</h1>
          {user && <p>Bienvenid@ <strong>{user.username.toUpperCase()}</strong>. Por favor seleccione la lista de comprobación de la mercancía que va a aceptar:</p>}
        </section>

        {/* Menú categorizado */}
        {Object.entries(typesByCategory).map(([cat, catTypes]) => (
          <div key={cat} className="checklist-category">
            <h3 className="category-title">{CATEGORY_LABELS[cat] ?? cat}</h3>
            <div className="checklist-type-grid">
              {catTypes.map((t) => (
                <button
                  key={t.id}
                  className={`type-card ${selectedTypeId === t.id ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedTypeId(t.id);
                    setSearchParams({ merchandiseTypeId: t.id });
                  }}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Formulario manual si viene sin merchandiseId */}
        {selectedTypeId && templates.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <p className="info">Para continuar, inicie una admisión en <strong>Nueva Admisión</strong> y será redirigido automáticamente con el ID de mercancía.</p>
          </div>
        )}
        {error && <p className="error">{error}</p>}

        {/* Timer */}
        <div className="checklist-timer">
          <span>Fecha y hora</span>
          <span>{formatDateTime(currentTime)}</span>
        </div>
      </div>
    );
  }

  // ---- VISTA: Resultado final ----
  if (result === 'accepted') {
    return (
      <div className="page">
        <section className="page-header">
          <h1>Lista de comprobación — {selectedTemplate?.name}</h1>
        </section>
        <div className="result-box accepted">
          <strong>Resultado proceso de aceptación: Envío aceptado</strong>
        </div>
        <div className="checklist-footer-bar">
          <div className="quick-links">
            <span>Verificado por: <strong>{user?.username?.toUpperCase()}</strong></span>
            <span>Fecha y hora de envío: <strong>{formatDateTime(new Date())}</strong></span>
          </div>
          <div className="footer-actions">
            <button className="btn-secondary" onClick={() => navigate('/')}>🏠 Inicio</button>
            <button className="btn-secondary" onClick={handleLimpiar}>Limpiar</button>
          </div>
        </div>
      </div>
    );
  }

  if (result === 'rejected') {
    return (
      <div className="page">
        <section className="page-header">
          <h1>Lista de comprobación — {selectedTemplate?.name}</h1>
        </section>
        <div className="result-box rejected">
          <strong>Resultado proceso de aceptación: Envío rechazado</strong>
        </div>

        <div className="rejection-form">
          <div className="rejection-comments">
            <label>Comentarios</label>
            <span>Se rechaza por los numerales: {rejectedNumerals.join(', ') || '—'}</span>
          </div>
          <div className="rejection-email">
            <label>Diligencie el correo para enviar copia de la lista al cliente *</label>
            <input
              type="email"
              placeholder="correo@cliente.com"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              disabled={emailSent}
            />
          </div>
          <div className="rejection-observations">
            <label>Observaciones</label>
            <textarea
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              disabled={emailSent}
              rows={3}
            />
          </div>
          {emailSent && <p className="success">Correo de rechazo enviado correctamente.</p>}
          {error && <p className="error">{error}</p>}
        </div>

        <div className="checklist-footer-bar">
          <div className="result-label rejected-label">Resultado proceso de aceptación: Envío rechazado</div>
          <div className="footer-actions">
            <button className="btn-secondary" onClick={() => navigate('/')}>🏠 Inicio</button>
            <button className="btn-secondary" onClick={handleLimpiar}>Limpiar</button>
            {!emailSent && (
              <button
                className="btn-danger"
                onClick={handleSendRejectionEmail}
                disabled={!clientEmail || loading}
              >
                {loading ? 'Enviando...' : 'Enviar correo'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ---- VISTA: Diligenciar lista ----
  return (
    <div className="page">
      <section className="page-header">
        <h1>Lista de comprobación — {selectedTemplate?.name ?? 'Cargando...'}</h1>
        <p>Mercancía ID: <strong>{merchandiseId}</strong></p>
      </section>

      {error && <p className="error">{error}</p>}

      {/* Número de guía (obligatorio, solo numérico) */}
      <div className="guide-number-row">
        <label>* Número de guía</label>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="Ej: 8880025254452"
          value={guideNumber}
          onChange={(e) => setGuideNumber(e.target.value.replace(/\D/g, ''))}
        />
      </div>

      {/* Items agrupados por segmento */}
      {Object.entries(itemsBySegment).map(([seg, items]) => (
        <div key={seg} className="checklist-segment">
          <div className="segment-header">SEGMENTO {seg}</div>
          {items.map((item) => (
            <div key={item.id} className={`checklist-item ${item.rejectsOnYes ? 'item-critical' : ''}`}>
              <span className="item-order">* {item.order}.</span>
              <span className="item-text">{item.text}</span>
              <div className="checklist-options">
                {(['true', 'false', 'na'] as const).map((val) => (
                  <label key={val} className="checklist-option">
                    <input
                      type="radio"
                      name={item.id}
                      value={val}
                      checked={responses[item.id] === val}
                      onChange={() => handleResponse(item.id, val)}
                    />
                    {val === 'true' ? 'Sí' : val === 'false' ? 'No' : 'N/A'}
                  </label>
                ))}
              </div>
              {/* Campo de ampliación: se habilita automáticamente al seleccionar Sí */}
              {item.hasExpansion && responses[item.id] === 'true' && (
                <div className="expansion-field">
                  <label>{item.expansionLabel ?? 'Ampliación'}</label>
                  <input
                    type="text"
                    value={expansions[item.id] ?? ''}
                    onChange={(e) => handleExpansion(item.id, e.target.value)}
                    placeholder="Detalle..."
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      ))}

      {/* Resultado en tiempo real */}
      {realtimeResult !== 'incomplete' && (
        <div className={`result-box-inline ${realtimeResult}`}>
          Resultado proceso de aceptación:{' '}
          <strong>{realtimeResult === 'accepted' ? 'Envío aceptado' : 'Envío rechazado'}</strong>
        </div>
      )}

      {/* Formulario de rechazo inline si el resultado ya indica rechazo */}
      {realtimeResult === 'rejected' && (
        <div className="rejection-form">
          <div className="rejection-email">
            <label>Diligencie el correo para enviar copia de la lista al cliente</label>
            <input
              type="email"
              placeholder="correo@cliente.com"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
            />
          </div>
          <div className="rejection-observations">
            <label>Observaciones</label>
            <textarea
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              rows={2}
            />
          </div>
        </div>
      )}

      {/* Barra inferior fija */}
      <div className="checklist-footer-bar">
        <div className="quick-links">
          <span>Fecha y hora</span>
          <span>{formatDateTime(currentTime)}</span>
        </div>
        <div className="footer-actions">
          <button className="btn-secondary" onClick={() => navigate('/')}>🏠 Inicio</button>
          <button className="btn-secondary" onClick={handleLimpiar}>Limpiar</button>
          <button
            className="btn-primary"
            onClick={handleSaveAndSubmit}
            disabled={loading || realtimeResult === 'incomplete' || !guideNumber}
          >
            {loading ? 'Procesando...' : realtimeResult === 'rejected' ? 'Enviar correo' : 'Continuar'}
          </button>
        </div>
      </div>
    </div>
  );
}
