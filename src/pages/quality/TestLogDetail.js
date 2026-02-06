import styled from "styled-components";
import { useMemo } from "react";
import { FiThermometer, FiDroplet, FiZap } from "react-icons/fi";
import Status from "../../components/Status";

// 불량 코드 한글 매핑 상수
const DEFECT_NAMES = {
  SCRATCH: "스크래치",
  THICKNESS_ERROR: "두께 불량",
  MISALIGNMENT: "정렬 불량",
  MISSING_PART: "부품 누락",
  LOW_VOLTAGE: "전압 미달",
  HIGH_TEMP: "고온 발생",
  WELDING_ERROR: "용접 불량",
  LABEL_ERROR: "라벨 부착 불량",
  DIMENSION_ERROR: "치수 불량",
  FOREIGN_MATERIAL: "이물질 혼입",
  ETC: "기타",
  NONE: "양품",
};

// 코드 -> 한글 변환 헬퍼 함수
const getDefectName = (code) => DEFECT_NAMES[code] || code;

export default function TestLogDetail({ row }) {
  const defectName = useMemo(() => {
    if (!row?.defectCode) return "-";
    return getDefectName(row.defectCode);
  }, [row]);

  console.log("DETAIL ROW:", row);

  if (!row) {
    return <Empty>검사 항목을 선택하세요.</Empty>;
  }

  return (
    <Wrapper>
      <Header>
        <h3>검사 상세</h3>
      </Header>

      <Content>
        <Section>
          <SectionTitle>기본정보</SectionTitle>
          <Grid>
            <FullItem>
              <label>제품명</label>
              <Value>{row.productName}</Value>
            </FullItem>
            <FullItem>
              <label>작업지시</label>
              <Value>{row.workOrderNo}</Value>
            </FullItem>
            <FullItem>
              <label>LOT 번호</label>
              <Value>{row.lotNo}</Value>
            </FullItem>

            <FullItem>
              <label>공정명</label>
              <Value>{row.processStep}</Value>
            </FullItem>
            <FullItem>
              <label>설비명</label>
              <Value>{row.machine}</Value>
            </FullItem>
            <FullItem>
              <label>검사자</label>
              <Value>{row.inspector}</Value>
            </FullItem>
          </Grid>
        </Section>

        <Section>
          <SectionTitle>불량정보</SectionTitle>
          <Grid>
            <Item>
              <label>불량코드</label>
              <Value>{row.result === "NG" ? row.defectCode : "-"}</Value>
            </Item>
            <Item>
              <label>불량유형</label>
              <Value>{row.result === "NG" ? defectName : "-"}</Value>
            </Item>
            <FullItem>
              <label>메모</label>
              <Value>{row.note || "-"}</Value>
            </FullItem>
          </Grid>
        </Section>

        <Section>
          <SectionTitle>환경정보</SectionTitle>
          <Grid col={3}>
            <MiniItem>
              <label>온도</label>
              <IconValue $iconColor="var(--error)">
                <FiThermometer />
                {row.temperature}℃
              </IconValue>
              <Note>Spec ≤ 27</Note>
            </MiniItem>
            <MiniItem>
              <label>습도</label>
              <IconValue $iconColor="var(--main)">
                <FiDroplet />
                {row.humidity}%
              </IconValue>
              <Note>Spec ≤ 50</Note>
            </MiniItem>
            <MiniItem>
              <label>전압</label>
              <IconValue $iconColor="var(--waiting)">
                <FiZap />
                {row.voltage}V
              </IconValue>
              <Note>Spec ≤ 223</Note>
            </MiniItem>
          </Grid>
        </Section>
      </Content>
    </Wrapper>
  );
}

const Empty = styled.div`
  padding: 40px 20px;
  color: var(--font2);
  text-align: center;
`;

const Wrapper = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  height: 100%;
`;
const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  h3 {
    font-size: var(--fontHd);
    font-weight: var(--bold);
  }
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px;
  overflow-y: auto;
  padding-right: 10px;
  padding-bottom: 100px;
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: var(--background2);
    border-radius: 3px;
  }
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SectionTitle = styled.h4`
  font-size: var(--fontMd);
  font-weight: var(--bold);
  color: var(--font);
  display: flex;
  align-items: center;
  position: relative;
  padding-left: 12px;
  &::before {
    content: "";
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 16px;
    background-color: var(--main);
    border-radius: 2px;
  }
`;

const QRBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(${(props) => props.col || 2}, 1fr);
  gap: 12px;
`;
const Item = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  label {
    font-size: var(--fontXs);
    font-weight: var(--medium);
    color: var(--font2);
    padding: 2px;
  }
`;

const MiniItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  label {
    font-size: var(--fontXs);
    font-weight: var(--medium);
    color: var(--font2);
    padding: 2px;
  }
`;

const FullItem = styled(Item)`
  grid-column: 1 / -1;
`;
const Value = styled.div`
  display: flex;
  align-items: center;
  padding: 10px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--background);
  min-height: 38px;
  font-size: var(--fontSm);
  color: var(--font);
`;

const Note = styled.div`
  font-size: var(--fontXxs);
  color: var(--font2);
  padding: 2px;
  padding-left: 5px;
`;

const IconValue = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--background);
  min-height: 38px;
  font-size: var(--fontSm);
  color: var(--font);
  svg {
    font-size: var(--fontLg);
    color: ${(props) => props.$iconColor || "var(--font2)"};
  }
`;
