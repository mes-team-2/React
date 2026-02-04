import styled from "styled-components";
import TableStyle from "../../components/TableStyle";
import Button from "../../components/Button";
import { useEffect, useState } from "react";
import { WorkerAPI } from "../../api/AxiosAPI";
import Status from "../../components/Status";

export default function WorkerDetail({ worker, onClose, onEdit }) {
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!worker?.id) return;
      try {
        const res = await WorkerAPI.getDetail(worker.id);
        setDetail(res.data);
      } catch (err) {
        console.error("작업자 상세 조회 실패", err);
      }
    };
    fetchDetail();
  }, [worker]);

  if (!worker) return null;

  // 기본 정보 (목록에서 넘겨받은 데이터 + 상세 조회 데이터 병합)
  const info = detail?.workerInfo || {
    workerNo: worker.workerNo,
    name: worker.name,
    position: worker.position,
    joinedAt: worker.joinedAt,
    active: worker.active,
  };

  const history = detail?.history || [];

  const isWorking = info.active;

  const workHistoryColumns = [
    { key: "process", label: "공정/설비", width: 160 },
    { key: "startTime", label: "시작 시각", width: 160 },
    { key: "endTime", label: "종료 시각", width: 160 },
    {
      key: "defect",
      label: "불량 이력",
      width: 120,
      render: (v) => (
        <span
          style={{
            color: v === "불량 발생" ? "var(--error)" : "inherit",
            fontWeight: v === "불량 발생" ? "bold" : "normal",
          }}
        >
          {v}
        </span>
      ),
    },
  ];

  return (
    <Container>
      <Header>
        <h3>작업자 상세 조회</h3>
      </Header>

      <Content>
        <Section>
          <SectionTitle>작업지시 정보</SectionTitle>
          <Grid>
            <FullItem>
              <label>작업자 번호</label>
              <Value>{info.workerNo}</Value>
            </FullItem>
            <FullItem>
              <label>이름</label>
              <Value>{info.name}</Value>
            </FullItem>
            <Item>
              <label>직급</label>
              <Value>{info.position}</Value>
            </Item>
            <Item>
              <label>근무 상태</label>
              <Status status={isWorking ? "ON" : "OFF"} type="wide" />
            </Item>
            <FullItem>
              <label>입사일</label>
              <Value>{info.joinedAt}</Value>
            </FullItem>
          </Grid>
        </Section>
        <Section>
          <SectionTitle>최근 작업 이력</SectionTitle>
          <TableStyle
            columns={workHistoryColumns}
            data={history}
            selectable={false}
          />
        </Section>
      </Content>
      <Footer>
        <Button variant="cancel" size="m" onClick={onClose}>
          닫기
        </Button>
        <Button variant="ok" size="m" onClick={onEdit}>
          수정
        </Button>
      </Footer>
    </Container>
  );
}

const Container = styled.div`
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
const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
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

const Footer = styled.div`
  margin-top: auto;
  display: flex;
  justify-content: center;
  gap: 50px;
`;
