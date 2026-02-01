import React from "react";
import styled from "styled-components";

/**
 * @param {number} value - 진행률 값 (0 ~ 100)
 * @param {string} width - 전체 컨테이너 너비 (예: "100%", "200px")
 * @param {string} color - 진행 바 색상 (기본값: var(--main))
 * @param {boolean} showLabel - 퍼센트 텍스트 표시 여부 (기본값: true)
 */
const Progress = ({
  value = 0,
  width = "100%",
  color = "var(--main)",
  showLabel = true
}) => {
  const normalizedValue = Math.min(Math.max(Number(value), 0), 100);

  return (
    <ProgressWrapper $width={width}>
      <ProgressBar>
        <ProgressFill $value={normalizedValue} $color={color} />
      </ProgressBar>
      {showLabel && (
        <ProgressLabel>
          {normalizedValue.toFixed(1)}%
        </ProgressLabel>
      )}
    </ProgressWrapper>
  );
};

export default Progress;

const sizeMap = {
  s: "120px",
  m: "180px",
  l: "250px",
};

const ProgressWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  width: ${(props) => sizeMap[props.$width] || props.$width};
  padding: 0px 5px;
`;

const ProgressBar = styled.div`
  flex: 1;
  height: 8px; 
  background-color: var(--border); 
  border-radius: 4px; 
  overflow: hidden; 
`;

const ProgressFill = styled.div`
  height: 100%;
  width: ${(props) => props.$value}%;
  background-color: ${(props) => props.$color}; 
  border-radius: 4px;
  transition: width 0.4s ease-in-out; 
`;

const ProgressLabel = styled.span`
  font-size: var(--fontXs);
  color: var(--font);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  min-width: 45px; 
  text-align: right;
`;