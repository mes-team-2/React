import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import Status from "../../components/Status";
import { InventoryAPI2 } from "../../api/AxiosAPI2"; // MaterialLot.js와 동일한 API 사용

const MaterialLotQrDetail = ({ row, onClose }) => {
  const { lotId } = useParams(); // URL 파라미터 (QR 접속 시 문자열 LOT 번호)
  const navigate = useNavigate();

  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        let targetDbId = null;

        // [Case 1] 모달로 열었을 때 (row에 이미 진짜 ID가 있음 - 가장 쉬운 케이스)
        if (row?.id) {
          targetDbId = row.id;
        }
        // [Case 2] QR 코드로 접속했을 때 (lotId는 문자열임 -> 검색 API로 ID 찾아야 함)
        else if (lotId) {
          console.log("🔎 QR 검색 시작 (LOT 번호):", lotId);

          // ★ 핵심 해결책 ★
          // MaterialLot.js에서 쓰는 '목록 검색 API'를 활용하여 LOT 번호로 데이터를 찾습니다.
          // 전체를 뒤지는 것보다 훨씬 빠르고 정확합니다.
          const searchParams = {
            page: 0,
            size: 10,
            keyword: lotId, // 검색어에 LOT 번호를 넣음
          };

          const listRes = await InventoryAPI2.getMaterialLotList(searchParams);
          const searchResults = listRes.data?.content || [];

          // 검색 결과 중에서 LOT 번호가 정확히 일치하는 항목 찾기
          const foundItem = searchResults.find(
            (item) => item.lotNo === lotId || item.materialLotNo === lotId,
          );

          if (foundItem) {
            console.log("✅ ID 발견:", foundItem.id);
            targetDbId = foundItem.id;
          } else {
            throw new Error(
              `LOT 번호(${lotId})에 해당하는 데이터를 찾을 수 없습니다.`,
            );
          }
        }

        if (!targetDbId) return;

        // 3. 진짜 ID로 상세 정보 조회
        const res = await InventoryAPI2.getMaterialLotDetail(targetDbId);

        if (res.data) {
          setDetail(res.data);
        } else {
          throw new Error("상세 데이터가 비어있습니다.");
        }
      } catch (e) {
        console.error("상세 조회 실패:", e);
        setError(e.message || "데이터를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [lotId, row]);

  // --- 화면 렌더링 ---

  if (loading)
    return (
      <Container>
        <Message>데이터 조회 중...</Message>
      </Container>
    );

  if (error)
    return (
      <Container>
        <Message>{error}</Message>
        {!onClose && (
          <StyledButton onClick={() => navigate(-1)}>뒤로가기</StyledButton>
        )}
      </Container>
    );

  if (!detail) {
    return onClose ? null : (
      <Container>
        <Message>정보가 없습니다.</Message>
      </Container>
    );
  }

  // 상태값 매핑 (Status 컴포넌트용)
  let statusKey = "DEFAULT";
  if (detail.status === "AVAILABLE") statusKey = "LOT_WAIT";
  else if (detail.status === "HOLD") statusKey = "LOT_RUN";
  else if (detail.status === "EXHAUSTED") statusKey = "LOT_ERR";

  return (
    <Container>
      <Header>
        <h3>자재 LOT 상세 조회</h3>
      </Header>

      <Content>
        <Section>
          <SectionTitle>LOT 정보</SectionTitle>
          <Grid>
            <FullItem>
              <label>LOT 번호</label>
              <Value>{detail.materialLotNo}</Value>
            </FullItem>

            <Item>
              <label>LOT 상태</label>
              <div>
                <Status status={statusKey} type="wide" />
              </div>
            </Item>
            <Item>
              <label>최초 입고일</label>
              <Value>{detail.txTime?.replace("T", " ").substring(0, 19)}</Value>
            </Item>
          </Grid>
        </Section>

        <Section>
          <SectionTitle>자재 정보</SectionTitle>
          <Grid>
            <FullItem>
              <label>자재코드</label>
              <Value>{detail.materialCode}</Value>
            </FullItem>
            <FullItem>
              <label>자재명</label>
              <Value>{detail.materialName}</Value>
            </FullItem>
            <FullItem>
              <label>단위</label>
              <Value>{detail.unit}</Value>
            </FullItem>
          </Grid>
        </Section>

        <Section>
          <SectionTitle>재고 현황</SectionTitle>
          <Grid>
            <FullItem>
              <label>현재고(A)</label>
              <Value>
                {(detail.remainQty ?? 0).toLocaleString()} <Unit>EA</Unit>
              </Value>
            </FullItem>
          </Grid>
        </Section>

        <Section>
          <SectionTitle>투입 이력</SectionTitle>

          <HistoryTableWrapper>
            <HistoryTable>
              <thead>
                <tr>
                  <th>일시</th>
                  <th>Lot</th>
                  <th>수량</th>
                </tr>
              </thead>
              <tbody>
                {detail.histories && detail.histories.length > 0 ? (
                  detail.histories.map((h, idx) => (
                    <tr key={idx}>
                      <td>{h.inputDate?.replace("T", " ").substring(0, 19)}</td>
                      <td>{h.lot}</td>
                      <td>{(h.qty ?? 0).toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3}>이력이 없습니다.</td>
                  </tr>
                )}
              </tbody>
            </HistoryTable>
          </HistoryTableWrapper>

          <RecentBox>
            <label>최근 상태 변경일</label>
            <Value>{detail.statusChangedAt}</Value>
          </RecentBox>
        </Section>
      </Content>
    </Container>
  );
};

export default MaterialLotQrDetail;

const Container = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  height: 100%;
  min-height: 100vh;
  background: white;
`;

const Message = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 16px;
  color: var(--font2);
  font-weight: var(--mediu,);
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
  gap: 20px;
  overflow-y: auto;
  padding-right: 5px;
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
  gap: 15px;
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
  gap: 16px;
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
  height: 38px;
  font-weight: var(--normal);
  color: var(--font);
  font-size: var(--fontXs);
`;

const Unit = styled.span`
  font-size: var(--fontXs);
  color: var(--font2);
  font-weight: normal;
  margin-left: 4px;
`;

const StyledButton = styled.button`
  padding: 8px 16px;
  border-radius: 8px;
  background: var(--font2);
  color: white;
  border: none;
  font-weight: var(--bold);
  cursor: pointer;
  &:hover {
    opacity: 0.9;
  }
`;

const HistoryTableWrapper = styled.div`
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
  max-height: 220px;
  overflow-y: auto;
`;

const HistoryTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: var(--fontXs);

  thead {
    background: var(--background2);
    position: sticky;
    top: 0;
  }

  th,
  td {
    padding: 10px;
    text-align: center;
    border-bottom: 1px solid var(--border);
  }

  th {
    font-weight: var(--bold);
    color: var(--font);
  }

  tbody tr:hover {
    background: var(--background);
  }
`;

const RecentBox = styled.div`
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;

  label {
    font-size: var(--fontXs);
    color: var(--font2);
  }
`;
