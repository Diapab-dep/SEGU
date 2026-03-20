import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, type AdmissionDetail as AdmissionDetailType } from '../api/client';

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pendiente',
  requires_deprisacheck: 'DeprisaCheck',
  accepted: 'Aceptado',
  rejected: 'Rechazado',
};

function FlowIndicator({ status, hasChecklist }: { status: string; hasChecklist: boolean }) {
  const steps = hasChecklist || status === 'requires_deprisacheck'
    ? ['pending', 'requires_deprisacheck', status === 'accepted' || status === 'rejected' ? status : '']
    : ['pending', status];

  const uniqueSteps = [...new Set(steps.filter(Boolean))];

  return (
    <div className="flow-indicator">
      {uniqueSteps.map((s, i) => (
        <span key={s}>
          {i > 0 && <span className="flow-arrow">→</span>}
          <span className={`flow-step flow-step-${s}`}>{STATUS_LABEL[s] ?? s} ✓</span>
        </span>
      ))}
    </div>
  );
}

export function AdmissionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [admission, setAdmission] = useState<AdmissionDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [checklistOpen, setChecklistOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.getAdmissionDetail(id)
      .then(setAdmission)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="page"><p>Cargando...</p></div>;
  if (error) return <div className="page"><p className="error">{error}</p></div>;
  if (!admission) return <div className="page"><p>Admisión no encontrada.</p></div>;

  const responses = admission.checklist?.responses ?? {};

  return (
    <div className="page">
      <section className="page-header">
        <button className="btn-secondary" onClick={() => navigate(-1)}>← Volver</button>
        <h1>Detalle de Admisión</h1>
        <p className="text-muted">ID: {admission.id}</p>
      </section>

      {/* Cabecera */}
      <div className="detail-card">
        <div className="detail-grid">
          <div><label>Cliente</label><p>{admission.client.name}</p></div>
          <div><label>Punto de venta</label><p>{admission.pointOfSale.name} <span className="role-badge">{admission.pointOfSale.type.toUpperCase()}</span></p></div>
          <div><label>Tipo de mercancía</label><p>{admission.merchandiseType.name}</p></div>
          <div><label>Fecha</label><p>{new Date(admission.createdAt).toLocaleString('es-CO')}</p></div>
          {admission.description && <div><label>Descripción</label><p>{admission.description}</p></div>}
          {admission.weight && <div><label>Peso</label><p>{admission.weight} kg</p></div>}
        </div>
      </div>

      {/* Flujo de estados */}
      <div className="detail-card">
        <h3>Flujo de admisión</h3>
        <FlowIndicator status={admission.status} hasChecklist={!!admission.checklist} />
        {admission.status === 'rejected' && admission.rejectionReason && (
          <div className="rejection-reason">
            <strong>Razón de rechazo:</strong> {admission.rejectionReason}
          </div>
        )}
      </div>

      {/* Checklist */}
      {admission.checklist && (
        <div className="detail-card">
          <button className="btn-secondary" onClick={() => setChecklistOpen(!checklistOpen)}>
            {checklistOpen ? '▲' : '▼'} Checklist DeprisaCheck — {admission.checklist.template.name}
            <span className={`status-badge status-${admission.checklist.status}`} style={{ marginLeft: 8 }}>
              {STATUS_LABEL[admission.checklist.status] ?? admission.checklist.status}
            </span>
          </button>
          {checklistOpen && (
            <table className="users-table" style={{ marginTop: 12 }}>
              <thead>
                <tr><th>#</th><th>Pregunta</th><th>Requerida</th><th>Respuesta</th></tr>
              </thead>
              <tbody>
                {admission.checklist.template.items.map((item, i) => {
                  const resp = responses[item.id];
                  const respText =
                    resp === true || resp === 'true' ? 'Sí'
                    : resp === false || resp === 'false' ? 'No'
                    : resp === 'na' || resp === 'N/A' ? 'N/A'
                    : String(resp ?? '—');
                  return (
                    <tr key={item.id}>
                      <td>{i + 1}</td>
                      <td style={{ maxWidth: 500 }}>{item.text}</td>
                      <td>{item.required ? 'Sí' : 'No'}</td>
                      <td><strong>{respText}</strong></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
