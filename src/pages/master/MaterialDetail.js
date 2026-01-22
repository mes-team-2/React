import styled from "styled-components";
import { useEffect, useState } from "react";
import Table from "../../components/TableStyle";
import { InventoryAPI } from "../../api/AxiosAPI";

export default function MaterialDetail({ material, onClose }) {
  // [수정] 1. Hook을 조건문(if)보다 무조건 먼저 선언해야 합니다.
  const [lotList, setLotList] = useState([]);

  // [수정] 2. useEffect 내부에서 material 유무를 체크하도록 변경
  useEffect(() => {
    // material이 없거나 ID가 없으면 API 호출 안 함
    if (!material || !material.materialId) return;

    const fetchLots = async () => {
      try {
        const response = await InventoryAPI.getMaterialLots(
          material.materialId,
        );
        if (response.status === 200) {
          setLotList(response.data);
        }
      } catch (e) {
        console.error("LOT 조회 실패:", e);
      }
    };

    fetchLots();
  }, [material]);

  // [수정] 3. Hook 선언이 다 끝난 뒤에 예외 처리(Guard Clause)를 수행
  if (!material) return null;

  /* =========================
     위치별 재고 (백엔드 데이터 기반 가공)
  ========================= */
  const locationColumns = [
    { key: "location", label: "위치", width: 120 },
    { key: "qty", label: "수량", width: 100 },
    { key: "updatedAt", label: "최근 입고일", width: 160 },
  ];

  const locationData = [
    {
      id: 1,
      location: "자재 창고 (Main)",
      qty: Number(material.stockQty ?? 0).toLocaleString(),
      updatedAt: material.inboundAt || "-",
    },
  ];

  /* =========================
     LOT별 재고 (실제 데이터 매핑)
  ========================= */
  const lotColumns = [
    { key: "lotNo", label: "LOT 번호", width: 180 },
    { key: "inboundAt", label: "입고일", width: 160 },
    { key: "qty", label: "잔량", width: 120 },
    { key: "status", label: "상태", width: 120 },
    { key: "remark", label: "비고", width: 180 },
  ];

  const lotData = lotList.map((lot) => ({
    id: lot.materialLotId,
    lotNo: lot.materialLotNo,
    inboundAt: lot.inputDate,
    qty: Number(lot.remainQty).toLocaleString(),
    status: lot.status === "AVAILABLE" ? "사용가능" : "소진",
    remark: "-",
  }));

  /* =========================
     데이터 표시용 변수 처리
  ========================= */
  const stock = Number(material.stockQty ?? 0).toLocaleString();
  const safeStock = Number(material.safeQty ?? 0).toLocaleString();

  // Status.js 매핑 로직
  let statusLabel = "안전";
  let statusKey = material.stockStatus;

  if (statusKey === "SAFE" || statusKey === "OK") statusLabel = "안전";
  else if (statusKey === "WARNING" || statusKey === "CAUTION")
    statusLabel = "주의";
  else if (statusKey === "DANGER" || statusKey === "FAIL") statusLabel = "경고";

  return (
    <Wrapper>
      <Header>
        <h3>자재 재고 상세 조회</h3>
      </Header>

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
          <StatusBadge status={statusLabel}>{statusLabel}</StatusBadge>
        </Field>

        <Field>
          <label>자재등록일자</label>
          <input value={material.createdAt || "-"} readOnly />
        </Field>

        <Field>
          <label>최근 입고일자</label>
          <input value={material.inboundAt || "-"} readOnly />
        </Field>
      </FormGrid>

      <Section>
        <SectionTitle>위치별 재고 현황</SectionTitle>
        <Table
          columns={locationColumns}
          data={locationData}
          selectable={false}
        />
      </Section>

      <Section>
        <SectionTitle>LOT별 재고 현황</SectionTitle>
        <Table columns={lotColumns} data={lotData} selectable={false} />
        <Note>
          ※ LOT는 “입고 단위”이며, 생산/차감/불량 추적의 기준이 됩니다.
        </Note>
      </Section>

      <ButtonArea>
        <CancelButton onClick={onClose}>닫기</CancelButton>
      </ButtonArea>
    </Wrapper>
  );
}

/* Styled Components (기존과 동일) */
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
const Note = styled.div`
  margin-top: 8px;
  font-size: 12px;
  opacity: 0.65;
`;
const ButtonArea = styled.div`
  margin-top: auto;
`;
const CancelButton = styled.button`
  width: 100%;
  padding: 12px;
  border-radius: 20px;
  background: #f1f1f1;
  font-size: 14px;
`;
