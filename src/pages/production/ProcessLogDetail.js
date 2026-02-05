import styled from "styled-components";
import { FiThermometer, FiDroplet, FiZap } from "react-icons/fi";
import QRCodeCreate from "../../components/QRCodeCreate";

export default function ProcessLogDetail({ log }) {
  if (!log) return null;

  return (
    <Wrapper>
      <Header>
        <h3>공정 이력 상세</h3>
      </Header>

      <Content>
        <Section>
          <SectionTitle>LOT 조회</SectionTitle>
          <Grid>
            <FullItem>
              <QRBox>
                <QRCodeCreate
                  value={log.lotNo}
                  size="m"
                  showText={true}
                  showDownload={true}
                />
              </QRBox>
            </FullItem>
            <FullItem>
              <label>LOT 번호</label>
              <Value>{log.lotNo}</Value>
            </FullItem>
          </Grid>
        </Section>

        <Section>
          <SectionTitle>공정 정보</SectionTitle>
          <Grid>
            <FullItem>
              <label>공정명</label>
              <Value>{log.processStep}</Value>
            </FullItem>
            <FullItem>
              <label>설비명</label>
              <Value>{log.machineName}</Value>
            </FullItem>

            <FullItem>
              <label>작업자</label>
              <Value>{log.workerName}</Value>
            </FullItem>
            <FullItem>
              <label>시작시간</label>
              <Value>{log.startTime}</Value>
            </FullItem>
            <FullItem>
              <label>종료시간</label>
              <Value>{log.endTime}</Value>
            </FullItem>
          </Grid>
        </Section>

        <Section>
          <SectionTitle>생산 실적 (집계)</SectionTitle>
          <Grid>
            <Item>
              <label>양품 수량</label>
              <ValueGood>
                {log.goodQty?.toLocaleString()} <span>EA</span>
              </ValueGood>
            </Item>
            <Item>
              <label>불량 수량</label>
              <ValueBad>
                {log.badQty?.toLocaleString()} <span>EA</span>
              </ValueBad>
            </Item>
          </Grid>
        </Section>

        <Section>
          <SectionTitle>작업 환경 (평균)</SectionTitle>
          <Grid col={3}>
            <MiniItem>
              <label>온도</label>
              <IconValue $iconColor="var(--error)">
                <FiThermometer />
                {log.temperature} ℃
              </IconValue>
            </MiniItem>
            <MiniItem>
              <label>습도</label>
              <IconValue $iconColor="var(--main)">
                <FiDroplet />
                {log.humidity} %
              </IconValue>
            </MiniItem>
            <MiniItem>
              <label>전압</label>
              <IconValue $iconColor="var(--waiting)">
                <FiZap />
                {log.voltage} V
              </IconValue>
            </MiniItem>
          </Grid>
        </Section>
      </Content>
    </Wrapper>
  );
}

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

const ValueGood = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 10px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--background);
  min-height: 38px;
  font-size: var(--fontSm);
  color: var(--run);
  font-weight: var(--bold);
  span {
    font-size: var(--fontXs);
    color: var(--font2);
    font-weight: var(--normal);
  }
`;

const ValueBad = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 10px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--background);
  min-height: 38px;
  font-size: var(--fontSm);
  color: var(--error);
  font-weight: var(--bold);
  span {
    font-size: var(--fontXs);
    color: var(--font2);
    font-weight: var(--normal);
  }
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
