import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api, type ChecklistTemplateSummary, type ChecklistTemplateDetail, type TemplateItem, type MerchandiseType } from '../api/client';

export function ChecklistTemplates() {
  const { user } = useAuth();
  if (user?.role !== 'admin') return <Navigate to="/" replace />;

  const [templates, setTemplates] = useState<ChecklistTemplateSummary[]>([]);
  const [selected, setSelected] = useState<ChecklistTemplateDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mercTypes, setMercTypes] = useState<MerchandiseType[]>([]);

  // Formulario plantilla
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [tplForm, setTplForm] = useState({ name: '', merchandiseTypeId: '', pointOfSaleType: 'city' });

  // Formulario item
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState<TemplateItem | null>(null);
  const [itemForm, setItemForm] = useState({ text: '', required: false });

  const loadTemplates = () => {
    setLoading(true);
    api.getChecklistTemplateList()
      .then(setTemplates)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTemplates();
    api.getMerchandiseTypes().then(setMercTypes).catch(console.error);
  }, []);

  const loadSelected = (id: string) => {
    api.getChecklistTemplateDetail(id).then(setSelected).catch((e) => setError(e.message));
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await api.createChecklistTemplate(tplForm);
      setShowTemplateForm(false);
      setTplForm({ name: '', merchandiseTypeId: '', pointOfSaleType: 'city' });
      loadTemplates();
    } catch (e) { setError((e as Error).message); }
  };

  const handleToggleTemplate = async (id: string, name: string, active: boolean) => {
    if (!confirm(`¿${active ? 'Desactivar' : 'Activar'} plantilla "${name}"?`)) return;
    try { await api.toggleChecklistTemplate(id); loadTemplates(); if (selected?.id === id) loadSelected(id); }
    catch (e) { setError((e as Error).message); }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('¿Eliminar esta plantilla? Solo es posible si no tiene checklists completados asociados.')) return;
    try { await api.deleteChecklistTemplate(id); setSelected(null); loadTemplates(); }
    catch (e) { setError((e as Error).message); }
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setError('');
    try {
      if (editingItem) {
        await api.updateTemplateItem(selected.id, editingItem.id, itemForm);
      } else {
        await api.addTemplateItem(selected.id, itemForm);
      }
      setShowItemForm(false);
      setEditingItem(null);
      setItemForm({ text: '', required: false });
      loadSelected(selected.id);
    } catch (e) { setError((e as Error).message); }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!selected || !confirm('¿Eliminar esta pregunta?')) return;
    try { await api.deleteTemplateItem(selected.id, itemId); loadSelected(selected.id); }
    catch (e) { setError((e as Error).message); }
  };

  const handleMoveItem = async (item: TemplateItem, direction: 'up' | 'down') => {
    if (!selected) return;
    const items = [...selected.ChecklistTemplateItem].sort((a, b) => a.order - b.order);
    const idx = items.findIndex((i) => i.id === item.id);
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === items.length - 1) return;
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    const newItems = items.map((i, n) => {
      if (n === idx) return { id: i.id, order: items[swapIdx].order };
      if (n === swapIdx) return { id: i.id, order: items[idx].order };
      return { id: i.id, order: i.order };
    });
    try { await api.reorderTemplateItems(selected.id, newItems); loadSelected(selected.id); }
    catch (e) { setError((e as Error).message); }
  };

  // Agrupar por tipo de mercancía
  const grouped = templates.reduce<Record<string, ChecklistTemplateSummary[]>>((acc, t) => {
    const key = t.merchandiseTypeName;
    if (!acc[key]) acc[key] = [];
    acc[key].push(t);
    return acc;
  }, {});

  return (
    <div className="page">
      <section className="page-header">
        <h1>Plantillas de Checklist</h1>
        <p>Gestione las plantillas y preguntas para cada tipo de mercancía.</p>
      </section>

      {error && <p className="error">{error}</p>}

      <button className="btn-primary" onClick={() => setShowTemplateForm(true)}>Nueva plantilla</button>

      {showTemplateForm && (
        <div className="form-card">
          <h3>Nueva plantilla</h3>
          <form onSubmit={handleCreateTemplate}>
            <label>Nombre<input type="text" value={tplForm.name} onChange={(e) => setTplForm({ ...tplForm, name: e.target.value })} required /></label>
            <label>Tipo de mercancía
              <select value={tplForm.merchandiseTypeId} onChange={(e) => setTplForm({ ...tplForm, merchandiseTypeId: e.target.value })} required>
                <option value="">Seleccionar...</option>
                {mercTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </label>
            <label>Tipo de POS
              <select value={tplForm.pointOfSaleType} onChange={(e) => setTplForm({ ...tplForm, pointOfSaleType: e.target.value })}>
                <option value="city">Ciudad</option>
                <option value="ato">Aeropuerto (ATO)</option>
              </select>
            </label>
            <div className="button-group">
              <button type="submit">Crear</button>
              <button type="button" className="btn-secondary" onClick={() => setShowTemplateForm(false)}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 1fr' : '1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
        {/* Lista de plantillas */}
        <div>
          {loading ? <p>Cargando...</p> : Object.entries(grouped).map(([typeName, tpls]) => (
            <div key={typeName} style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ marginBottom: '.5rem' }}>{typeName}</h3>
              {tpls.map((t) => (
                <div key={t.id} className="form-card" style={{ cursor: 'pointer', border: selected?.id === t.id ? '2px solid var(--primary)' : undefined }}
                  onClick={() => loadSelected(t.id)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong>{t.name}</strong>
                      <span style={{ marginLeft: 8, fontSize: '.8rem', color: 'var(--text-muted)' }}>
                        {t.pointOfSaleType === 'ato' ? 'ATO' : 'Ciudad'} · {t.itemCount} preguntas
                      </span>
                      <span className={`status-badge ${t.isActive ? 'status-accepted' : 'status-rejected'}`} style={{ marginLeft: 8 }}>
                        {t.isActive ? 'Activa' : 'Inactiva'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '.5rem' }} onClick={(e) => e.stopPropagation()}>
                      <button className="btn-sm" onClick={() => handleToggleTemplate(t.id, t.name, t.isActive)}>{t.isActive ? 'Desactivar' : 'Activar'}</button>
                      <button className="btn-sm btn-danger" onClick={() => handleDeleteTemplate(t.id)}>Eliminar</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Panel de items */}
        {selected && (
          <div>
            <h3>{selected.name} — Preguntas</h3>
            <button className="btn-primary" style={{ marginBottom: '1rem' }} onClick={() => { setShowItemForm(true); setEditingItem(null); setItemForm({ text: '', required: false }); }}>
              Agregar pregunta
            </button>

            {showItemForm && (
              <div className="form-card">
                <h4>{editingItem ? 'Editar pregunta' : 'Nueva pregunta'}</h4>
                <form onSubmit={handleSaveItem}>
                  <label>Texto<textarea value={itemForm.text} onChange={(e) => setItemForm({ ...itemForm, text: e.target.value })} rows={3} required /></label>
                  <label className="checkbox-label">
                    <input type="checkbox" checked={itemForm.required} onChange={(e) => setItemForm({ ...itemForm, required: e.target.checked })} />
                    Respuesta requerida
                  </label>
                  <div className="button-group">
                    <button type="submit">{editingItem ? 'Guardar' : 'Agregar'}</button>
                    <button type="button" className="btn-secondary" onClick={() => { setShowItemForm(false); setEditingItem(null); }}>Cancelar</button>
                  </div>
                </form>
              </div>
            )}

            {[...selected.ChecklistTemplateItem].sort((a, b) => a.order - b.order).map((item, i, arr) => (
              <div key={item.id} className="form-card" style={{ marginBottom: '.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '.5rem' }}>
                  <span style={{ flex: 1, fontSize: '.9rem' }}><strong>{i + 1}.</strong> {item.text}{item.required && <span style={{ color: 'var(--danger)', marginLeft: 4 }}>*</span>}</span>
                  <div style={{ display: 'flex', gap: '.25rem', flexShrink: 0 }}>
                    <button className="btn-sm" disabled={i === 0} onClick={() => handleMoveItem(item, 'up')}>↑</button>
                    <button className="btn-sm" disabled={i === arr.length - 1} onClick={() => handleMoveItem(item, 'down')}>↓</button>
                    <button className="btn-sm" onClick={() => { setEditingItem(item); setItemForm({ text: item.text, required: item.required }); setShowItemForm(true); }}>Editar</button>
                    <button className="btn-sm btn-danger" onClick={() => handleDeleteItem(item.id)}>Eliminar</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
