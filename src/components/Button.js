import React from "react";
import styled, { css } from "styled-components";

/**
 * 버튼 컴포넌트
 * @param {string} variant - 버튼 종류 ('ok', 'cancel', 'delete', 'success')
 * @param {string} size - 버튼 크기 ('xs', 's', 'm', 'l')
 * @param {string} width
 * @param {boolean} disabled - 비활성화 여부
 * @param {function} onClick - 클릭 이벤트
 * @param {node} children - 버튼 내부 텍스트 또는 아이콘
 */
const Button = ({
  children,
  variant = "ok",
  size = "m",
  width,
  disabled = false,
  onClick,
  ...rest
}) => {
  return (
    <StyledButton
      $variant={variant}
      $size={size}
      $width={width}
      disabled={disabled}
      onClick={onClick}
      {...rest}
    >
      {children}
    </StyledButton>
  );
};

export default Button;

const StyledButton = styled.button`
  display: flex;
  text-align: center;
  align-items: center;
  justify-content: center;
  border-radius: 15px;
  border: 1px solid transparent;
  font-weight: var(--medium);
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  line-height: 1;

  width: ${(props) => props.$width || "auto"};

  ${(props) =>
    props.$size === "xs" &&
    css`
      width: 80px;
      height: 20px;
      padding: 0 10px;
      font-size: var(--fontMini);
    `}

  ${(props) =>
    props.$size === "s" &&
    css`
      width: 120px;
      height: 30px;
      padding: 0 10px;
      font-size: var(--fontXs);
    `}

  ${(props) =>
    props.$size === "m" &&
    css`
      width: 130px;
      height: 30px;
      padding: 0 10px;
      font-size: var(--fontXs);
    `}

  ${(props) =>
    props.$size === "l" &&
    css`
      width: 140px;
      height: 30px;
      padding: 0 10px;
      font-size: var(--fontXs);
    `}

  
  /* ok */
  ${(props) =>
    props.$variant === "ok" &&
    css`
      background-color: var(--main);
      color: var(--font3);
      &:hover {
        opacity: 0.8;
      }
    `}

  /* cancel */
  ${(props) =>
    props.$variant === "cancel" &&
    css`
      background-color: var(--background2);
      color: var(--font);
      &:hover {
        opacity: 0.8;
      }
    `}

  /* error */
  ${(props) =>
    props.$variant === "error" &&
    css`
      background-color: var(--error);
      color: var(--font3);
      &:hover {
        opacity: 0.8;
      }
    `}

   /* Success */
   ${(props) =>
    props.$variant === "success" &&
    css`
      background-color: var(--run);
      color: var(--font3);
      &:hover {
        opacity: 0.8;
      }
    `}

  /* 비활성화 */
  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
    background-color: var(--font2);
    color: var(--font3);
    border: none;
  }
`;
