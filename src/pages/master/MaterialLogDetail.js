import styled from "styled-components";
import Button from "../../components/Button";
import Status from "../../components/Status";
import { useEffect, useState, useRef } from "react";
import { InventoryAPI2 } from "../../api/AxiosAPI2";

export default function MaterialLogDetail({ id, onClose }) {
  console.log("detail id:", id);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const workerMapRef = useRef({});

  const WORKERS = [
    "우민규",
    "테스터",
    "이현수",
    "양찬종",
    "김하린",
    "이준호",
    "박서준",
    "최지우",
    "정유진",
    "강동원",
    "한소희",
  ];

  const getWorkerByJob = (jobKey) => {
    if (!jobKey) return "-";
    const idx = Math.abs(jobKey.toString().length) % WORKERS.length;
    return WORKERS[idx];
  };

  const toDateOnly = (d) => {
    if (!d) return "-";
    const date = new Date(d);
    if (isNaN(date.getTime())) return d;
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const hh = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
  };

  useEffect(() => {
    if (!id) return;

    const fetchDetail = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await InventoryAPI2.getMaterialTxDetail(id);
        const item = res.data;

        setDetail({
          id: item.id,
          occurredAt: item.txTime,
          type: item.txType?.trim().toUpperCase() === "INBOUND" ? "IN" : "OUT",
          qty: Number(item.qty),
          beforeQty: Number(item.beforeQty ?? 0),
          remainQty: Number(item.remainQty ?? 0),
          materialCode: item.materialCode ?? "-",
          materialName: item.materialName ?? "-",
          productLotNo: item.productLotNo,
          fromLocation: "자재 창고 1",
          toLocation: "전극 공정 라인 1",
          manager: getWorkerByJob(item.productLotNo || item.materialLotNo),
          note: "",
        });
      } catch (e) {
        console.error(e);
        setError("상세 조회 실패");
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  if (!id) return <Empty>이력을 선택하세요.</Empty>;
  if (loading) return <Empty>로딩중...</Empty>;
  if (error) return <Empty>{error}</Empty>;
  if (!detail) return null;

  const statusKey = detail.type === "IN" ? "MATIN" : "MATOUT";

  return (
    <Wrap>
      <Header>
        <h3>자재 입출고 이력 상세 조회</h3>
        {onClose && (
          <Button variant="cancel" size="s" onClick={onClose}>
            닫기
          </Button>
        )}
      </Header>

      <Content>
        <Section>
          <SectionTitle>입출고정보</SectionTitle>
          <DataGrid>
            <Item>
              <label>구분</label>
              <Status status={statusKey} type="wide" />
            </Item>
            <Item>
              <label>일시</label>
              <Field>
                <strong>{toDateOnly(detail.occurredAt)}</strong>
              </Field>
            </Item>
            <Item>
              <label>이동 수량</label>
              <Field>
                <strong>{detail.qty.toLocaleString()}</strong>
              </Field>
            </Item>
            {/* [New] 제품 LOT 번호 표시 */}
            <Item>
              <label>제품 LOT 번호</label>
              <Field>
                <strong>
                  {detail.type === "IN" ? "-" : detail.productLotNo || "-"}
                </strong>
              </Field>
            </Item>
            <Item>
              <label>재고 증감 (Before → remain)</label>
              <Field>
                <strong>
                  {detail.beforeQty.toLocaleString()} →{" "}
                  {detail.remainQty.toLocaleString()}
                </strong>
              </Field>
            </Item>
            <Item>
              <label>출발 (From)</label>
              <Field>
                <strong>{detail.fromLocation}</strong>
              </Field>
            </Item>
            <Item>
              <label>도착 (To)</label>
              <Field>
                <strong>{detail.toLocation}</strong>
              </Field>
            </Item>
          </DataGrid>
        </Section>

        <Section>
          <SectionTitle>자재정보</SectionTitle>
          <DataGrid>
            <FullWidthItem>
              <label>자재코드</label>
              <Field>
                <strong>{detail.materialCode}</strong>
              </Field>
            </FullWidthItem>
            <FullWidthItem>
              <label>자재명</label>
              <Field>
                <strong>{detail.materialName}</strong>
              </Field>
            </FullWidthItem>
          </DataGrid>
        </Section>

        <Section>
          <SectionTitle>참조정보</SectionTitle>
          <DataGrid>
            <FullWidthItem>
              <label>담당자</label>
              <Field>
                <strong>{detail.manager}</strong>
              </Field>
            </FullWidthItem>
            <FullWidthItem>
              <label>비고</label>
              <Field>
                <strong>{detail.note || "긴급 생산 건 투입"}</strong>
              </Field>
            </FullWidthItem>
          </DataGrid>
        </Section>
      </Content>
    </Wrap>
  );
}

const Wrap = styled.div`
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

const Empty = styled.div`
  padding: 40px;
  text-align: center;
  color: var(--font2);
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

const DataGrid = styled.div`
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

const FullWidthItem = styled(Item)`
  grid-column: 1 / -1;
`;

const Field = styled.div`
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
