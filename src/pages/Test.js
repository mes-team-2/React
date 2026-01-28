import React, { useState } from "react";
import styled from "styled-components";
import SideDrawer from "../components/SideDrawer";
import MaterialLotDetail from "./production/MaterialLotDetail";

// 테스트용 더미 데이터
const MOCK_ROW_DATA = {
  id: 1,
  lot_no: "LOT-260101-TEST01",
  code: "MAT-260101-TEST01",
  name: "테스트용 배터리 케이스 (L3)",
  status: "WAITING", // WAITING, RUNNING, EMPTY 중 택 1
  current: 5000,
  production: 100,
  available: 4900,
  inbound_date: "2025-12-20",
  date: "2026/01/28 14:00"
};

export default function Test() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Container>
      <Title>컴포넌트 테스트 페이지</Title>

      <Description>
        아래 버튼을 클릭하여 <b>SideDrawer</b>와 <b>Detail</b> 컴포넌트가 <br />
        정상적으로 결합되어 작동하는지 확인하세요.
      </Description>

      <Button onClick={() => setIsOpen(true)}>
        자재 LOT 상세 조회 열기
      </Button>

      {/* SideDrawer 구현 */}
      <SideDrawer
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title="자재 LOT 상세 조회" // Drawer 헤더에 표시될 제목
      >
        {/* 내부 콘텐츠 (헤더 없음) */}
        <MaterialLotDetail row={MOCK_ROW_DATA} />
      </SideDrawer>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 80vh;
  gap: 20px;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: var(--font);
`;

const Description = styled.p`
  text-align: center;
  color: var(--font2);
  line-height: 1.5;
`;

const Button = styled.button`
  padding: 15px 30px;
  font-size: 1rem;
  font-weight: bold;
  color: white;
  background-color: var(--main); /* 테마 색상 */
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }
`;