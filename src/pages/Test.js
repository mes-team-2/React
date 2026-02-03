import React, { useState } from "react";
import styled from "styled-components";
import { QRCodeCanvas } from "qrcode.react";
import Button from "../components/Button";

export default function Test() {
  // 모바일 테스트를 위해 본인 PC IP 입력 필수
  const [hostUrl, setHostUrl] = useState("http://172.30.1.10:3000");

  const [isStarted, setIsStarted] = useState(false);
  const [lotInfo, setLotInfo] = useState(null);

  // 작업 시작 핸들러
  const handleStartWork = () => {
    // 1. 실제로는 API 호출 (await axios.post('/api/work/start', ...))
    // 2. 서버로부터 생성된 LOT 번호를 응답받음
    const newLotNo = `LOT-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-A01`;

    setLotInfo({
      lotNo: newLotNo,
      productName: "12V 중형 배터리 (Standard)",
      qty: 1000,
      startTime: new Date().toLocaleTimeString(),
    });
    setIsStarted(true);
  };

  // QR에 담길 URL (상세 페이지 주소)
  const qrUrl = lotInfo ? `${hostUrl}/lot-qr-detail/${lotInfo.lotNo}` : "";

  return (
    <Container>
      <Card>
        <Header>
          <h2>작업 시작 / QR 생성 시뮬레이션</h2>
          <p>작업 시작 버튼을 누르면 LOT와 QR이 생성됩니다.</p>
        </Header>

        {!isStarted ? (
          <StartSection>
            <InputGroup>
              <label>Host URL (PC IP)</label>
              <input
                value={hostUrl}
                onChange={(e) => setHostUrl(e.target.value)}
                placeholder="http://192.168.x.x:3000"
              />
              <span>※ 모바일 스캔을 위해 정확한 IP를 입력하세요.</span>
            </InputGroup>

            <Button variant="ok" size="xl" onClick={handleStartWork}>
              작업 시작 (LOT 생성)
            </Button>
          </StartSection>
        ) : (
          <ResultSection>
            <StatusBadge>🟢 생산 진행중</StatusBadge>
            <InfoGrid>
              <Item>
                <label>생성된 LOT 번호</label>
                <strong>{lotInfo.lotNo}</strong>
              </Item>
              <Item>
                <label>제품명</label>
                <strong>{lotInfo.productName}</strong>
              </Item>
              <Item>
                <label>지시 수량</label>
                <strong>{lotInfo.qty} EA</strong>
              </Item>
              <Item>
                <label>시작 시간</label>
                <strong>{lotInfo.startTime}</strong>
              </Item>
            </InfoGrid>

            <QRBox>
              <QRCodeCanvas
                value={qrUrl}
                size={180}
                bgColor={"#ffffff"}
                fgColor={"#000000"}
                level={"H"}
                includeMargin={true}
              />
              <UrlText>{qrUrl}</UrlText>
              <p>모바일로 스캔하여 상세 정보를 확인하세요.</p>
            </QRBox>

            <Button
              variant="cancel"
              size="m"
              onClick={() => setIsStarted(false)}
            >
              초기화
            </Button>
          </ResultSection>
        )}
      </Card>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f0f2f5;
  padding: 20px;
`;

const Card = styled.div`
  background: white;
  width: 100%;
  max-width: 500px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  background: #fff;
  padding: 24px;
  border-bottom: 1px solid #eee;
  text-align: center;
  h2 {
    margin: 0 0 8px;
    font-size: 20px;
    color: #333;
  }
  p {
    margin: 0;
    color: #888;
    font-size: 14px;
  }
`;

const StartSection = styled.div`
  padding: 40px 24px;
  display: flex;
  flex-direction: column;
  gap: 30px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  label {
    font-weight: bold;
    color: #555;
  }
  input {
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 16px;
  }
  span {
    font-size: 12px;
    color: #e74c3c;
  }
`;

const ResultSection = styled.div`
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  animation: fadeIn 0.5s ease-out;
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const StatusBadge = styled.div`
  background: #e6fcf5;
  color: #0ca678;
  padding: 6px 16px;
  border-radius: 20px;
  font-weight: bold;
  font-size: 14px;
`;

const InfoGrid = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  background: #f8f9fa;
  padding: 16px;
  border-radius: 12px;
`;

const Item = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  label {
    font-size: 12px;
    color: #888;
  }
  strong {
    font-size: 14px;
    color: #333;
  }
`;

const QRBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin: 10px 0;
  p {
    font-size: 13px;
    color: #666;
    margin: 0;
  }
`;

const UrlText = styled.div`
  font-size: 11px;
  color: #aaa;
  word-break: break-all;
  text-align: center;
  max-width: 250px;
`;
