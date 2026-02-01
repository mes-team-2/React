import React, { useState } from 'react';
import styled from 'styled-components';
import { FaSearch } from "react-icons/fa";

/**

 * @param {string} width 
 */

const SearchBar = ({
  onSearch,
  placeholder = "검색어를 입력하세요",
  onChange = () => { },
  width = "100%"
}) => {
  const [inputText, setInputText] = useState("");

  const handleChange = (e) => {
    const val = e.target.value;
    setInputText(val);
    onChange(val);
  };

  const handleSearchClick = () => {
    if (onSearch) onSearch(inputText);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearchClick();
  };

  return (
    <Container width={width}>
      <SearchBox>
        <Input
          value={inputText}
          placeholder={placeholder}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />
        <SearchButton onClick={handleSearchClick}>
          <FaSearch />
        </SearchButton>
      </SearchBox>
    </Container>
  );
};

export default SearchBar;

const sizeMap = {
  s: '200px',
  m: '250px',
  l: '300px'
};

const Container = styled.div`
  width: ${props => sizeMap[props.width] || props.width};
  height: 30px;
  display: flex;
  justify-content: center;
  box-sizing: border-box;
`;

const SearchBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: var(--background2); 
  border-radius: 50px; 
  padding: 0 15px;
  border: 1px solid transparent;
  width: 100%;
  height: 100%;
  transition: 0.2s ease-in-out;
  box-sizing: border-box;
  &:focus-within {
   border: 1px solid var(--font2);
  }
  &:hover {
    border: 1px solid var(--font2);
    box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.05); 
  }
`;

const Input = styled.input`
  flex: 1; 
  min-width: 0;
  background: transparent;
  border: none;
  height: 100%;
  font-size: var(--fontSm); 
  font-weight: var(--normal);
  color: var(--font); 
  outline: none;

  &::placeholder {
    color: var(--font2); 
  }
`;

const SearchButton = styled.button`
  flex-shrink: 0;
  width: 25px;
  height: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  color: var(--font2);
  transition: 0.2s;
  
  svg {
    font-size: var(--fontSm);
  }
`;