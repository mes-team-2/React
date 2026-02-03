import React, { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import styled from "styled-components";
import Button from "./Button";

// QR코드 사이즈 매핑 객체
const sizeMap = {
  xs: 40,
  s: 50,
  m: 100,
  l: 150,
};

/**
 * QR코드 생성 및 다운로드 컴포넌트
 * @param {string} value - QR코드로 변환할 데이터
 * @param {string} size - 's' | 'm' | 'l' (기본값: 'm')
 * @param {boolean} showText - QR 하단 텍스트 표시 여부 (기본값: false)
 * @param {boolean} showDownload - QR 다운로드 버튼 표시 여부 (기본값: false)
 */
const QRCodeCreate = ({
  value,
  size = "m",
  showText = false, // LOT 번호 TEXT 부를건지 여부
  showDownload = false, // QR코드 다운로드(PNG로 PC에) 여부
}) => {
  const qrRef = useRef(null);

  const currentSize = sizeMap[size] || 100;

  const HOST_URL = "http://192.168.0.5:3000";
  const qrUrl = `${HOST_URL}/work-order/detail/${value}`;

  // QR코드를 PNG 이미지로 저장하는 함수
  const downloadQRCode = () => {
    const canvas = qrRef.current.querySelector("canvas");
    if (canvas) {
      const url = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = url;
      link.download = `QR_${value || "image"}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Container>
      <QRWrapper ref={qrRef}>
        <QRCodeCanvas
          value={value ? qrUrl : "No Data"}
          size={currentSize}
          bgColor={"#ffffff"}
          fgColor={"#000000"}
          level={"H"}
          includeMargin={true}
        />
      </QRWrapper>

      {showText && <InfoText>{value || "데이터 없음"}</InfoText>}

      {value && showDownload && (
        <Button variant="ok" size="xs" onClick={downloadQRCode}>
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
  padding: 5px;
  background: var(--background);
  width: fit-content;
`;

const QRWrapper = styled.div`
  background: var(--background);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const InfoText = styled.span`
  font-size: var(--fontMini);
  font-weight: var(--bold);
  color: var(--main);
  text-align: center;
  margin-top: -5px;
`;
