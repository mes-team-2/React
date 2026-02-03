import React, { useState } from "react";
import styled from "styled-components";
import QRCodeCreate from "../components/QRCodeCreate";

import Button from "../components/Button";

export default function Test() {
  /* =========================
      1. 상태 관리
  ========================= */
  const [lotList, setLotList] = useState([]); // 생성된 LOT 목록 관리
  const [currentLot, setCurrentLot] = useState(""); // 방금 생성된 최신 LOT

  /* =========================
      2. LOT 생성 로직 (자동 QR 연동)
  ========================= */
  const handleGenerateLot = () => {
    // 실제 환경에서는 API 호출 후 응답받은 번호를 사용함
    // 여기서는 테스트를 위해 날짜 조합으로 유니크한 LOT 번호 생성
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
    const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
    const newLotNo = `LOT-${dateStr}-${randomStr}`;

    // 최신 LOT 상태 업데이트 -> QRCodeCreate가 이 값을 받아 자동으로 생성됨
    setCurrentLot(newLotNo);

    // 목록에도 추가
    setLotList((prev) => [
      { id: prev.length + 1, lotNo: newLotNo, date: now.toLocaleString() },
      ...prev,
    ]);
  };

  return (
    <Wrapper>
      <Header>
        <h2>제품 LOT 관리</h2>
        <p>생성 버튼 클릭 시 자동으로 QR코드가 발행됩니다.</p>
      </Header>

      <MainContent>
        {/* 왼쪽: LOT 생성 및 최신 QR 확인 영역 */}
        <CreateSection>
          <Card>
            <h3>신규 LOT 발행</h3>
            <Button variant="ok" size="l" onClick={handleGenerateLot}>
              새 제품 LOT 생성하기
            </Button>

            {/* LOT가 있을 때만 QR 컴포넌트가 나타남 */}
            {currentLot ? (
              <QRContainer>
                <QRCodeCreate value={currentLot} size={50} />
              </QRContainer>
            ) : (
              <EmptyBox>버튼을 눌러 LOT를 생성하세요.</EmptyBox>
            )}
          </Card>
        </CreateSection>

        {/* 오른쪽: 이력 목록 영역 */}
        <ListSection>
          <Card>
            <h3>발행 이력 (최근 5건)</h3>
            <HistoryList>
              {lotList.length > 0 ? (
                lotList.slice(0, 5).map((item) => (
                  <HistoryItem
                    key={item.id}
                    onClick={() => setCurrentLot(item.lotNo)}
                  >
                    <div>
                      <strong>{item.lotNo}</strong>
                      <span>{item.date}</span>
                    </div>
                    <small>클릭 시 QR 보기</small>
                  </HistoryItem>
                ))
              ) : (
                <p>생성된 이력이 없습니다.</p>
              )}
            </HistoryList>
          </Card>
        </ListSection>
      </MainContent>
    </Wrapper>
  );
}

/* =========================
      3. 스타일 정의
  ========================= */
const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
`;

const Header = styled.div`
  h2 {
    font-size: 24px;
    font-weight: 700;
    color: var(--font);
  }
  p {
    font-size: 14px;
    color: var(--font2);
    margin-top: 5px;
  }
`;

const MainContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: var(--background);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid var(--border);
  box-shadow: var(--shadow);
  h3 {
    font-size: 18px;
    margin-bottom: 20px;
    font-weight: 600;
  }
`;

const CreateSection = styled.div`
  display: flex;
  flex-direction: column;
`;

const QRContainer = styled.div`
  margin-top: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const EmptyBox = styled.div`
  margin-top: 30px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed var(--border);
  border-radius: 12px;
  color: var(--font2);
  font-size: 14px;
`;

const ListSection = styled.div``;

const HistoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const HistoryItem = styled.div`
  padding: 12px;
  border-radius: 8px;
  border: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    background: var(--background2);
    border-color: var(--main);
  }
  div {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  strong {
    font-size: 14px;
    color: var(--font);
  }
  span {
    font-size: 12px;
    color: var(--font2);
  }
  small {
    color: var(--main);
    font-size: 11px;
  }
`;
