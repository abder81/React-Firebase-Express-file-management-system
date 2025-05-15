import React from 'react';
import { Form } from 'react-bootstrap';

const SearchBar = ({ value, onChange }) => (
  <Form.Group className="mb-3 mt-5 px-5">
    <Form.Control
      type="text"
      placeholder="Chercher des documents..."
      value={value}
      onChange={e => onChange(e.target.value)}
    />
  </Form.Group>
);

export default SearchBar;
