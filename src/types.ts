export interface FieldSelectorOptions {
  /** All available fields that can be selected */
  availableFields: string[];
  /** Default fields to return if no selection is made */
  defaultFields: string[];
  /** Optional field groups for convenient selection */
  fieldGroups?: Record<string, string[]>;
}

export interface RequestParams {
  /** Query parameters from the request */
  query?: Record<string, string | string[]>;
  /** Headers from the request */
  headers?: Record<string, string | string[]>;
}

export interface FieldSelectorConfig {
  /** Query parameter name for fields (default: 'fields') */
  queryParam?: string;
  /** Header name for fields (default: 'X-Fields') */
  headerName?: string;
  /** Field separator for string inputs (default: ',') */
  separator?: string;
}
