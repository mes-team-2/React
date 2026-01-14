import styled from "styled-components";

/**
 * @param {string} value - 검색어
 * @param {Function} onChange - 검색어 변경 핸들러
 * @param {string} placeholder - placeholder 텍스트
 * @param {number} width - 입력창 너비(px)
 */
export default function SearchBar({
  value,
  onChange,
  placeholder = "검색",
  width = 260,
}) {
  return (
    <Wrapper style={{ width }}>
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </Wrapper>
  );
}

/* =========================
   styled
========================= */

const Wrapper = styled.div`
  display: flex;
  align-items: center;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid var(--border);
  outline: none;

  &:focus {
    border-color: var(--main);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
  }
`;
