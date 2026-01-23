import React from 'react';
import styled from 'styled-components';
import SearchBar from '../components/SearchBar';

const Test = () => {
  return (
    <div style={{
      padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px', background: 'white'
    }}>

      <h3>Small (100px)</h3>
      <SearchBar width="s" placeholder="S" />

      <h3>Medium (150px)</h3>
      <SearchBar width="m" placeholder="Medium" />

      <h3>Large (200px)</h3>
      <SearchBar width="l" placeholder="Large Size" />

      <h3>Custom (100%)</h3>
      <SearchBar width="100%" placeholder="꽉 찬 사이즈" />

    </div>
  );
};

export default Test;