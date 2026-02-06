import styled from "styled-components";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom"; // useNavigate 추가
import { FiX } from "react-icons/fi"; // 닫기 아이콘 추가
import Table from "../../components/TableStyle";
import Status from "../../components/Status";
import { ProductLotQrAPI } from "../../api/AxiosAPI"; // QR API import

export default function ProductLotQrDetail() {
  const { lotId } = useParams(); // URL 파라미터 (여기서는 lotNo 문자열이 들어옴)
  const navigate = useNavigate();

  const [detailData, setDetailData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 변수명 직관적으로 매핑 (URL param 이름이 lotId라도 실제 값은 lotNo)
  const targetLotNo = lotId;

  useEffect(() => {
    const fetchDetail = async () => {
      if (!targetLotNo) return;
      setLoading(true);
      setError(null);
      try {
        // QR 전용 API 호출 (문자열 lotNo로 조회)
        const res = await ProductLotQrAPI.getDetailByNo(targetLotNo);
        setDetailData(res.data);
      } catch (err) {
        console.error("QR 상세 조회 실패", err);
        setError("해당 LOT 정보를 찾을 수 없습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [targetLotNo]);

  if (loading)
    return (
      <Container>
        <LoadingMsg>데이터를 불러오는 중입니다...</LoadingMsg>
      </Container>
    );
  if (error)
    return (
      <Container>
        <ErrorMsg>{error}</ErrorMsg>
      </Container>
    );
  if (!detailData)
    return (
      <Container>
        <Empty>LOT 정보를 찾을 수 없습니다.</Empty>
      </Container>
    );

  // 데이터 바인딩 (LotDetail.js와 동일한 구조)
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

  // LotDetail.js와 동일한 컬럼 정의
  const processColumns = [
    { key: "stepName", label: "공정명", width: 140 },
    { key: "machineName", label: "설비명", width: 140 },
    { key: "status", label: "상태", width: 100 },
    { key: "startedAt", label: "시작시간", width: 150 },
    { key: "endedAt", label: "종료시간", width: 150 },
  ];

  const materialColumns = [
    { key: "lotNo", label: "자재 LOT", width: 160 },
    { key: "materialName", label: "자재명", width: 160 },
    { key: "qty", label: "투입수량", width: 100 },
    { key: "unit", label: "단위", width: 80 },
    { key: "time", label: "투입시각", width: 160 },
  ];

  return (
    <Wrapper>
      {/* QR 페이지 전용 헤더 (닫기 버튼 포함) */}
      <Header>
        <h3>제품 LOT 상세 조회</h3>
        {/* <CloseButton onClick={() => navigate(-1)}>
          <FiX size={24} />
        </CloseButton> */}
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
    </Wrapper>
  );
}

// 스타일 컴포넌트
const Wrapper = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  height: 100vh;
  background-color: var(--background);
  box-sizing: border-box;
`;

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  h3 {
    font-size: var(--fontHd);
    font-weight: var(--bold);
    margin: 0;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: var(--font);
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--background2);
  }
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px;
  overflow-y: auto;
  padding-right: 5px;
  padding-bottom: 40px;
  flex: 1;

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
  margin: 0;
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
  background: white;
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

const LoadingMsg = styled.div`
  font-size: 16px;
  color: var(--font2);
`;

const ErrorMsg = styled.div`
  font-size: 16px;
  color: var(--error);
`;
