# Especificación Funcional y Técnica - Bitácora Digital de Tarot

## 1. Propósito
Aplicación web full-stack para que practicantes de tarot registren, consulten, editen, filtren y organicen sus lecturas, reemplazando cuadernos físicos.

## 2. Entidades del Dominio (Normalizadas)
- **Reading (Tirada):** `id` (UUID), `title` (string, obligatorio), `querent` (string, obligatorio), `category` (string), `date_time` (timestamp, no puede ser futura), `notes` (text), `is_favorite` (boolean).
- **CardPosition (Carta en Tirada):** `id` (UUID), `reading_id` (FK -> Reading con `ON DELETE CASCADE`), `card_name` (string, obligatorio), `position_name` (string), `is_reversed` (boolean).

## 3. Reglas de Negocio
1. **Campos obligatorios:** El título (`title`) y el consultante (`querent`) no pueden estar vacíos.
2. **Mínimo de cartas:** Toda tirada debe contener al menos 1 carta en `cards`.
3. **Validación temporal:** La fecha de la lectura (`dateTime`) no puede ser posterior a la fecha/hora actual del servidor.
4. **Integridad referencial:** Al eliminar una tirada (`DELETE /api/readings/:id`), se eliminan automáticamente todas sus cartas asociadas.

## 4. Contrato de API (Endpoints)
- `GET /api/readings?search=&category=` -> Lista tiradas con sus cartas.
- `GET /api/readings/:id` -> Devuelve el detalle de una tirada o `404`.
- `POST /api/readings` -> Crea una tirada (`201 Created` or `400 Bad Request`).
- `PATCH /api/readings/:id/favorite` -> Alterna el estado de favorito.
- `DELETE /api/readings/:id` -> Elimina una tirada (`200 OK` or `404`).