import React, { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import styled from "styled-components";
import Button from "./Button"; // 기존 공통 버튼 컴포넌트

/**
 * QR코드 생성 및 다운로드 컴포넌트
 * @param {string} value - QR코드로 변환할 제품 LOT 번호 등
 * @param {number} size - QR코드 크기
 */
const QRCodeCreate = ({ value, size = 150 }) => {
  const qrRef = useRef(null);

  // QR코드를 PNG 이미지로 저장하는 함수
  const downloadQRCode = () => {
    const canvas = qrRef.current.querySelector("canvas");
    if (canvas) {
      const url = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = url;
      link.download = `LOT_QR_${value}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Container>
      <QRWrapper ref={qrRef}>
        <QRCodeCanvas
          value={value || "No Data"}
          size={size}
          bgColor={"#ffffff"}
          fgColor={"#000000"}
          level={"H"} // 오류 복구 레벨 높음
          includeMargin={true}
        />
      </QRWrapper>
      <InfoText>{value || "데이터를 기다리는 중..."}</InfoText>
      {value && (
        <Button variant="ok" size="s" onClick={downloadQRCode}>
          QR 다운로드
        </Button>
      )}
    </Container>
  );
};

export default QRCodeCreate;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 10px;
  background: var(--background);
  border-radius: 12px;
  border: 1px solid var(--border);
  box-shadow: var(--shadow);
`;

const QRWrapper = styled.div`
  background: var(--background);
`;

const InfoText = styled.span`
  font-size: var(--fontSm);
  font-weight: var(--bold);
  color: var(--main);
`;
