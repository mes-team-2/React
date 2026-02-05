import styled from "styled-components";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Table from "../../components/TableStyle";
import Status from "../../components/Status";
import { ProductLotAPI } from "../../api/AxiosAPI";

export default function LotDetail({ lot: propsLot }) {
  const { lotId: paramLotId } = useParams();

  const [detailData, setDetailData] = useState(null);
  const [loading, setLoading] = useState(false);

  const targetLotId = propsLot?.id || paramLotId;

  useEffect(() => {
    const fetchDetail = async () => {
      if (!targetLotId) return;
      setLoading(true);
      try {
        const res = await ProductLotAPI.getDetail(targetLotId);
        setDetailData(res.data);
      } catch (err) {
        console.error("상세 조회 실패", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [targetLotId]);

  const displayLot = detailData ||
    propsLot || {
      lotNo: "-",
      productCode: "-",
      productName: "-",
      currentQty: 0,
      workOrderNo: "-",
      status: "-",
    };

  const [processSort, setProcessSort] = useState({
    key: null,
    direction: "asc",
  });
  const [materialSort, setMaterialSort] = useState({
    key: null,
    direction: "asc",
  });

  // [수정] 공정 이력 컬럼 (1분 단위 집계 시간 표시)
  const processColumns = [
    { key: "date", label: "작업 시간 (분)", width: 140 }, // yyyy-MM-dd HH:mm
    { key: "process", label: "공정명", width: 120 },
    { key: "machine", label: "설비명", width: 120 },
    { key: "start", label: "시작(초)", width: 80 },
    { key: "end", label: "종료(초)", width: 80 },
    {
      key: "status",
      label: "상태",
      width: 80,
      render: (val) => (
        <Status
          status={val === "PASS" ? "OK" : val === "FAIL" ? "ERROR" : "RUN"}
          label={val}
        />
      ),
    },
  ];

  // [수정] 자재 투입 이력 컬럼 (자재코드, 자재LOT 포함)
  const materialColumns = [
    { key: "materialCode", label: "자재코드", width: 140 },
    { key: "materialName", label: "자재명", width: 150 },
    { key: "lotNo", label: "자재 LOT", width: 160 },
    { key: "qty", label: "투입량", width: 80 },
  ];

  if (loading) return <Wrapper>Loading...</Wrapper>;
  if (!displayLot.lotNo) return <Wrapper>선택된 LOT가 없습니다.</Wrapper>;

  return (
    <Wrapper>
      <Header>
        <h3>{displayLot.lotNo}</h3>
        <Status
          type="lot"
          status={
            displayLot.status === "LOT_RUN"
              ? "RUN"
              : displayLot.status === "LOT_OK"
                ? "OK"
                : displayLot.status === "LOT_ERR"
                  ? "ERROR"
                  : "WAIT"
          }
        />
      </Header>

      <Content>
        {/* 기본 정보 섹션 */}
        <Section>
          <SectionTitle>기본 정보</SectionTitle>
          <Grid>
            <Item>
              <label>제품코드</label>
              <Value>{displayLot.productCode}</Value>
            </Item>
            <Item>
              <label>제품명</label>
              <Value>{displayLot.productName}</Value>
            </Item>
            <Item>
              <label>작업지시번호</label>
              <Value>{displayLot.workOrderNo}</Value>
            </Item>
            <Item>
              <label>현재수량</label>
              <Value>{displayLot.currentQty} EA</Value>
            </Item>
            <FullItem>
              <label>LOT 생성일</label>
              <Value>{displayLot.createdAt}</Value>
            </FullItem>
          </Grid>
        </Section>

        {/* 공정 이력 섹션 (1분 단위 집계) */}
        <Section>
          <SectionTitle>공정 이력 (1분 단위 상세)</SectionTitle>
          <Table
            columns={processColumns}
            data={detailData?.processLogs || []}
            sortConfig={processSort}
            onSort={(key) =>
              setProcessSort({
                key,
                direction: processSort.direction === "asc" ? "desc" : "asc",
              })
            }
            selectable={false}
          />
        </Section>

        {/* 자재 투입 이력 섹션 (1분 단위 + 자재LOT 표시) */}
        <Section>
          <SectionTitle>자재 투입 이력</SectionTitle>
          <Table
            columns={materialColumns}
            data={detailData?.materialLogs || []}
            sortConfig={materialSort}
            onSort={(key) =>
              setMaterialSort({
                key,
                direction: materialSort.direction === "asc" ? "desc" : "asc",
              })
            }
            selectable={false}
          />
        </Section>
      </Content>
    </Wrapper>
  );
}

// 스타일 유지
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
