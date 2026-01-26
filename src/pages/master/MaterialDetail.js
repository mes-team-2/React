import styled from "styled-components";
import { useEffect, useState, useMemo } from "react";
import { InventoryAPI } from "../../api/AxiosAPI";
import MaterialInbound from "./MaterialInbound";

// [변경] 공통 컴포넌트 Import
import TableStyle from "../../components/TableStyle";
import Status from "../../components/Status";
import Button from "../../components/Button";

export default function MaterialDetail({ material, onClose, onRefresh }) {
  // 1. Hook 선언
  const [lotList, setLotList] = useState([]);
  const [showInboundModal, setShowInboundModal] = useState(false);

  // 화면에 보여줄 동적 상태 관리 (초기값은 props에서 가져옴)
  const [displayStock, setDisplayStock] = useState(0);
  const [displayInboundAt, setDisplayInboundAt] = useState("-");

  // 2. 데이터 새로고침 함수
  const refreshData = async () => {
    if (!material || !material.materialId) return;
    try {
      const response = await InventoryAPI.getMaterialLots(material.materialId);

      if (response.status === 200) {
        const fetchedLots = response.data;
        setLotList(fetchedLots);

        // 총 재고 합산
        const totalStock = fetchedLots.reduce(
          (acc, cur) => acc + (cur.remainQty || 0),
          0,
        );
        setDisplayStock(totalStock);

        // 최근 입고일 갱신
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
      setDisplayStock(material.stockQty || 0);
      setDisplayInboundAt(material.inboundAt || "-");
      refreshData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [material]);

  // 4. 로직 처리

  /* =========================
     [변경] 상태(Status) 키값 계산
     Status.js에 정의된 Key (SAFE, CAUTION, DANGER)를 반환하도록 수정
  ========================= */
  const statusKey = useMemo(() => {
    const safeQty = material.safeQty || 0;

    if (displayStock >= safeQty) return "SAFE";     // 안전
    if (displayStock === 0) return "DANGER";       // 경고(재고 0)
    return "CAUTION";                              // 주의
  }, [displayStock, material.safeQty]);

  if (!material) return null;

  /* =========================
     화면 표시 데이터 포맷팅
  ========================= */
  const formattedStock = Number(displayStock).toLocaleString();
  const formattedSafeStock = Number(material.safeQty ?? 0).toLocaleString();

  /* =========================
     위치별 재고 테이블 설정
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
      qty: formattedStock,
      updatedAt: displayInboundAt,
    },
  ];

  /* =========================
     LOT별 재고 테이블 설정
     - Status 컴포넌트를 렌더링하도록 render 함수 추가
  ========================= */
  const lotColumns = [
    { key: "lotNo", label: "LOT 번호", width: 180 },
    { key: "inboundAt", label: "입고일", width: 160 },
    { key: "qty", label: "잔량", width: 120 },
    {
      key: "status",
      label: "상태",
      width: 150,
      // 테이블 내부에 Status 컴포넌트 렌더링
      render: (value) => <Status status={value} />
    },
    { key: "remark", label: "비고", width: 180 },
  ];

  const lotData = lotList.map((lot) => ({
    id: lot.materialLotId,
    lotNo: lot.materialLotNo,
    inboundAt: lot.inputDate,
    qty: Number(lot.remainQty).toLocaleString(),
    // Status 컴포넌트가 인식할 수 있는 Key로 변환 (AVAILABLE -> OK)
    status: lot.status === "AVAILABLE" ? "OK" : "FAIL",
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

        {/* [변경] Status 컴포넌트 적용 */}
        <Field>
          <label>재고상태</label>
          <div style={{ display: 'flex', alignItems: 'center', height: '38px' }}>
            <Status status={statusKey} />
          </div>
        </Field>

        <Field>
          <label>자재등록일자</label>
          <input value={material.createdAt || "-"} readOnly />
        </Field>

        <Field>
          <label>최근 입고일자</label>
          <input value={displayInboundAt || "-"} readOnly />
        </Field>
      </FormGrid>

      <Section>
        <SectionTitle>위치별 재고 현황</SectionTitle>
        {/* [변경] TableStyle 적용 */}
        <TableStyle
          columns={locationColumns}
          data={locationData}
          selectable={false}
        />
      </Section>

      <Section>
        <SectionTitle>LOT별 재고 현황</SectionTitle>
        {/* [변경] TableStyle 적용 */}
        <TableStyle
          columns={lotColumns}
          data={lotData}
          selectable={false}
        />
        <Note>
          ※ LOT는 “입고 단위”이며, 생산/차감/불량 추적의 기준이 됩니다.
        </Note>
      </Section>

      <ButtonArea>
        {/* [변경] Button 컴포넌트 적용 */}
        <Button
          variant="ok"
          size="l"
          onClick={() => setShowInboundModal(true)}
        >
          + 입고 등록
        </Button>
        <Button
          variant="cancel"
          size="l"
          onClick={onClose}
        >
          닫기
        </Button>
      </ButtonArea>

      {showInboundModal && (
        <MaterialInbound
          material={material}
          onClose={() => setShowInboundModal(false)}
          onSuccess={() => {
            refreshData();
            if (onRefresh) onRefresh();
          }}
        />
      )}
    </Wrapper>
  );
}

/* Styled Components */
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
    height: 38px; /* Status 컴포넌트와 높이 맞춤 */
    box-sizing: border-box;
  }
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
  justify-content: center;
  gap: 50px;
`;