import styled from "styled-components";
import { useEffect, useState, useMemo } from "react";
import { InventoryAPI } from "../../api/AxiosAPI";
import MaterialInbound from "./MaterialInbound";
import TableStyle from "../../components/TableStyle";
import Status from "../../components/Status";
import Button from "../../components/Button";

export default function MaterialDetail({ material, onClose, onRefresh }) {
  // Hook 선언
  const [lotList, setLotList] = useState([]);
  const [showInboundModal, setShowInboundModal] = useState(false);

  // 정렬 상태 관리 (LOT 테이블용) / DESC, ASC 정렬하려면 필요함
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // 화면에 보여줄 동적 상태 관리 (초기값은 props에서 가져옴)
  const [displayStock, setDisplayStock] = useState(0);
  const [displayInboundAt, setDisplayInboundAt] = useState("-");

  // 데이터 새로고침 함수
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

  // 초기값 세팅 및 데이터 조회
  useEffect(() => {
    if (material) {
      setDisplayStock(material.stockQty || 0);
      setDisplayInboundAt(material.inboundAt || "-");
      refreshData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [material]);

  // 상태 키값 계산
  const statusKey = useMemo(() => {
    // material이 없을 때를 대비해 ?. 사용
    const safeQty = material?.safeQty || 0;

    if (displayStock >= safeQty) return "SAFE";
    if (displayStock === 0) return "DANGER";
    return "CAUTION";
  }, [displayStock, material]);

  // lotData 생성
  const lotData = useMemo(() => {
    return lotList.map((lot) => ({
      id: lot.materialLotId,
      lotNo: lot.materialLotNo,
      inboundAt: lot.inputDate,
      qty: Number(lot.remainQty).toLocaleString(),
      status: lot.status === "AVAILABLE" ? "OK" : "FAIL",
      remark: "-",
    }));
  }, [lotList]);

  // 정렬 핸들러
  const handleSort = (key) => {
    setSortConfig((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" }
    );
  };

  // 정렬된 데이터 생성
  const sortedLotData = useMemo(() => {
    if (!sortConfig.key) return lotData;

    return [...lotData].sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      if (sortConfig.key === "qty") {
        aVal = Number(String(aVal).replace(/,/g, ""));
        bVal = Number(String(bVal).replace(/,/g, ""));
      }

      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [lotData, sortConfig]);

  if (!material) return null;

  const formattedStock = Number(displayStock).toLocaleString();
  const formattedSafeStock = Number(material.safeQty ?? 0).toLocaleString();

  // 위치별 재고 테이블 컬럼
  const locationColumns = [
    { key: "location", label: "위치", width: 120 },
    { key: "qty", label: "수량", width: 100 },
    { key: "updatedAt", label: "최근 입고일", width: 160 },
  ];

  // 위치별 재고 데이터
  const locationData = [
    {
      id: 1,
      location: "자재 창고 (Main)",
      qty: formattedStock,
      updatedAt: displayInboundAt,
    },
  ];

  // LOT별 재고 테이블 컬럼
  const lotColumns = [
    { key: "lotNo", label: "LOT 번호", width: 180 },
    { key: "inboundAt", label: "입고일", width: 160 },
    { key: "qty", label: "잔량", width: 120 },
    {
      key: "status",
      label: "상태",
      width: 150,
      render: (value) => <Status status={value} />,
    },
    { key: "remark", label: "비고", width: 180 },
  ];


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

        <Field>
          <label>재고상태</label>
          <div style={{ display: 'flex', alignItems: 'center', height: '38px' }}>
            <Status status={statusKey} type="wide" />
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
        <TableStyle
          columns={locationColumns}
          data={locationData}
          selectable={false}
        />
      </Section>

      <Section>
        <SectionTitle>LOT별 재고 현황</SectionTitle>
        <TableStyle
          columns={lotColumns}
          data={sortedLotData} // 정렬된 데이터 전달
          selectable={false}
          sortConfig={sortConfig} // 정렬 상태 전달
          onSort={handleSort} // 정렬 핸들러 전달
        />
        <Note>
          ※ LOT는 “입고 단위”이며, 생산/차감/불량 추적의 기준이 됩니다.
        </Note>
      </Section>

      <ButtonArea>
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
    font-size: var(--fontHd);
    font-weight: var(--bold);
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
    font-size: var(--fontXs);
    font-weight: var(--normal);
    padding: 2px;
    opacity: 0.6;
  }
  input {
    padding: 10px;
    border-radius: 10px;
    border: 1px solid var(--border);
    background: var(--background);
    font-size: var(--fontXs);
    height: 38px; 
    box-sizing: border-box;
  }
`;

const Section = styled.div`
  margin-top: 8px;
`;

const SectionTitle = styled.h4`
  font-size: var(--fontSm);
  font-weight: var(--bold);
  margin-bottom: 8px;
`;

const Note = styled.div`
  margin-top: 8px;
  font-size: var(--fontXs);
  opacity: 0.65;
`;

const ButtonArea = styled.div`
  margin-top: auto;
  display: flex;
  justify-content: center;
  gap: 50px;
`;