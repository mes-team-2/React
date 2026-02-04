import styled from "styled-components";
import {
  FiBox,
  FiActivity,
  FiClock,
  FiThermometer,
  FiDroplet,
  FiZap,
} from "react-icons/fi";

export default function ProcessLogDetail({ log }) {
  if (!log) return null;

  return (
    <Wrapper>
      <Header>
        <h3>공정 이력 상세</h3>
        {/* 상태 배지 */}
        <StatusBadge $status={log.status}>{log.status}</StatusBadge>
      </Header>

      <Content>
        {/* 1. 기본 정보 섹션 */}
        <Section>
          <SectionTitle>
            <FiBox /> 기본 정보
          </SectionTitle>
          <Grid>
            <Item>
              <Label>LOT 번호</Label>
              <Value>{log.lotNo}</Value>
            </Item>
            <Item>
              <Label>공정명</Label>
              <Value>{log.processStep}</Value>
            </Item>
            <Item>
              <Label>설비명</Label>
              <Value>{log.machineName}</Value>
            </Item>
            <Item>
              <Label>작업자</Label>
              <Value>{log.workerName}</Value>
            </Item>
          </Grid>
        </Section>

        {/* 2. 생산 실적 섹션 (집계된 데이터) */}
        <Section>
          <SectionTitle>
            <FiActivity /> 생산 실적 (집계)
          </SectionTitle>
          <StatsGrid>
            <StatBox>
              <StatLabel>양품 수량</StatLabel>
              <StatValue className="good">
                {log.goodQty} <span>EA</span>
              </StatValue>
            </StatBox>
            <StatBox>
              <StatLabel>불량 수량</StatLabel>
              <StatValue className="bad">
                {log.badQty} <span>EA</span>
              </StatValue>
            </StatBox>
          </StatsGrid>
        </Section>

        {/* 3. 환경 데이터 섹션 (평균값) */}
        <Section>
          <SectionTitle>
            <FiThermometer /> 작업 환경 (평균)
          </SectionTitle>
          <Grid col={3}>
            <EnvItem>
              <FiThermometer />
              <div>
                <span>온도</span>
                <strong>{log.temperature} ℃</strong>
              </div>
            </EnvItem>
            <EnvItem>
              <FiDroplet />
              <div>
                <span>습도</span>
                <strong>{log.humidity} %</strong>
              </div>
            </EnvItem>
            <EnvItem>
              <FiZap />
              <div>
                <span>전압</span>
                <strong>{log.voltage} V</strong>
              </div>
            </EnvItem>
          </Grid>
        </Section>

        {/* 4. 시간 정보 섹션 */}
        <Section>
          <SectionTitle>
            <FiClock /> 시간 정보
          </SectionTitle>
          <TimeBox>
            <TimeRow>
              <span>시작 시간</span>
              <strong>{log.startTime}</strong>
            </TimeRow>
            <div className="line" />
            <TimeRow>
              <span>종료 시간</span>
              <strong>{log.endTime}</strong>
            </TimeRow>
          </TimeBox>
        </Section>
      </Content>
    </Wrapper>
  );
}

// --- Styles ---
const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 10px 4px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border);

  h3 {
    font-size: 20px;
    font-weight: 700;
    color: var(--font);
  }
`;

const StatusBadge = styled.div`
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 700;
  // PASS면 초록, FAIL이면 빨강 배경
  background-color: ${(props) =>
    props.$status === "PASS"
      ? "rgba(34, 197, 94, 0.1)"
      : "rgba(239, 68, 68, 0.1)"};
  color: ${(props) => (props.$status === "PASS" ? "#16a34a" : "#dc2626")};
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SectionTitle = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: var(--font);
  display: flex;
  align-items: center;
  gap: 8px;
  svg {
    color: var(--main);
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(${(props) => props.col || 2}, 1fr);
  gap: 12px;
`;

const Item = styled.div`
  background: var(--background);
  padding: 12px;
  border-radius: 10px;
  border: 1px solid var(--border);
`;

const Label = styled.div`
  font-size: 12px;
  color: var(--font2);
  margin-bottom: 4px;
`;

const Value = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: var(--font);
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
`;

const StatBox = styled.div`
  background: white;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid var(--border);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  text-align: center;
`;

const StatLabel = styled.div`
  font-size: 13px;
  color: var(--font2);
  margin-bottom: 8px;
`;

const StatValue = styled.div`
  font-size: 20px;
  font-weight: 700;
  span {
    font-size: 14px;
    font-weight: 500;
    color: var(--font2);
  }
  &.good {
    color: var(--run);
  }
  &.bad {
    color: var(--error);
  }
`;

const EnvItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: var(--background2);
  border-radius: 10px;

  svg {
    font-size: 20px;
    color: var(--font2);
  }
  div {
    display: flex;
    flex-direction: column;
    span {
      font-size: 11px;
      color: var(--font2);
    }
    strong {
      font-size: 14px;
      color: var(--font);
    }
  }
`;

const TimeBox = styled.div`
  background: var(--background);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 12px;

  .line {
    height: 1px;
    background: var(--border);
  }
`;

const TimeRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  span {
    color: var(--font2);
  }
  strong {
    font-weight: 600;
  }
`;
