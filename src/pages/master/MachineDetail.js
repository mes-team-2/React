import styled from "styled-components";
import SummaryCard from "../../components/SummaryCard";
import Button from "../../components/Button";
import Status from "../../components/Status";
import {
  Cpu,
  Hash,
  Power,
  Activity,
  AlertTriangle,
  Layers,
} from "lucide-react";

export default function MachineDetail({ machine, onEdit }) {
  if (!machine) return null;

  const isError = machine.status === "ERROR";

  return (
    <Wrapper>
      {/* =========================
          Summary 영역
      ========================= */}
      <SummaryGrid>
        <SummaryCard
          icon={<Cpu />}
          label="설비명"
          value={machine.machineName}
        />

        <SummaryCard
          icon={<Hash />}
          label="설비 코드"
          value={machine.machineCode}
        />

        <SummaryCard
          icon={<Power />}
          label="사용 여부"
          value={machine.active ? "사용" : "미사용"}
          color={machine.active ? "#2563eb" : "#9ca3af"}
        />

        <SummaryCard
          icon={<Activity />}
          label="상태"
          value={machine.status}
          color={
            machine.status === "RUN"
              ? "#22c55e"
              : machine.status === "ERROR"
                ? "#ef4444"
                : "#9ca3af"
          }
        />
      </SummaryGrid>

      {/* =========================
          공정 컨텍스트 영역 (NEW)
      ========================= */}
      <ProcessBlock>
        <ProcessLeft>
          <Layers size={16} />
          <span>소속 공정</span>
        </ProcessLeft>

        <ProcessBadge>{machine.processCode}</ProcessBadge>
      </ProcessBlock>

      {/* =========================
          상태 보조 정보
      ========================= */}
      <Section>
        <Row>
          <label>상태</label>
          <Status
            type={
              machine.status === "RUN"
                ? "success"
                : machine.status === "ERROR"
                  ? "error"
                  : "default"
            }
            label={machine.status}
          />
        </Row>
      </Section>

      {/* =========================
          에러 영역
      ========================= */}
      {isError && machine.errorLog && (
        <ErrorSection>
          <ErrorTitle>
            <AlertTriangle size={16} />
            설비 에러 정보
          </ErrorTitle>

          <ErrorBox>
            <p>{machine.errorLog}</p>
          </ErrorBox>
        </ErrorSection>
      )}

      {/* =========================
          Footer
      ========================= */}
      <Footer>
        <Button variant="ok" size="m" onClick={onEdit}>
          설비 수정
        </Button>
      </Footer>
    </Wrapper>
  );
}

/* =========================
   styles
========================= */

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
`;

/* 🔥 공정 컨텍스트 블록 */
const ProcessBlock = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-radius: 10px;
  background: var(--background2);
  border: 1px solid var(--border);
`;

const ProcessLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text2);

  svg {
    color: var(--main);
  }
`;

const ProcessBadge = styled.div`
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(37, 99, 235, 0.1);
  color: #2563eb;
  font-size: 12px;
  font-weight: 700;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 90px 1fr;
  align-items: center;
  font-size: 13px;

  label {
    opacity: 0.6;
  }
`;

const ErrorSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const ErrorTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #b91c1c;
`;

const ErrorBox = styled.div`
  background: #fee2e2;
  border-radius: 10px;
  padding: 12px 14px;
  font-size: 12px;
  color: #7f1d1d;
`;

const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 6px;
`;
