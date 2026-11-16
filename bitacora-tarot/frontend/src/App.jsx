import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function App() {
  const [readings, setReadings] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState('');
  const [querent, setQuerent] = useState('');
  const [category, setCategory] = useState('General');
  const [dateTime, setDateTime] = useState('');
  const [notes, setNotes] = useState('');
  const [cards, setCards] = useState([
    { cardName: '', positionName: 'Presente', isReversed: false },
  ]);

  const fetchReadings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (categoryFilter !== 'Todas') params.append('category', categoryFilter);

      const res = await fetch(`${API_URL}/api/readings?${params.toString()}`);
      const json = await res.json();
      if (json.success) setReadings(json.data);
    } catch {
      setError('No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReadings();
  }, [search, categoryFilter]);

  const handleAddCard = () => {
    setCards([...cards, { cardName: '', positionName: '', isReversed: false }]);
  };

  const handleCardChange = (index, field, value) => {
    const updated = [...cards];
    updated[index][field] = value;
    setCards(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch(`${API_URL}/api/readings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          querent,
          category,
          dateTime: dateTime ? new Date(dateTime).toISOString() : new Date().toISOString(),
          notes,
          cards,
        }),
      });
      const json = await res.json();

      if (!json.success) {
        setError(json.error);
        return;
      }

      setTitle('');
      setQuerent('');
      setNotes('');
      setCards([{ cardName: '', positionName: 'Presente', isReversed: false }]);
      fetchReadings();
    } catch {
      setError('Error al guardar la tirada.');
    }
  };

  const handleToggleFavorite = async (id) => {
    await fetch(`${API_URL}/api/readings/${id}/favorite`, { method: 'PATCH' });
    fetchReadings();
  };

  const handleDelete = async (id) => {
    await fetch(`${API_URL}/api/readings/${id}`, { method: 'DELETE' });
    fetchReadings();
  };

  return (
    <div className="container">
      <header>
        <h1>🔮 Bitácora Digital de Tarot</h1>
        <p>Registro ordenado de lecturas y arcanos</p>
      </header>

      <section className="card-box">
        <h2>Nueva Tirada</h2>
        {error && <div className="error-banner">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="row">
            <input
              type="text"
              placeholder="Título de la tirada (ej. Lectura mensual)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <input
              type="text"
              placeholder="Consultante"
              value={querent}
              onChange={(e) => setQuerent(e.target.value)}
            />
          </div>

          <div className="row">
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="General">General</option>
              <option value="Amor">Amor</option>
              <option value="Trabajo">Trabajo</option>
              <option value="Decisiones">Decisiones</option>
            </select>
            <input
              type="datetime-local"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
            />
          </div>

          <div className="cards-section">
            <h4>Cartas extraídas</h4>
            {cards.map((card, idx) => (
              <div key={idx} className="row card-input">
                <input
                  type="text"
                  placeholder="Carta (ej. La Papisa)"
                  value={card.cardName}
                  onChange={(e) => handleCardChange(idx, 'cardName', e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Posición (ej. Consejo)"
                  value={card.positionName}
                  onChange={(e) => handleCardChange(idx, 'positionName', e.target.value)}
                />
                <label className="checkbox">
                  <input
                    type="checkbox"
                    checked={card.isReversed}
                    onChange={(e) => handleCardChange(idx, 'isReversed', e.target.checked)}
                  />
                  Invertida
                </label>
              </div>
            ))}
            <button type="button" className="btn-secondary" onClick={handleAddCard}>
              + Agregar otra carta
            </button>
          </div>

          <textarea
            placeholder="Notas e interpretación..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <button type="submit" className="btn-primary">
            Guardar Tirada
          </button>
        </form>
      </section>

      <section className="filters">
        <input
          type="text"
          placeholder="Buscar por título o consultante..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="Todas">Todas las categorías</option>
          <option value="General">General</option>
          <option value="Amor">Amor</option>
          <option value="Trabajo">Trabajo</option>
          <option value="Decisiones">Decisiones</option>
        </select>
      </section>

      <section className="readings-list">
        {loading ? (
          <p>Cargando lecturas...</p>
        ) : readings.length === 0 ? (
          <p className="empty">No hay tiradas registradas todavía.</p>
        ) : (
          readings.map((r) => (
            <article key={r.id} className="reading-item">
              <div className="reading-header">
                <div>
                  <span className="badge">{r.category}</span>
                  <h3>{r.title}</h3>
                  <small>
                    Consultante: <strong>{r.querent}</strong> ·{' '}
                    {new Date(r.dateTime).toLocaleString()}
                  </small>
                </div>
                <div className="actions">
                  <button onClick={() => handleToggleFavorite(r.id)}>
                    {r.isFavorite ? '★' : '☆'}
                  </button>
                  <button className="btn-danger" onClick={() => handleDelete(r.id)}>
                    Eliminar
                  </button>
                </div>
              </div>

              <div className="cards-chips">
                {r.cards.map((c, i) => (
                  <span key={i} className="chip">
                    {c.positionName}: <strong>{c.cardName}</strong>{' '}
                    {c.isReversed ? '(Invertida)' : ''}
                  </span>
                ))}
              </div>

              {r.notes && <p className="notes">{r.notes}</p>}
            </article>
          ))
        )}
      </section>
    </div>
  );
}