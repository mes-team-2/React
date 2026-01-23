import styled from "styled-components";
import { useEffect, useState, useMemo } from "react";
import Table from "../../components/TableStyle";
import { InventoryAPI } from "../../api/AxiosAPI";
import MaterialInbound from "./MaterialInbound";

export default function MaterialDetail({ material, onClose, onRefresh }) {
  // 1. Hook 선언
  const [lotList, setLotList] = useState([]);
  const [showInboundModal, setShowInboundModal] = useState(false);

  // [수정] 화면에 보여줄 동적 상태 관리 (초기값은 props에서 가져옴)
  const [displayStock, setDisplayStock] = useState(0);
  const [displayInboundAt, setDisplayInboundAt] = useState("-");

  // 2. 데이터 새로고침 함수 (초기 로드 & 입고 성공 시 재호출용)
  const refreshData = async () => {
    if (!material || !material.materialId) return;
    try {
      // 최신 LOT 목록 조회
      const response = await InventoryAPI.getMaterialLots(material.materialId);

      if (response.status === 200) {
        const fetchedLots = response.data;
        setLotList(fetchedLots);

        // [핵심 수정] 받아온 LOT 리스트를 기반으로 총 재고 & 최근 입고일 재계산
        // 1) 총 재고 합산 (AVAILABLE 상태인 것만 or 전체 잔량 합산)
        const totalStock = fetchedLots.reduce(
          (acc, cur) => acc + (cur.remainQty || 0),
          0,
        );
        setDisplayStock(totalStock);

        // 2) 최근 입고일 갱신 (LOT 리스트가 최신순 정렬되어 있다고 가정)
        if (fetchedLots.length > 0) {
          setDisplayInboundAt(fetchedLots[0].inputDate);
        } else {
          setDisplayInboundAt("-");
        }
      }
    } catch (e) {
      console.error("데이터 갱신 실패:", e);
    }
  };

  // 3. material 변경 시 초기값 세팅 및 데이터 조회
  useEffect(() => {
    if (material) {
      // Props가 바뀌면 일단 Props 값으로 초기화 (깜빡임 방지)
      setDisplayStock(material.stockQty || 0);
      setDisplayInboundAt(material.inboundAt || "-");
      refreshData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [material]);

  // 4. 예외 처리

  /* =========================
  상태(Status) 라벨 동적 계산
  ========================= */
  // 재고가 변하면 상태(안전/주의/경고)도 변해야 하므로 useMemo로 계산
  const statusLabel = useMemo(() => {
    const safeQty = material.safeQty || 0;

    if (displayStock >= safeQty) return "안전";
    if (displayStock === 0) return "경고";
    return "주의";
  }, [displayStock, material.safeQty]);
  if (!material) return null;

  /* =========================
     화면 표시 데이터 포맷팅
  ========================= */
  const formattedStock = Number(displayStock).toLocaleString();
  const formattedSafeStock = Number(material.safeQty ?? 0).toLocaleString();

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
      qty: formattedStock, // [수정] 갱신된 재고 반영
      updatedAt: displayInboundAt, // [수정] 갱신된 입고일 반영
    },
  ];

  /* =========================
     LOT별 재고 테이블 데이터
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

        {/* [수정] 갱신된 displayStock 사용 */}
        <Field>
          <label>재고</label>
          <input value={formattedStock} readOnly />
        </Field>

        <Field>
          <label>안전재고</label>
          <input value={formattedSafeStock} readOnly />
        </Field>

        <Field>
          <label>단위</label>
          <input value={material.unit || "-"} readOnly />
        </Field>

        {/* [수정] 재계산된 statusLabel 사용 */}
        <Field>
          <label>재고상태</label>
          <StatusBadge status={statusLabel}>{statusLabel}</StatusBadge>
        </Field>

        <Field>
          <label>자재등록일자</label>
          <input value={material.createdAt || "-"} readOnly />
        </Field>

        {/* [수정] 갱신된 displayInboundAt 사용 */}
        <Field>
          <label>최근 입고일자</label>
          <input value={displayInboundAt || "-"} readOnly />
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
        <InboundButton onClick={() => setShowInboundModal(true)}>
          + 입고 등록
        </InboundButton>
        <CancelButton onClick={onClose}>닫기</CancelButton>
      </ButtonArea>

      {showInboundModal && (
        <MaterialInbound
          material={material}
          onClose={() => setShowInboundModal(false)}
          onSuccess={() => {
            refreshData(); // 성공 시 데이터 재조회 -> 재고/입고일 자동 갱신
            if (onRefresh) onRefresh();
          }}
        />
      )}
    </Wrapper>
  );
}

/* Styled Components (기존 유지) */
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
  display: flex;
  gap: 10px;
`;
const InboundButton = styled.button`
  flex: 1;
  padding: 12px;
  border-radius: 20px;
  background: var(--main);
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
  &:hover {
    opacity: 0.9;
  }
`;
const CancelButton = styled.button`
  flex: 1;
  padding: 12px;
  border-radius: 20px;
  background: #f1f1f1;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  &:hover {
    background: #e2e2e2;
  }
`;
