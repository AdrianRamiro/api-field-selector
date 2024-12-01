import { describe, it, expect } from 'vitest';
import { FieldSelector } from '../src/FieldSelector';

describe('FieldSelector', () => {
  const defaultOptions = {
    availableFields: ['id', 'name', 'email', 'address', 'phone', 'createdAt', 'updatedAt'],
    defaultFields: ['id', 'name', 'email'],
    fieldGroups: {
      basic: ['id', 'name'],
      contact: ['email', 'phone'],
      timestamps: ['createdAt', 'updatedAt'],
    },
  };

  describe('constructor', () => {
    it('should create instance with valid options', () => {
      const selector = new FieldSelector(defaultOptions);
      expect(selector).toBeInstanceOf(FieldSelector);
    });

    it('should throw error when availableFields is undefined', () => {
      expect(() => 
        new FieldSelector({
          defaultFields: ['id']
        } as any)
      ).toThrow('availableFields must be provided and non-empty');
    });

    it('should throw error when availableFields is empty', () => {
      expect(() => 
        new FieldSelector({
          availableFields: [],
          defaultFields: ['id']
        })
      ).toThrow('availableFields must be provided and non-empty');
    });

    it('should throw error when defaultFields is undefined', () => {
      expect(() => 
        new FieldSelector({
          availableFields: ['id', 'name']
        } as any)
      ).toThrow('defaultFields must be provided and non-empty');
    });

    it('should throw error when defaultFields is empty', () => {
      expect(() => 
        new FieldSelector({
          availableFields: ['id', 'name'],
          defaultFields: []
        })
      ).toThrow('defaultFields must be provided and non-empty');
    });

    it('should throw error for invalid default fields', () => {
      expect(() =>
        new FieldSelector({
          availableFields: ['id', 'name'],
          defaultFields: ['id', 'invalidField'],
        })
      ).toThrow('Default fields has values not present in available fields');
    });

    it('should throw error for invalid fields in field groups', () => {
      expect(() =>
        new FieldSelector({
          ...defaultOptions,
          fieldGroups: {
            invalid: ['id', 'nonexistent']
          }
        })
      ).toThrow('Group invalid contains invalid fields: id, nonexistent');
    });

    it('should accept custom configuration', () => {
      const selector = new FieldSelector(defaultOptions, {
        queryParam: 'select',
        headerName: 'x-select',
        separator: '|'
      });
      const fields = selector.getSelectedFields({
        query: { select: 'id|name' }
      });
      expect(Array.from(fields)).toEqual(['id', 'name']);
    });
  });

  describe('getSelectedFields', () => {
    it('should return default fields when no fields specified', () => {
      const selector = new FieldSelector(defaultOptions);
      const fields = selector.getSelectedFields({});
      expect(Array.from(fields)).toEqual(['id', 'name', 'email']);
    });

    it('should parse fields from query parameters', () => {
      const selector = new FieldSelector(defaultOptions);
      const fields = selector.getSelectedFields({
        query: { fields: 'id,name,phone' },
      });
      expect(Array.from(fields)).toEqual(['id', 'name', 'phone']);
    });

    it('should handle array query parameters', () => {
      const selector = new FieldSelector(defaultOptions);
      const fields = selector.getSelectedFields({
        query: { fields: ['id,name,phone'] },
      });
      expect(Array.from(fields)).toEqual(['id', 'name', 'phone']);
    });

    it('should parse fields from headers', () => {
      const selector = new FieldSelector(defaultOptions);
      const fields = selector.getSelectedFields({
        headers: { 'x-fields': 'id,name,phone' },
      });
      expect(Array.from(fields)).toEqual(['id', 'name', 'phone']);
    });

    it('should handle array headers', () => {
      const selector = new FieldSelector(defaultOptions);
      const fields = selector.getSelectedFields({
        headers: { 'x-fields': ['id,name,phone'] },
      });
      expect(Array.from(fields)).toEqual(['id', 'name', 'phone']);
    });

    it('should ignore invalid fields', () => {
      const selector = new FieldSelector(defaultOptions);
      const fields = selector.getSelectedFields({
        query: { fields: 'id,invalidField,name' },
      });
      expect(Array.from(fields)).toEqual(['id', 'name']);
    });

    it('should support field groups', () => {
      const selector = new FieldSelector(defaultOptions);
      const fields = selector.getSelectedFields({
        query: { fields: '@basic,phone' },
      });
      expect(Array.from(fields)).toEqual(['id', 'name', 'phone']);
    });

    it('should handle multiple field groups', () => {
      const selector = new FieldSelector(defaultOptions);
      const fields = selector.getSelectedFields({
        query: { fields: '@basic,@contact' },
      });
      expect(Array.from(fields)).toEqual(['id', 'name', 'email', 'phone']);
    });

    it('should ignore invalid field groups', () => {
      const selector = new FieldSelector(defaultOptions);
      const fields = selector.getSelectedFields({
        query: { fields: '@invalid,id,name' },
      });
      expect(Array.from(fields)).toEqual(['id', 'name']);
    });

    it('should return default fields when no valid fields are selected', () => {
      const selector = new FieldSelector(defaultOptions);
      const fields = selector.getSelectedFields({
        query: { fields: 'invalid1,invalid2' }
      });
      expect(Array.from(fields)).toEqual(['id', 'name', 'email']);
    });

    it('should handle whitespace in field selection', () => {
      const selector = new FieldSelector(defaultOptions);
      const fields = selector.getSelectedFields({
        query: { fields: ' id , name , phone ' },
      });
      expect(Array.from(fields)).toEqual(['id', 'name', 'phone']);
    });
  });

  describe('filterObject', () => {
    it('should filter object based on selected fields', () => {
      const selector = new FieldSelector(defaultOptions);
      const obj = {
        id: 1,
        name: 'John',
        email: 'john@example.com',
        phone: '123456789',
        address: '123 Main St',
      };

      const fields = new Set(['id', 'name', 'phone']);
      const filtered = selector.filterObject(obj, fields);
      expect(filtered).toEqual({
        id: 1,
        name: 'John',
        phone: '123456789',
      });
    });

    it('should handle empty field selection', () => {
      const selector = new FieldSelector(defaultOptions);
      const obj = { id: 1, name: 'John' };
      const filtered = selector.filterObject(obj, new Set());
      expect(filtered).toEqual({});
    });

    it('should handle fields not present in object', () => {
      const selector = new FieldSelector(defaultOptions);
      const obj = { id: 1 };
      const filtered = selector.filterObject(obj, new Set(['id', 'name']));
      expect(filtered).toEqual({ id: 1 });
    });
  });

  describe('getter methods', () => {
    it('should return available fields list', () => {
      const selector = new FieldSelector(defaultOptions);
      expect(selector.getAvailableFields()).toEqual(defaultOptions.availableFields);
    });

    it('should return default fields list', () => {
      const selector = new FieldSelector(defaultOptions);
      expect(selector.getDefaultFields()).toEqual(defaultOptions.defaultFields);
    });
  });
});
