# API Documentation - Botwaffle Character Nexus

## Base URL

**Development**: `http://localhost:3000/api`
**Production**: `https://app.botwaffle.io/api` (when deployed)

## Authentication

**Current Version (v0.1.0)**: No authentication required (local-only tool)

**Future**: JWT tokens for multi-user deployments

---

## Response Format

### Success Response
```json
{
  "data": { ... },
  "message": "Success message (optional)"
}
```

### Error Response
```json
{
  "error": "User-friendly error message",
  "code": "ERROR_CODE",
  "details": {} // Only in development mode
}
```

### HTTP Status Codes
- `200 OK` - Successful GET/PUT/DELETE
- `201 Created` - Successful POST
- `400 Bad Request` - Validation error
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## Endpoints

## Characters

### GET /api/characters
Get all characters with optional filtering

**Query Parameters**:
- `universe` (string, optional) - Filter by universe
- `contentRating` (string, optional) - Filter by 'sfw' or 'nsfw'
- `tags` (string, optional) - Comma-separated tags
- `search` (string, optional) - Search by name
- `limit` (number, optional) - Max results (default: 100)
- `offset` (number, optional) - Pagination offset (default: 0)

**Example Request**:
```bash
GET /api/characters?universe=Star%20Wars&contentRating=sfw&limit=20
```

**Example Response**:
```json
{
  "data": [
    {
      "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      "name": "Aria Stormwind",
      "chatName": "Aria",
      "universe": "Fantasy Realms",
      "image": "f47ac10b-58cc-4372-a567-0e02b2c3d479.webp",
      "bio": "<p>A powerful mage from the northern mountains...</p>",
      "personality": "Confident, intelligent, protective",
      "tags": ["fantasy", "mage", "protagonist"],
      "contentRating": "sfw",
      "created": "2025-11-16T12:00:00.000Z",
      "modified": "2025-11-16T12:00:00.000Z"
    }
  ],
  "total": 1,
  "limit": 20,
  "offset": 0
}
```

---

### GET /api/characters/:id
Get single character by ID

**Example Request**:
```bash
GET /api/characters/f47ac10b-58cc-4372-a567-0e02b2c3d479
```

**Example Response**:
```json
{
  "data": {
    "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "name": "Aria Stormwind",
    "chatName": "Aria",
    "universe": "Fantasy Realms",
    "image": "f47ac10b-58cc-4372-a567-0e02b2c3d479.webp",
    "bio": "<p>A powerful mage from the northern mountains...</p>",
    "personality": "Confident, intelligent, protective of her friends",
    "scenario": "You meet Aria in the library of the Mage Academy",
    "introMessage": "Hello traveler, what brings you to the Academy?",
    "exampleDialogues": [
      {
        "user": "Can you teach me magic?",
        "bot": "Magic requires discipline and patience. Are you prepared?"
      }
    ],
    "tags": ["fantasy", "mage", "protagonist"],
    "contentRating": "sfw",
    "notes": "Personal notes about character...",
    "relationships": [
      {
        "characterId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "type": "mentor",
        "notes": "Taught her advanced fire magic"
      }
    ],
    "customTags": ["favorite", "high-priority"],
    "created": "2025-11-16T12:00:00.000Z",
    "modified": "2025-11-16T12:00:00.000Z",
    "source": "https://janitorai.com/characters/abc123",
    "lastSyncedFrom": "https://janitorai.com/characters/abc123"
  }
}
```

---

### POST /api/characters
Create new character manually

**Request Body**:
```json
{
  "name": "Aria Stormwind",
  "chatName": "Aria",
  "universe": "Fantasy Realms",
  "bio": "A powerful mage from the northern mountains",
  "personality": "Confident, intelligent, protective",
  "scenario": "Meeting at the Mage Academy",
  "introMessage": "Hello traveler!",
  "tags": ["fantasy", "mage"],
  "contentRating": "sfw"
}
```

**Validation**:
- `name` (string, required, max 255)
- `universe` (string, required, max 255)
- `bio` (string, optional, max 10000)
- `personality` (string, optional, max 50000)
- `tags` (array, optional, max 50 items)
- `contentRating` (enum: 'sfw' | 'nsfw')

**Example Response**:
```json
{
  "data": {
    "id": "new-uuid-here",
    "name": "Aria Stormwind",
    ...
  },
  "message": "Character created successfully"
}
```

---

### PUT /api/characters/:id
Update existing character

**Request Body**: Same as POST (all fields optional except `name` and `universe`)

**Example Response**:
```json
{
  "data": { ... },
  "message": "Character updated successfully"
}
```

---

### DELETE /api/characters/:id
Delete character

**Example Response**:
```json
{
  "message": "Character deleted successfully"
}
```

**Side Effects**: Also deletes associated image file

---

## Import

### POST /api/import/janitorai
Import character from JanitorAI URL

**Request Body**:
```json
{
  "url": "https://janitorai.com/characters/abc123"
}
```

**Validation**:
- URL must be from `janitorai.com`
- URL must not be admin/settings page
- URL must be valid HTTP/HTTPS

**Example Response**:
```json
{
  "data": {
    "id": "new-uuid",
    "name": "Imported Character",
    "image": "uuid.webp",
    ...
  },
  "message": "Character imported successfully from JanitorAI"
}
```

**Process**:
1. Validate URL
2. Launch Puppeteer to scrape page
3. Extract character data (name, bio, personality, tags, image)
4. Download and process image (strip EXIF, convert to WebP)
5. Sanitize HTML content
6. Save to database
7. Return character object

**Errors**:
- `400` - Invalid URL or scraping failed
- `500` - Network error or Puppeteer crash

---

## Groups

### GET /api/groups
Get all groups

**Query Parameters**:
- `universe` (string, optional) - Filter by universe

**Example Response**:
```json
{
  "data": [
    {
      "id": "group-uuid",
      "name": "The Avengers",
      "universe": "Marvel Cinematic Universe",
      "description": "Earth's Mightiest Heroes",
      "characters": ["char-id-1", "char-id-2"],
      "created": "2025-11-16T12:00:00.000Z"
    }
  ]
}
```

---

### GET /api/groups/:id
Get single group with populated character data

**Example Response**:
```json
{
  "data": {
    "id": "group-uuid",
    "name": "The Avengers",
    "universe": "Marvel Cinematic Universe",
    "description": "Earth's Mightiest Heroes",
    "charactersData": [
      {
        "id": "char-id-1",
        "name": "Iron Man",
        "image": "uuid.webp"
      }
    ],
    "created": "2025-11-16T12:00:00.000Z"
  }
}
```

---

### POST /api/groups
Create new group

**Request Body**:
```json
{
  "name": "The Fellowship",
  "universe": "Lord of the Rings",
  "description": "Nine companions on a quest",
  "characters": ["char-id-1", "char-id-2"]
}
```

**Validation**:
- `name` (string, required, max 255)
- `universe` (string, required, max 255)
- `description` (string, optional, max 5000)
- `characters` (array of UUIDs, optional)

---

### PUT /api/groups/:id
Update group

**Request Body**: Same as POST

---

### DELETE /api/groups/:id
Delete group

**Note**: Does not delete characters, only the group itself

---

## Universes

### GET /api/universes
Get all universes with character counts

**Example Response**:
```json
{
  "data": [
    {
      "id": "universe-uuid",
      "name": "Star Wars",
      "description": "A galaxy far, far away...",
      "characterCount": 15,
      "created": "2025-11-16T12:00:00.000Z"
    }
  ]
}
```

---

### POST /api/universes
Create new universe

**Request Body**:
```json
{
  "name": "Harry Potter",
  "description": "Wizarding world of magic"
}
```

**Validation**:
- `name` (string, required, max 255, unique)
- `description` (string, optional, max 5000)

---

### PUT /api/universes/:id
Update universe

**Request Body**: Same as POST

---

### DELETE /api/universes/:id
Delete universe

**Warning**: Will fail if characters still reference this universe

---

## Images

### GET /api/images/:filename
Serve character image file

**Example Request**:
```bash
GET /api/images/f47ac10b-58cc-4372-a567-0e02b2c3d479.webp
```

**Response**: Image file (Content-Type: image/webp)

**Security**:
- Validates filename format (UUID.webp)
- Prevents path traversal attacks
- Only serves files from `/characters/images/`

---

### POST /api/images/upload
Upload custom character image

**Request**: Multipart form data
```
Content-Type: multipart/form-data

file: [binary image data]
```

**Validation**:
- File size: max 5MB
- MIME types: image/jpeg, image/png, image/webp
- Processed: EXIF stripped, converted to WebP

**Example Response**:
```json
{
  "data": {
    "filename": "new-uuid.webp"
  },
  "message": "Image uploaded successfully"
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Request body failed validation |
| `NOT_FOUND` | Resource not found |
| `DUPLICATE_NAME` | Universe name already exists |
| `INVALID_URL` | Invalid or forbidden URL |
| `SCRAPING_FAILED` | Failed to scrape JanitorAI |
| `IMAGE_UPLOAD_FAILED` | Image processing failed |
| `DATABASE_ERROR` | Database operation failed |
| `INTERNAL_ERROR` | Unexpected server error |

---

## Rate Limiting

**Current Version**: No rate limiting (local-only)

**Future**:
- 100 requests per minute per IP
- 10 imports per hour (Puppeteer is expensive)

---

## Versioning

API version is included in response headers:

```
X-API-Version: 0.1.0
```

---

## Example Integration

### JavaScript/Fetch

```javascript
// Get all characters
const response = await fetch('http://localhost:3000/api/characters');
const { data } = await response.json();

// Create character
const response = await fetch('http://localhost:3000/api/characters', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Aria',
    universe: 'Fantasy Realms',
    bio: 'A powerful mage',
  }),
});

// Import from JanitorAI
const response = await fetch('http://localhost:3000/api/import/janitorai', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    url: 'https://janitorai.com/characters/abc123',
  }),
});
```

---

**Last Updated**: 2025-11-16
**Version**: 0.1.0
