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

  if (loading) return <Container>Loading...</Container>;
  if (!targetLotId && !propsLot) return <Empty>LOT를 선택하세요.</Empty>;

  const lotInfo = detailData || {
    lotNo: "-",
    status: "-",
    currentQty: 0,
    createdAt: "-",
  };

  const workOrderInfo = detailData || {
    workOrderNo: "-",
    manager: "-",
    workOrderCreatedAt: "-",
    productName: "-",
    workOrderStatus: "-",
    plannedQty: 0,
    workOrderStartDate: "-",
    workOrderDueDate: "-",
  };

  const processData = detailData?.processList || [];
  const materialData = detailData?.materialList || [];

  /* ======================================================
     테이블 컬럼 정의 (요청사항 반영 완료)
  ====================================================== */

  // 1. 공정 이력 (요약형 - 1분 단위 X)
  const processColumns = [
    { key: "stepName", label: "공정명", width: 140 },
    { key: "machineName", label: "설비명", width: 140 },
    { key: "status", label: "상태", width: 100 },
    { key: "startedAt", label: "시작시간", width: 150 },
    { key: "endedAt", label: "종료시간", width: 150 },
  ];

  // 2. 자재 투입 이력 (자재코드 삭제 / 자재LOT -> 자재명 순서)
  const materialColumns = [
    { key: "lotNo", label: "자재 LOT", width: 160 }, // [1] 자재 LOT
    { key: "materialName", label: "자재명", width: 160 }, // [2] 자재명
    { key: "qty", label: "투입수량", width: 100 },
    { key: "unit", label: "단위", width: 80 },
    { key: "time", label: "투입시각", width: 160 },
  ];

  return (
    <Container>
      <Header>
        <h3>LOT 상세 정보</h3>
      </Header>

      <Content>
        {/* 섹션 1: 생산 LOT 정보 */}
        <Section>
          <SectionTitle>생산 LOT 정보</SectionTitle>
          <Grid>
            <FullItem>
              <label>LOT 번호</label>
              <Value>{lotInfo.lotNo}</Value>
            </FullItem>
            <Item>
              <label>LOT 상태</label>
              <Status status={lotInfo.status} type="wide" />
            </Item>
            <Item>
              <label>생산 수량</label>
              <Value>
                {Number(lotInfo.currentQty || 0).toLocaleString()} EA
              </Value>
            </Item>
            <FullItem>
              <label>LOT 생성일</label>
              <Value>{lotInfo.createdAt}</Value>
            </FullItem>
          </Grid>
        </Section>

        {/* 섹션 2: 작업지시 정보 */}
        <Section>
          <SectionTitle>작업지시 정보</SectionTitle>
          <Grid>
            <Item>
              <label>작업지시 번호</label>
              <Value>{workOrderInfo.workOrderNo}</Value>
            </Item>
            <Item>
              <label>담당자</label>
              <Value>{workOrderInfo.manager}</Value>
            </Item>
            <FullItem>
              <label>작업지시 등록일</label>
              <Value>{workOrderInfo.workOrderCreatedAt}</Value>
            </FullItem>
            <FullItem>
              <label>제품명</label>
              <Value>{workOrderInfo.productName}</Value>
            </FullItem>
            <Item>
              <label>작업 상태</label>
              <Status status={workOrderInfo.workOrderStatus} type="wide" />
            </Item>
            <Item>
              <label>지시 수량</label>
              <Value>
                {Number(workOrderInfo.plannedQty || 0).toLocaleString()}
              </Value>
            </Item>
            <Item>
              <label>작업시작일</label>
              <Value>{workOrderInfo.workOrderStartDate}</Value>
            </Item>
            <Item>
              <label>납기일</label>
              <Value>{workOrderInfo.workOrderDueDate}</Value>
            </Item>
          </Grid>
        </Section>

        {/* 섹션 3: 공정 진행 이력 */}
        <Section>
          <SectionTitle>공정 진행 이력</SectionTitle>
          <Table
            columns={processColumns}
            data={processData}
            selectable={false}
          />
        </Section>

        {/* 섹션 4: 자재 투입 이력 */}
        <Section>
          <SectionTitle>자재 투입 이력</SectionTitle>
          <Table
            columns={materialColumns}
            data={materialData}
            selectable={false}
          />
        </Section>
      </Content>
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
const Empty = styled.div`
  padding: 60px 20px;
  text-align: center;
  font-size: 14px;
  opacity: 0.6;
`;
