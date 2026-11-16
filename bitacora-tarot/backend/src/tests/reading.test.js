import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ReadingService } from '../services/reading.service.js';

const mockRepo = {
  create: async (dto) => ({ id: 'uuid-test-123', ...dto }),
  findAll: async () => [],
};

describe('Reglas de negocio de ReadingService (Spec)', () => {
  const service = new ReadingService(mockRepo);

  it('debe rechazar una tirada sin título', async () => {
    await assert.rejects(
      () =>
        service.createReading({
          title: '',
          querent: 'Sofía',
          dateTime: new Date().toISOString(),
          cards: [{ cardName: 'El Sol' }],
        }),
      /título de la tirada es obligatorio/
    );
  });

  it('debe rechazar una tirada sin cartas', async () => {
    await assert.rejects(
      () =>
        service.createReading({
          title: 'Tirada General',
          querent: 'Sofía',
          dateTime: new Date().toISOString(),
          cards: [],
        }),
      /al menos una carta/
    );
  });

  it('debe rechazar una fecha futura', async () => {
    const tomorrow = new Date(Date.now() + 86400000).toISOString();
    await assert.rejects(
      () =>
        service.createReading({
          title: 'Tirada Futura',
          querent: 'Sofía',
          dateTime: tomorrow,
          cards: [{ cardName: 'La Papisa' }],
        }),
      /no puede ser futura/
    );
  });

  it('debe crear la tirada cuando cumple todas las reglas de la spec', async () => {
    const result = await service.createReading({
      title: 'Lectura Vínculos',
      querent: 'Brisa',
      category: 'Amor',
      dateTime: new Date(Date.now() - 60000).toISOString(),
      cards: [{ cardName: 'El Diablo', positionName: 'Presente', isReversed: false }],
    });
    assert.equal(result.id, 'uuid-test-123');
    assert.equal(result.querent, 'Brisa');
  });
});