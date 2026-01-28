import React from 'react';
import styled from "styled-components";
import { FiBox, FiActivity, FiCalendar } from "react-icons/fi";
import Status from "../../components/Status";

export default function MaterialLotDetail({ row, onClose }) {
  if (!row) return null;

  // 상태값 매핑 (Status 컴포넌트용)
  let statusKey = "DEFAULT";
  if (row.status === "WAITING") statusKey = "LOT_WAIT";
  else if (row.status === "RUNNING") statusKey = "LOT_RUN";
  else if (row.status === "EMPTY") statusKey = "LOT_ERR";

  return (
    <Container>
      <Header>
        <Title>자재 LOT 상세 정보</Title>
      </Header>

      <Content>
        {/* 섹션 1: 기본 정보 */}
        <Section>
          <SectionTitle><FiBox /> 기본 정보</SectionTitle>
          <Grid>
            <Field>
              <Label>LOT 번호</Label>
              <Value className="mono bold">{row.lot_no}</Value>
            </Field>
            <Field>
              <Label>자재코드</Label>
              <Value className="mono">{row.code}</Value>
            </Field>
            <Field style={{ gridColumn: "1 / -1" }}>
              <Label>자재명</Label>
              <Value className="bold">{row.name}</Value>
            </Field>
            <Field>
              <Label>현재 상태</Label>
              <div style={{ display: 'flex' }}>
                <Status status={statusKey} type="wide" />
              </div>
            </Field>
          </Grid>
        </Section>

        {/* 섹션 2: 재고 현황 */}
        <Section>
          <SectionTitle><FiActivity /> 재고 현황</SectionTitle>
          <Grid>
            <Field>
              <Label>현재고</Label>
              <Value>{row.current.toLocaleString()} <Unit>EA</Unit></Value>
            </Field>
            <Field>
              <Label>생산 투입중</Label>
              <Value>{row.production.toLocaleString()} <Unit>EA</Unit></Value>
            </Field>
            <Field style={{ gridColumn: "1 / -1" }}>
              <Label>가용 재고 (투입 가능)</Label>
              <HighlightValue>
                {row.available.toLocaleString()} <Unit>EA</Unit>
              </HighlightValue>
            </Field>
          </Grid>
        </Section>

        {/* 섹션 3: 이력 정보 */}
        <Section>
          <SectionTitle><FiCalendar /> 이력 정보</SectionTitle>
          <Grid>
            <Field>
              <Label>최초 입고일</Label>
              <Value>{row.inbound_date}</Value>
            </Field>
            <Field>
              <Label>최근 상태 변경일</Label>
              <Value>{row.date}</Value>
            </Field>
          </Grid>
        </Section>
      </Content>

      <Footer>
        <Button onClick={onClose}>닫기</Button>
      </Footer>
    </Container>
  );
}

// 스타일 컴포넌트
const Container = styled.div`
  display: flex; flex-direction: column; height: 100%; gap: 20px;
`;

const Header = styled.div`
  padding-bottom: 20px; border-bottom: 1px solid var(--border);
`;

const Title = styled.h2`
  font-size: var(--fontXl); font-weight: var(--bold); color: var(--font);
`;

const Content = styled.div`
  flex: 1; display: flex; flex-direction: column; gap: 30px; overflow-y: auto;
`;

const Section = styled.div`
  display: flex; flex-direction: column; gap: 12px;
`;

const SectionTitle = styled.h3`
  font-size: var(--fontMd); font-weight: var(--bold); color: var(--font);
  display: flex; align-items: center; gap: 8px;
  svg { color: var(--main); }
`;

const Grid = styled.div`
  display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
`;

const Field = styled.div`
  display: flex; flex-direction: column; gap: 6px;
  background: var(--background); padding: 12px; border-radius: 8px;
  border: 1px solid var(--border);
`;

const Label = styled.span`
  font-size: var(--fontXs); color: var(--font2);
`;

const Value = styled.div`
  font-size: var(--fontSm); color: var(--font);
  &.mono { font-family: monospace; }
  &.bold { font-weight: var(--bold); }
`;

const HighlightValue = styled(Value)`
  color: var(--main); font-weight: var(--bold); font-size: var(--fontMd);
`;

const Unit = styled.span`
  font-size: var(--fontXs); color: var(--font2); font-weight: normal; margin-left: 4px;
`;

const Footer = styled.div`
  margin-top: auto; display: flex; justify-content: flex-end;
  padding-top: 20px; border-top: 1px solid var(--border);
`;

const Button = styled.button`
  padding: 10px 24px; border-radius: 8px;
  background: var(--font2); color: white; border: none;
  font-weight: var(--bold); cursor: pointer;
  &:hover { opacity: 0.9; }
`;