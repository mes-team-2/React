import React from "react";
import styled from "styled-components";
import QRCodeCreate from "../components/QRCodeCreate"; // 경로에 맞게 수정하세요

const Test = () => {
  // 테스트용 더미 데이터
  const productLot = {
    code: "LOT-20260207-007",
    date: "2024-02-07",
  };

  const materialLot = {
    code: "ML-260206-0008-INIT",
    date: "2024-02-07",
  };

  return (
    <Wrapper>
      <Title>QR Code Component Test</Title>

      <TestContainer>
        {/* 테스트 1: 제품 QR 코드 */}
        <TestCard>
          <h3>1. 제품 LOT (Product)</h3>
          <p>예상 URL: .../product-lot-qr/{productLot.code}</p>
          <div className="qr-box">
            <QRCodeCreate
              value={productLot.code}
              date={productLot.date}
              type="PRODUCT" // 생략해도 기본값이지만 명시
              size="m"
              showText={true}
              showDate={true}
              showDownload={true}
            />
          </div>
        </TestCard>

        {/* 테스트 2: 자재 QR 코드 */}
        <TestCard>
          <h3>2. 자재 LOT (Material)</h3>
          <p>예상 URL: .../material-lot-qr/{materialLot.code}</p>
          <div className="qr-box">
            <QRCodeCreate
              value={materialLot.code}
              date={materialLot.date}
              type="MATERIAL" // ★ 핵심: 자재 URL로 생성되는지 확인
              size="m"
              showText={true}
              showDate={true}
              showDownload={true}
            />
          </div>
        </TestCard>
      </TestContainer>
    </Wrapper>
  );
};

export default Test;

const Wrapper = styled.div`
  padding: 40px;
  background-color: #f5f5f5;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 30px;
  color: #333;
`;

const TestContainer = styled.div`
  display: flex;
  gap: 40px;
  justify-content: center;
  flex-wrap: wrap;
`;

const TestCard = styled.div`
  background: white;
  padding: 30px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 300px;

  h3 {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 10px;
    color: #333;
  }

  p {
    font-size: 12px;
    color: #666;
    margin-bottom: 20px;
    background: #eee;
    padding: 8px;
    border-radius: 4px;
    word-break: break-all;
    text-align: center;
  }

  .qr-box {
    border: 1px dashed #ccc;
    padding: 10px;
    border-radius: 8px;
  }
`;
