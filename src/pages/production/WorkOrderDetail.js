import styled from "styled-components";
import { useState, useEffect } from "react";
import Table from "../../components/TableStyle";
import { WorkOrderAPI } from "../../api/AxiosAPI";

export default function WorkOrderDetail({ workOrder }) {
  // 백에서 받아온 상세 데이터 상태
  const [detailData, setDetailData] = useState(null);
  const [loading, setLoading] = useState(false);

  // workOrder(부모에서 넘겨준 요약정보)가 바뀔 때마다 상세 조회 API 호출
  useEffect(() => {
    const fetchDetail = async () => {
      if (!workOrder?.id) return;

      setLoading(true);
      try {
        // API 호출: /api/workorder/{id}/detail
        const res = await WorkOrderAPI.getDetail(workOrder.id);

        // 데이터가 잘 왔는지 확인용 로그
        console.log("상세 데이터:", res.data);

        setDetailData(res.data);
      } catch (err) {
        console.error("상세 조회 실패", err);
        setDetailData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [workOrder]);

  if (!workOrder) {
    return <Empty>작업지시를 선택하세요.</Empty>;
  }

  // --- 데이터 매핑 (백엔드에서 null이 올 경우 대비) ---

  // LOT 정보
  const lotInfo = detailData?.lotInfo || {
    lotNo: "-",
    qty: 0,
    status: "-",
    createdAt: "-",
  };

  // 공정 진행 리스트
  const processData = detailData?.processList || [];

  // 자재 투입 리스트
  const materialData = detailData?.materialList || [];

  // 테이블 컬럼 정의
  const processColumns = [
    { key: "stepName", label: "공정명", width: 140 },
    { key: "machineName", label: "설비명", width: 140 },
    { key: "status", label: "상태", width: 100 },
    { key: "startedAt", label: "시작시간", width: 150 },
    { key: "endedAt", label: "종료시간", width: 150 },
  ];

  const materialColumns = [
    { key: "materialName", label: "자재명", width: 160 },
    { key: "qty", label: "투입수량", width: 100 },
    { key: "unit", label: "단위", width: 80 },
    { key: "time", label: "투입시각", width: 160 },
  ];

  return (
    <Container>
      <Header>
        <h3>작업지시 상세</h3>
      </Header>

      <Content>
        <Section>
          <SectionTitle>작업지시 정보</SectionTitle>
          <Grid>
            <Item>
              <label>작업지시 번호</label>
              <Value>{workOrder.id}</Value>
            </Item>
            <Item>
              <label>담당자</label>
              <Value>{workOrder.manager}</Value>
            </Item>
            <FullItem>
              <label>작업지시 등록일</label>
              <Value>{workOrder.createdAt}</Value>
            </FullItem>
            <FullItem>
              <label>제품명</label>
              <Value>{workOrder.product}</Value>
            </FullItem>
            <Item>
              <label>작업 상태</label>
              <Value>{workOrder.status}</Value>
            </Item>
            <Item>
              <label>지시 수량</label>
              <Value>{workOrder.planQty}</Value>
            </Item>

            <Item>
              <label>작업시작일</label>
              <Value>{workOrder.startDate}</Value>
            </Item>
            <Item>
              <label>납기일</label>
              <Value>{workOrder.dueDate}</Value>
            </Item>
          </Grid>
        </Section>

        <Section>
          <SectionTitle>생산 LOT 정보</SectionTitle>
          {detailData ? (
            <Grid>
              <FullItem>
                <label>LOT 번호</label>
                <Value>{lotInfo.lotNo}</Value>
              </FullItem>
              <Item>
                <label>LOT 상태</label>
                <Value>{lotInfo.status}</Value>
              </Item>
              <Item>
                <label>생산 수량</label>
                <Value>{lotInfo.qty}</Value>
              </Item>

              <FullItem>
                <label>LOT 생성일</label>
                <Value>{lotInfo.createdAt}</Value>
              </FullItem>
            </Grid>
          ) : (
            <EmptyBox>LOT 정보가 없습니다.</EmptyBox>
          )}
        </Section>

        <Section>
          <SectionTitle>공정 진행 이력</SectionTitle>
          <Table
            columns={processColumns}
            data={processData}
            selectable={false}
          />
        </Section>

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
  h3 {
    font-size: var(--fontHd);
    font-weight: var(--bold);
    margin-bottom: 20px;
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

const EmptyBox = styled.div`
  padding: 20px;
  text-align: center;
  color: var(--font2);
  background: var(--background);
  border-radius: 8px;
  font-size: 13px;
`;
