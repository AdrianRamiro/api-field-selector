
# API Fields Select

A TypeScript library that enables API developers to implement field selection in their APIs, allowing clients to request specific fields in responses. This helps reduce payload size and bandwidth usage by returning only the data that clients need.


## Features
- Field selection via query parameters or headers
- Support for field groups (preset field combinations)
- Automatic field validation
- TypeScript support
- Zero dependencies
- Framework agnostic


## Installation

```bash
npm install api-fields-select
```


## Usage

### Basic Setup

```typescript
import { FieldSelector } from 'api-fields-select';

const userFieldSelector = new FieldSelector({
  availableFields: ['id', 'name', 'email', 'phone', 'address', 'createdAt'],
  defaultFields: ['id', 'name'],
  fieldGroups: {
    basic: ['id', 'name'],
    contact: ['email', 'phone', 'address']
  }
});
```


### Integration Example

```typescript
import express from 'express';
const app = express();

app.get('/users/:id', (req, res) => {
  const user = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    phone: '123-456-7890',
    address: '123 Main St',
    createdAt: '2024-01-01'
  };

  const selectedFields = userFieldSelector.getSelectedFields(req);
  const filteredUser = userFieldSelector.filterObject(user, selectedFields);
  
  res.json(filteredUser);
});
```



### Client Usage


Clients can request specific fields in several ways:

1. Using query parameters:
```
GET /api/users/1?fields=id,name,email
```

2. Using headers:
```
GET /api/users/1
X-Fields: id,name,email
```

3. Using field groups:
```
GET /api/users/1?fields=@basic,email
```


## Configuration

The FieldSelector constructor accepts two parameters:

1. Required options:

```typescript
export interface FieldSelectorOptions {
  /** All available fields that can be selected */
  availableFields: string[];
  /** Default fields to return if no selection is made */
  defaultFields: string[];
  /** Optional field groups for convenient selection */
  fieldGroups?: Record<string, string[]>;
}
```

2. Optional configuration:

```typescript
export interface FieldSelectorConfig {
  /** Query parameter name for fields (default: 'fields') */
  queryParam?: string;
  /** Header name for fields (default: 'X-Fields') */
  headerName?: string;
  /** Field separator for string inputs (default: ',') */
  separator?: string;
}
```

### Example Configuration

```typescript
const selector = new FieldSelector(
  {
    availableFields: ['id', 'name', 'email', 'phone'],
    defaultFields: ['id', 'name'],
    fieldGroups: {
      basic: ['id', 'name'],
      contact: ['email', 'phone']
    }
  },
  {
    queryParam: 'fields',    // Default query parameter name
    headerName: 'x-fields',  // Default header name
    separator: ','           // Default field separator
  }
);
```


## API Reference

### Methods

#### `getSelectedFields(request: RequestParams): Set<string>`

Returns a set of field names based on the client's request.


#### `filterObject<T>(obj: T, selectedFields: Set<string>): Partial<T>`

Filters an object to only include the requested fields.


#### `getAvailableFields(): string[]`

Returns all available fields that can be requested.


#### `getDefaultFields(): string[]`

Returns the default fields that are returned when no selection is made.


## Response Examples

Request:
```
GET /api/users/1?fields=id,name,email
```

Response:
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com"
}
```


Using field groups:
```
GET /api/users/1?fields=@contact
```

Response:
```json
{
  "email": "john@example.com",
  "phone": "123-456-7890",
  "address": "123 Main St"
}
```

## Testing

```bash
npm run test
```

## License

This project is licensed under the MIT License.

## Contributing

We welcome contributions to improve the library's functionality and documentation.