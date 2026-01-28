import styled from "styled-components";

export default function ProcessLogDetail({ log }) {
  return (
    <Wrapper>
      <h3>공정 이력 상세</h3>

      <Grid>
        <Item>
          <label>LOT</label>
          <strong>{log.lotNo}</strong>
        </Item>
        <Item>
          <label>공정</label>
          <strong>{log.processStep}</strong>
        </Item>
        <Item>
          <label>설비</label>
          <strong>{log.machine}</strong>
        </Item>
        <Item>
          <label>상태</label>
          <strong>{log.status}</strong>
        </Item>
        <Item>
          <label>시작 시간</label>
          <strong>{log.startTime}</strong>
        </Item>
        <Item>
          <label>종료 시간</label>
          <strong>{log.endTime}</strong>
        </Item>
        <Item>
          <label>작업자 사번</label>
          <strong>{log.workerCode}</strong>
        </Item>
      </Grid>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;

  h3 {
    font-size: 20px;
    font-weight: 700;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
`;

const Item = styled.div`
  background: white;
  padding: 14px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);

  label {
    font-size: 11px;
    opacity: 0.6;
  }

  strong {
    display: block;
    margin-top: 6px;
    font-size: 14px;
  }
`;

const Empty = styled.div`
  padding: 60px 20px;
  text-align: center;
  opacity: 0.6;
`;
