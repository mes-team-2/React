import styled from "styled-components";
import Table from "../../components/TableStyle";
import { useEffect, useState } from "react";
import { WorkerAPI } from "../../api/AxiosAPI";
import Status from "../../components/Status";

export default function WorkerDetail({ worker, onClose }) {
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
    active: worker.active, // [핵심] 목록에서 받은 active 값 사용
  };

  const history = detail?.history || [];

  // [수정] Worker.js와 동일한 로직 적용 (active가 true면 ON, false면 OFF)
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
    <Wrapper>
      <Header>
        <h3>작업자 상세</h3>
      </Header>

      <InfoGrid>
        <InfoItem>
          <label>작업자 번호</label>
          <strong>{info.workerNo}</strong>
        </InfoItem>
        <InfoItem>
          <label>이름</label>
          <strong>{info.name}</strong>
        </InfoItem>

        <InfoItem>
          <label>직급</label>
          <strong>{info.position}</strong>
        </InfoItem>

        {/* [수정] Worker.js와 100% 동일하게 근무 상태(출근/퇴근) 표시 */}
        <InfoItem>
          <label>근무 상태</label>
          <div style={{ marginTop: "6px" }}>
            <Status status={isWorking ? "ON" : "OFF"} />
          </div>
        </InfoItem>

        <InfoItem>
          <label>입사일</label>
          <strong>{info.joinedAt}</strong>
        </InfoItem>
      </InfoGrid>

      <Section>
        <SectionTitle>최근 작업 이력</SectionTitle>
        <Table columns={workHistoryColumns} data={history} selectable={false} />
      </Section>

      <ButtonArea>
        <CloseButton onClick={onClose}>닫기</CloseButton>
      </ButtonArea>
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
  h3 {
    font-size: 18px;
    font-weight: 700;
  }
`;
const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
`;
const InfoItem = styled.div`
  background: white;
  border-radius: 12px;
  padding: 14px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.04);
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
const Section = styled.div``;
const SectionTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
`;
const ButtonArea = styled.div`
  margin-top: auto;
`;
const CloseButton = styled.button`
  width: 100%;
  padding: 12px;
  border-radius: 20px;
  background: #f1f1f1;
  font-size: 14px;
  cursor: pointer;
  &:hover {
    background: #e5e5e5;
  }
`;
