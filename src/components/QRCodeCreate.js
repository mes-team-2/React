import React, { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import styled from "styled-components";
import Button from "./Button";

// QR코드 사이즈 매핑 객체
const sizeMap = {
  xs: 35,
  s: 50,
  m: 100,
  l: 150,
};

const QRCodeCreate = ({
  value,
  date,
  type = "PRODUCT",
  size = "m",
  showText = false,
  showDate = false,
  showDownload = false,
}) => {
  const qrRef = useRef(null);
  const currentSize = sizeMap[size] || 100;

  // ★ 시연할 사람 보세요 !!!!
  // 내부망이라서 cmd에 ipconfig 쳐서 IPv4 주소 확인해서 넣으면 됩니다
  // 일단 아래 주소는 제거(하린)에요
  const HOST_URL = "http://172.30.1.10:3000";

  const targetUrl =
    type === "MATERIAL"
      ? `${HOST_URL}/material-lot-qr/${value}`
      : `${HOST_URL}/product-lot-qr/${value}`;

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
          value={value ? targetUrl : "No Data"}
          size={currentSize}
          bgColor={"#ffffff"}
          fgColor={"#000000"}
          level={"H"}
          includeMargin={true}
        />
      </QRWrapper>

      <TextGroup>
        {showText && <InfoText>{value || "데이터 없음"}</InfoText>}
        {showDate && <DateText>{date || "데이터 없음"}</DateText>}
      </TextGroup>
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
  gap: 5px;
  padding: 10px;
  background: white;
  width: fit-content;
`;

const QRWrapper = styled.div`
  background: white;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const TextGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: 10px;
`;

const InfoText = styled.span`
  font-size: var(--fontXxs);
  font-weight: var(--normal);
  color: var(--font2);
  text-align: center;
`;

const DateText = styled.span`
  font-size: 10px;
  font-weight: var(--normal);
  color: var(--font2);
  text-align: center;
  margin-top: -2px;
`;
