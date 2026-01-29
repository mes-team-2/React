import { useMemo, useState, useEffect } from "react";
import styled from "styled-components";

import TableStyle from "../../components/TableStyle";
import SideDrawer from "../../components/SideDrawer";
import SearchBar from "../../components/SearchBar";
import Status from "../../components/Status";

import WorkOrderDetail from "./WorkOrderDetail";
import WorkOrderCreate from "./WorkOrderCreate";
import { WorkOrderAPI } from "../../api/AxiosAPI";

export default function WorkOrder() {
  const [keyword, setKeyword] = useState("");
  const [workOrders, setWorkOrders] = useState([]);

  const [selected, setSelected] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  // 데이터 로드
  const loadData = async () => {
    try {
      const res = await WorkOrderAPI.getList();
      setWorkOrders(res.data);
      console.log(res.data);
    } catch (err) {
      console.error("작업지시 목록 로드 실패", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 검색 필터링
  const data = useMemo(() => {
    if (!keyword.trim()) return workOrders;
    const k = keyword.toLowerCase();
    return workOrders.filter(
      (row) =>
        row.id.toLowerCase().includes(k) ||
        row.product.toLowerCase().includes(k) ||
        String(row.planQty).includes(k),
    );
  }, [keyword, workOrders]);

  const columns = useMemo(
    () => [
      { key: "id", label: "작업지시 번호", width: 160 },
      { key: "product", label: "제품", width: 200 },
      { key: "planQty", label: "계획 수량", width: 100 },
      {
        key: "status",
        label: "상태",
        width: 120,
        // [수정] 인자를 row가 아니라 status(값 자체)로 받음
        render: (status) => {
          console.log("Current Status Value:", status); // 이제 "WAIT", "IN_PROGRESS" 등이 찍힐 겁니다.

          let statusKey = "DEFAULT";
          // 객체 접근(row.status)이 아니라 값 자체(status)를 비교
          if (status === "WAIT") statusKey = "WAITING";
          else if (status === "IN_PROGRESS") statusKey = "RUN";
          else if (status === "DONE") statusKey = "COMPLETE";

          return <Status status={statusKey} />;
        },
      },
      { key: "startDate", label: "시작 시간", width: 150 },
      { key: "endDate", label: "종료 시간", width: 150 }, // [New] 실제 종료 시간
      { key: "dueDate", label: "납기일", width: 120 }, // 계획(마감일)
    ],
    [],
  );

  return (
    <Wrapper>
      <TitleRow>
        <div>
          <h2>작업지시 관리</h2>
          <p>작업지시 등록/조회 및 LOT 생성 흐름을 관리합니다.</p>
        </div>
      </TitleRow>

      <ActionBar>
        <SearchWrap>
          <SearchBar
            value={keyword}
            onChange={setKeyword}
            placeholder="작업지시/제품 검색"
          />
        </SearchWrap>

        <CreateBtn onClick={() => setCreateOpen(true)}>작업지시 등록</CreateBtn>
      </ActionBar>

      <Card>
        <TableStyle
          columns={columns}
          data={data}
          onRowClick={(row) => {
            setSelected(row);
            setDetailOpen(true);
          }}
        />
      </Card>

      <SideDrawer open={detailOpen} onClose={() => setDetailOpen(false)}>
        <WorkOrderDetail workOrder={selected} />
      </SideDrawer>

      <SideDrawer open={createOpen} onClose={() => setCreateOpen(false)}>
        <WorkOrderCreate
          onSubmit={(payload) => {
            console.log("Registered:", payload);
            setCreateOpen(false);
            loadData(); // 목록 새로고침
          }}
        />
      </SideDrawer>
    </Wrapper>
  );
}

/* =========================
   styled (기존 톤 유지)
========================= */

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const TitleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;

  h2 {
    margin: 0;
    font-size: 22px;
    font-weight: 800;
  }

  p {
    margin: 6px 0 0 0;
    font-size: 12px;
    opacity: 0.6;
  }
`;

const ActionBar = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
`;

const SearchWrap = styled.div`
  flex: 1;
  min-width: 360px;
`;

const Card = styled.div`
  background: white;
  border-radius: 16px;
  padding: 14px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.05);
`;

const CreateBtn = styled.button`
  padding: 10px 20px;
  border-radius: 999px;
  border: none;
  background: #004dfc;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    background: #003ad6;
  }
`;
