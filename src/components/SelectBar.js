import React, { useState, useRef, useEffect } from "react";
import styled, { css } from "styled-components";
import { FiChevronDown } from "react-icons/fi";

/**
 * @param {string} value - 현재 선택된 값
 * @param {function} onChange - 변경 핸들러 (e) => ... 형태로 이벤트 객체 모방해서 전달
 * @param {Array} options - 옵션 배열 [{ value: 'key', label: '표시명' }]
 * @param {string} placeholder - 기본 플레이스홀더
 * @param {string} width - 너비 (s, m, l 또는 px값)
 */
const SelectBar = ({
  value,
  onChange,
  options = [],
  placeholder = "선택",
  width = "auto",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // 현재 선택된 라벨 찾기
  const selectedLabel = options.find((opt) => {
    const val = typeof opt === "object" ? opt.value : opt;
    return val === value;
  })?.label;

  const displayLabel = selectedLabel || placeholder;

  // 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelect = (option) => {
    const optValue = typeof option === "object" ? option.value : option;

    // 기존 <select>의 onChange와 호환되도록 가짜 이벤트 객체 생성
    if (onChange) {
      onChange({ target: { value: optValue } });
    }
    setIsOpen(false);
  };

  return (
    <Container ref={containerRef} $width={width}>
      {/* 선택된 값을 보여주는 헤더 영역 */}
      <SelectTrigger
        onClick={() => setIsOpen(!isOpen)}
        $isOpen={isOpen}
        $isSelected={!!selectedLabel}
      >
        <LabelText>{displayLabel}</LabelText>
        <IconWrapper $isOpen={isOpen}>
          <FiChevronDown />
        </IconWrapper>
      </SelectTrigger>

      {/* 펼쳐지는 옵션 목록 영역 */}
      <DropdownMenu $isOpen={isOpen}>
        {options.map((opt, index) => {
          const optValue = typeof opt === "object" ? opt.value : opt;
          const optLabel = typeof opt === "object" ? opt.label : opt;
          const isSelected = value === optValue;

          return (
            <OptionItem
              key={index}
              onClick={() => handleSelect(opt)}
              $isSelected={isSelected}
            >
              {optLabel}
            </OptionItem>
          );
        })}
        {options.length === 0 && <NoOption>옵션이 없습니다</NoOption>}
      </DropdownMenu>
    </Container>
  );
};

export default SelectBar;


const sizeMap = {
  s: "120px",
  m: "180px",
  l: "250px",
};

const Container = styled.div`
  position: relative;
  width: ${(props) => sizeMap[props.$width] || props.$width};
  height: 30px;
  box-sizing: border-box;
  font-size: var(--fontSm);
`;

const SelectTrigger = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 15px;
  background-color: var(--background2);
  border: 1px solid ${(props) => (props.$isOpen ? "var(--font2)" : "transparent")};
  border-radius: 20px; 
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  box-sizing: border-box;
  color: ${(props) => (props.$isSelected ? "var(--font2)" : "var(--font)")};
  

  &:hover {
    border-color: var(--font2);
    background-color: var(--background2);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }
`;

const LabelText = styled.div`
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
  justify-content: flex-start;
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: var(--font2);
  
  padding: 0 2px;

  transition: transform 0.3s ease;
  transform: ${(props) => (props.$isOpen ? "rotate(180deg)" : "rotate(0deg)")};
`;

const DropdownMenu = styled.ul`
  position: absolute;
  top: 110%; 
  left: 0;
  width: 100%;
  max-height: 200px; 
  overflow-y: auto;

  display: flex;
  flex-direction: column;
  gap: 5px;
  
  background-color: var(--background);
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  
  padding: 5px;
  margin: 0;
  list-style: none;
  z-index: 100; 

  opacity: ${(props) => (props.$isOpen ? 1 : 0)};
  visibility: ${(props) => (props.$isOpen ? "visible" : "hidden")};
  transform: ${(props) => (props.$isOpen ? "translateY(0)" : "translateY(-10px)")};
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: var(--border);
    border-radius: 3px;
  }
`;

const OptionItem = styled.li`
  padding: 10px 12px;
  border-radius: 20px;
  cursor: pointer;
  color: var(--font);
  font-size: var(--fontSm);
  transition: background-color 0.2s;
  
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 25px;

  ${(props) =>
    props.$isSelected &&
    css`
      font-weight: var(--medium);
      color: var(--main);
      background-color: var(--background2);
    `}

  &:hover {
    background-color: var(--background2); 
    color: var(--main);
  }
`;

const NoOption = styled.li`
  padding: 15px;
  text-align: center;
  color: var(--font2);
  font-size: var(--fontXs);
`;