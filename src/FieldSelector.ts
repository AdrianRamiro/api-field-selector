import type {
  FieldSelectorOptions,
  RequestParams,
  FieldSelectorConfig,
} from './types';

export class FieldSelector {
  private availableFields: Set<string>;
  private defaultFields: Set<string>;
  private fieldGroups: Record<string, Set<string>>;
  private config: Required<FieldSelectorConfig>;

  constructor(options: FieldSelectorOptions, config: FieldSelectorConfig = {}) {
    const { availableFields, defaultFields, fieldGroups } = options;
    // Validate inputs
    if (!availableFields?.length) {
      throw new Error('availableFields must be provided and non-empty');
    }
    if (!defaultFields?.length) {
      throw new Error('defaultFields must be provided and non-empty');
    }

    // Validate that default fields are subset of available fields
    if (!defaultFields.every((field) => availableFields.includes(field))) {
      throw new Error(
        'Default fields has values not present in available fields',
      );
    }

    this.availableFields = new Set(availableFields);
    this.defaultFields = new Set(defaultFields);

    // Initialize field groups
    this.fieldGroups = {};
    if (fieldGroups) {
      Object.entries(fieldGroups).forEach(([groupName, fields]) => {
        // Validate group fields are available
        if (!fields.every((field) => availableFields.includes(field))) {
          throw new Error(
            `Group ${groupName} contains invalid fields: ${fields.join(', ')}`,
          );
        }
        this.fieldGroups[groupName] = new Set(fields);
      });
    }

    // Set configuration with defaults
    this.config = {
      queryParam: config.queryParam || 'fields',
      headerName: config.headerName || 'x-fields',
      separator: config.separator || ',',
    };
  }

  /**
   * Get selected fields from request parameters
   */
  getSelectedFields(request: RequestParams): Set<string> {
    const fieldsInput = this.extractFieldsFromRequest(request);
    if (!fieldsInput) {
      return this.defaultFields;
    }

    const selectedFields = this.parseFieldsInput(fieldsInput);

    // If no valid fields were selected, return defaults
    if (selectedFields.size === 0) {
      return this.defaultFields;
    }

    return selectedFields;
  }

  /**
   * Filter an object to only include selected fields
   */
  filterObject<T extends object>(
    obj: T,
    selectedFields: Set<string>,
  ): Partial<T> {
    const result: Partial<T> = {};

    for (const [key, value] of Object.entries(obj)) {
      if (selectedFields.has(key)) {
        result[key as keyof T] = value;
      }
    }

    return result;
  }

  /**
   * Get all available fields
   */
  getAvailableFields(): string[] {
    return Array.from(this.availableFields);
  }

  /**
   * Get default fields
   */
  getDefaultFields(): string[] {
    return Array.from(this.defaultFields);
  }

  /**
   * Extract fields selection from request
   */
  private extractFieldsFromRequest(request: RequestParams): string | null {
    // Check query parameters first
    const queryFields = request.query?.[this.config.queryParam];
    if (queryFields) {
      return Array.isArray(queryFields) ? queryFields[0] : queryFields;
    }

    // Then check headers
    const headerFields = request.headers?.[this.config.headerName];
    if (headerFields) {
      return Array.isArray(headerFields) ? headerFields[0] : headerFields;
    }

    return null;
  }

  /**
   * Parse fields input string into a set of valid fields
   */
  private parseFieldsInput(input: string): Set<string> {
    const selectedFields = new Set<string>();
    const requestedFields = input
      .split(this.config.separator)
      .map((f) => f.trim());

    for (const field of requestedFields) {
      // Check if it's a field group
      if (field.startsWith('@') && this.fieldGroups[field.slice(1)]) {
        const groupFields = this.fieldGroups[field.slice(1)];
        groupFields.forEach((f) => selectedFields.add(f));
        continue;
      }

      // Check if it's a valid individual field
      if (this.availableFields.has(field)) {
        selectedFields.add(field);
      }
    }

    return selectedFields;
  }
}
