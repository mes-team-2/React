import React from "react";
import styled from "styled-components";
import { FiBox, FiActivity, FiCalendar } from "react-icons/fi";
import Status from "../../components/Status";
import { useEffect, useState } from "react";
import { InventoryAPI2 } from "../../api/AxiosAPI2";

export default function MaterialLotDetail({ row, onClose }) {
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    if (!row?.id) return;

    const fetchDetail = async () => {
      try {
        const res = await InventoryAPI2.getMaterialLotDetail(row.id);
        setDetail(res.data);
      } catch (e) {
        console.error("상세 조회 실패", e);
      }
    };

    fetchDetail();
  }, [row?.id]);

  if (!row) return null;
  if (!detail) return null;

  // 상태값 매핑 (Status 컴포넌트용)
  let statusKey = "DEFAULT";
  if (detail.status === "AVAILABLE") statusKey = "LOT_WAIT";
  else if (detail.status === "HOLD") statusKey = "LOT_RUN";
  else if (detail.status === "EXHAUSTED") statusKey = "LOT_ERR";

  return (
    <Container>
      <Header>
        <h3>자재 LOT 상세 조회</h3>
        {onClose && (
          <Button variant="cancel" size="s" onClick={onClose}>
            닫기
          </Button>
        )}
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
                    <td colSpan={4}>이력이 없습니다.</td>
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
  gap: 20px;
  overflow-y: auto;
  padding-right: 15px;

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

  strong {
    font-weight: var(--normal);
    color: var(--font);
    font-size: var(--fontXs);
  }
`;

const Unit = styled.span`
  font-size: var(--fontXs);
  color: var(--font2);
  font-weight: normal;
  margin-left: 4px;
`;

const Button = styled.button`
  padding: 10px 24px;
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
