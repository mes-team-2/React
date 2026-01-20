import styled from "styled-components";
import Table from "../../components/TableStyle";

export default function MaterialDetail({ material, onClose }) {
  // 🔒 material 없으면 렌더 안 함
  if (!material) return null;

  /* =========================
     위치별 재고 (더미)
  ========================= */
  const locationColumns = [
    { key: "location", label: "위치", width: 120 },
    { key: "qty", label: "수량", width: 100 },
    { key: "updatedAt", label: "업데이트 시각", width: 160 },
  ];

  const locationData = [
    {
      id: 1,
      location: "자재 창고 1",
      qty: 1200,
      updatedAt: "2026/01/01 12:34",
    },
    {
      id: 2,
      location: "공정라인 A",
      qty: 345,
      updatedAt: "2026/01/01 13:55",
    },
  ];

  /* =========================
     숫자 안전 처리
  ========================= */
  const stock = Number(material.stock ?? 0).toLocaleString();
  const safeStock = Number(material.safeStock ?? 0).toLocaleString();

  return (
    <Wrapper>
      {/* ===== 헤더 ===== */}
      <Header>
        <h3>자재 재고 상세 조회</h3>
        <CloseButton onClick={onClose}>✕</CloseButton>
      </Header>

      {/* ===== 기본 정보 ===== */}
      <FormGrid>
        <Field>
          <label>자재코드</label>
          <input value={material.materialCode || "-"} readOnly />
        </Field>

        <Field>
          <label>자재명</label>
          <input value={material.materialName || "-"} readOnly />
        </Field>

        <Field>
          <label>재고</label>
          <input value={stock} readOnly />
        </Field>

        <Field>
          <label>안전재고</label>
          <input value={safeStock} readOnly />
        </Field>

        <Field>
          <label>단위</label>
          <input value={material.unit || "-"} readOnly />
        </Field>

        <Field>
          <label>재고상태</label>
          <StatusBadge status={material.status || "안전"}>
            {material.status || "안전"}
          </StatusBadge>
        </Field>

        <Field>
          <label>자재등록일자</label>
          <input value={material.createdAt || "-"} readOnly />
        </Field>

        <Field>
          <label>입고일자</label>
          <input value={material.inboundAt || "-"} readOnly />
        </Field>
      </FormGrid>

      {/* ===== 위치별 재고 ===== */}
      <Section>
        <SectionTitle>위치별 재고 현황</SectionTitle>
        <Table
          columns={locationColumns}
          data={locationData}
          selectable={false}
        />
      </Section>

      {/* ===== 버튼 ===== */}
      <ButtonArea>
        <CancelButton onClick={onClose}>취소</CancelButton>
        <SubmitButton>등록</SubmitButton>
      </ButtonArea>
    </Wrapper>
  );
}

/* =========================
   styled (❗ 그대로 유지)
========================= */

const Wrapper = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  h3 {
    font-size: 18px;
    font-weight: 700;
  }
`;

const CloseButton = styled.button`
  font-size: 18px;
  opacity: 0.6;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;

  label {
    font-size: 11px;
    opacity: 0.6;
  }

  input {
    padding: 10px;
    border-radius: 10px;
    border: 1px solid var(--border);
    background: #fafafa;
    font-size: 13px;
  }
`;

const StatusBadge = styled.div`
  padding: 10px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  text-align: center;
  background: ${({ status }) =>
    status === "안전" ? "#e7f9ef" : status === "주의" ? "#fff7e6" : "#fee2e2"};
  color: ${({ status }) =>
    status === "안전" ? "#16a34a" : status === "주의" ? "#d97706" : "#dc2626"};
`;

const Section = styled.div`
  margin-top: 8px;
`;

const SectionTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
`;

const ButtonArea = styled.div`
  margin-top: auto;
  display: flex;
  gap: 10px;
`;

const CancelButton = styled.button`
  flex: 1;
  padding: 12px;
  border-radius: 20px;
  background: #f1f1f1;
  font-size: 14px;
`;

const SubmitButton = styled.button`
  flex: 1;
  padding: 12px;
  border-radius: 20px;
  background: var(--main);
  color: white;
  font-size: 14px;
`;
