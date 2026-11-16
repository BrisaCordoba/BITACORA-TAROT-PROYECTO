export class ReadingService {
  constructor(readingRepository) {
    this.readingRepository = readingRepository;
  }

  async createReading(dto) {
    if (!dto.title || dto.title.trim() === '') {
      throw new Error('El título de la tirada es obligatorio.');
    }
    if (!dto.querent || dto.querent.trim() === '') {
      throw new Error('El nombre del consultante es obligatorio.');
    }
    if (!Array.isArray(dto.cards) || dto.cards.length === 0) {
      throw new Error('Debe haber al menos una carta seleccionada.');
    }
    for (const card of dto.cards) {
      if (!card.cardName || card.cardName.trim() === '') {
        throw new Error('Todas las cartas deben tener un nombre válido.');
      }
    }

    const readingDate = new Date(dto.dateTime);
    if (Number.isNaN(readingDate.getTime())) {
      throw new Error('La fecha ingresada no es válida.');
    }
    if (readingDate > new Date()) {
      throw new Error('La fecha de la lectura no puede ser futura.');
    }

    return await this.readingRepository.create(dto);
  }

  async getReadings(filters) {
    return await this.readingRepository.findAll(filters);
  }

  async toggleFavorite(id) {
    const updated = await this.readingRepository.toggleFavorite(id);
    if (!updated) {
      const error = new Error('Tirada no encontrada.');
      error.statusCode = 404;
      throw error;
    }
    return updated;
  }

  async deleteReading(id) {
    const deleted = await this.readingRepository.delete(id);
    if (!deleted) {
      const error = new Error('Tirada no encontrada.');
      error.statusCode = 404;
      throw error;
    }
    return true;
  }
}