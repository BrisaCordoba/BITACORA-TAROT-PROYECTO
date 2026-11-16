import { pool } from '../db.js';

export class ReadingRepository {
  async create(data) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const readingResult = await client.query(
        `INSERT INTO readings (title, querent, category, date_time, notes, is_favorite)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [
          data.title.trim(),
          data.querent.trim(),
          data.category || 'General',
          data.dateTime,
          data.notes || '',
          Boolean(data.isFavorite),
        ]
      );

      const reading = readingResult.rows[0];
      const insertedCards = [];

      for (const card of data.cards) {
        const cardResult = await client.query(
          `INSERT INTO card_positions (reading_id, card_name, position_name, is_reversed)
           VALUES ($1, $2, $3, $4)
           RETURNING *`,
          [
            reading.id,
            card.cardName.trim(),
            card.positionName || 'General',
            Boolean(card.isReversed),
          ]
        );
        insertedCards.push(cardResult.rows[0]);
      }

      await client.query('COMMIT');
      return this.#formatReading(reading, insertedCards);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async findAll({ search = '', category = '' } = {}) {
    const conditions = [];
    const values = [];

    if (search) {
      values.push(`%${search}%`);
      conditions.push(`(r.title ILIKE $${values.length} OR r.querent ILIKE $${values.length})`);
    }

    if (category && category !== 'Todas') {
      values.push(category);
      conditions.push(`r.category = $${values.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const readingsRes = await pool.query(
      `SELECT * FROM readings r ${whereClause} ORDER BY r.date_time DESC`,
      values
    );

    const results = [];
    for (const row of readingsRes.rows) {
      const cardsRes = await pool.query(
        'SELECT * FROM card_positions WHERE reading_id = $1',
        [row.id]
      );
      results.push(this.#formatReading(row, cardsRes.rows));
    }

    return results;
  }

  async toggleFavorite(id) {
    const res = await pool.query(
      `UPDATE readings
       SET is_favorite = NOT is_favorite, updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id]
    );
    return res.rows[0] || null;
  }

  async delete(id) {
    const res = await pool.query('DELETE FROM readings WHERE id = $1 RETURNING id', [id]);
    return res.rowCount > 0;
  }

  #formatReading(row, cardRows) {
    return {
      id: row.id,
      title: row.title,
      querent: row.querent,
      category: row.category,
      dateTime: row.date_time,
      notes: row.notes,
      isFavorite: row.is_favorite,
      createdAt: row.created_at,
      cards: cardRows.map((c) => ({
        id: c.id,
        cardName: c.card_name,
        positionName: c.position_name,
        isReversed: c.is_reversed,
      })),
    };
  }
}