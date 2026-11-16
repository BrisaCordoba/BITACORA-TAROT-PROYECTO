export class ReadingController {
  constructor(readingService) {
    this.readingService = readingService;
  }

  create = async (req, res) => {
    try {
      const reading = await this.readingService.createReading(req.body);
      res.status(201).json({ success: true, data: reading });
    } catch (error) {
      res.status(error.statusCode || 400).json({ success: false, error: error.message });
    }
  };

  getAll = async (req, res) => {
    try {
      const { search, category } = req.query;
      const readings = await this.readingService.getReadings({ search, category });
      res.status(200).json({ success: true, data: readings });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  };

  toggleFavorite = async (req, res) => {
    try {
      const updated = await this.readingService.toggleFavorite(req.params.id);
      res.status(200).json({ success: true, data: updated });
    } catch (error) {
      res.status(error.statusCode || 400).json({ success: false, error: error.message });
    }
  };

  delete = async (req, res) => {
    try {
      await this.readingService.deleteReading(req.params.id);
      res.status(200).json({ success: true, message: 'Tirada eliminada correctamente.' });
    } catch (error) {
      res.status(error.statusCode || 400).json({ success: false, error: error.message });
    }
  };
}