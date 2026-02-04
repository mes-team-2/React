import styled from "styled-components";
import { useState, useEffect, useMemo } from "react";
import SideDrawer from "../../components/SideDrawer";
import Button from "../../components/Button";
import SelectBar from "../../components/SelectBar";
import TableStyle from "../../components/TableStyle";
import { BomAPI, InventoryAPI } from "../../api/AxiosAPI";
import { Trash2, Plus } from "lucide-react";

export default function BOMDetail({ data, onClose, onSave }) {
  const [bomList, setBomList] = useState([]);
  const [deletedIds, setDeletedIds] = useState([]);
  const [materials, setMaterials] = useState([]);

  // 신규 추가 입력 State
  const [newRow, setNewRow] = useState({
    materialCode: "",
    qty: "",
    process: "",
  });

  // 초기 데이터 세팅
  useEffect(() => {
    if (data && Array.isArray(data.bomList)) {
      const existingBom = data.bomList.filter((item) => item.isBom);
      setBomList(existingBom);
      setDeletedIds([]);
    }
  }, [data]);

  // 전체 자재 목록 로드
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const res = await InventoryAPI.getMaterialList();
        setMaterials(res.data);
      } catch (err) {
        console.error("자재 목록 로드 실패", err);
      }
    };
    if (data) fetchMaterials();
  }, [data]);

  // [SelectBar용 옵션 변환]
  const materialOptions = useMemo(() => {
    return materials.map((m) => ({
      value: m.materialCode,
      label: `${m.materialName} (${m.materialCode})`,
    }));
  }, [materials]);

  const processOptions = [
    { value: "전극공정", label: "전극공정" },
    { value: "조립공정", label: "조립공정" },
    { value: "팩공정", label: "팩공정" },
    { value: "충전공정", label: "충전공정" },
    { value: "검사공정", label: "검사공정" },
  ];

  // [핸들러] 행 데이터 변경
  const handleRowChange = (id, field, value) => {
    setBomList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
  };

  // [핸들러] 행 삭제
  const handleDeleteRow = (row) => {
    if (row.id && !String(row.id).startsWith("temp-")) {
      setDeletedIds((prev) => [...prev, row.id]);
    }
    setBomList((prev) => prev.filter((item) => item.id !== row.id));
  };

  // [핸들러] 신규 추가
  const handleAddRow = () => {
    if (!newRow.materialCode || !newRow.qty) {
      alert("자재와 소요량을 입력해주세요.");
      return;
    }
    if (bomList.some((b) => b.materialCode === newRow.materialCode)) {
      alert("이미 추가된 자재입니다.");
      return;
    }

    const selectedMaterial = materials.find(
      (m) => m.materialCode === newRow.materialCode,
    );

    const newItem = {
      id: `temp-${Date.now()}`,
      materialCode: newRow.materialCode,
      materialName: selectedMaterial?.materialName || "",
      unit: selectedMaterial?.unit || "",
      qty: newRow.qty,
      process: newRow.process || "전극공정",
      isNew: true,
    };

    setBomList([...bomList, newItem]);
    setNewRow({ materialCode: "", qty: "", process: "" });
  };

  // [핸들러] 최종 저장
  const handleSaveAll = async () => {
    try {
      const promises = [];

      // 삭제
      deletedIds.forEach((id) => promises.push(BomAPI.delete(id)));

      // 신규 및 수정
      bomList.forEach((item) => {
        const payload = {
          productCode: data.productCode,
          materialCode: item.materialCode,
          qty: Number(item.qty),
          process: item.process,
        };

        if (!item.id || String(item.id).startsWith("temp-")) {
          promises.push(BomAPI.create(payload));
        } else {
          promises.push(BomAPI.update(item.id, payload));
        }
      });

      await Promise.all(promises);
      alert("저장되었습니다.");
      onSave();
    } catch (err) {
      console.error(err);
      alert("저장 중 오류 발생");
    }
  };

  // [TableStyle 컬럼 정의]
  const columns = [
    { key: "materialCode", label: "자재코드", width: 140 },
    { key: "materialName", label: "자재명", width: 80 },
    {
      key: "qty",
      label: "소요량",
      width: 80,
      render: (val, row) => (
        <TableInput
          type="number"
          value={val}
          onChange={(e) => handleRowChange(row.id, "qty", e.target.value)}
        />
      ),
    },
    { key: "unit", label: "단위", width: 50 },
    {
      key: "process",
      label: "투입공정",
      width: 100,
      render: (val, row) => (
        <TableSelect
          value={val}
          onChange={(e) => handleRowChange(row.id, "process", e.target.value)}
        >
          {processOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </TableSelect>
      ),
    },
    {
      key: "manage",
      label: "관리",
      width: 60,
      render: (_, row) => (
        <DeleteBtn onClick={() => handleDeleteRow(row)}>
          <Trash2 size={16} />
        </DeleteBtn>
      ),
    },
  ];

  if (!data) return null;

  return (
    <SideDrawer open={!!data} onClose={onClose} title="BOM 수정">
      <Container>
        <Header>
          <h3>BOM 수정</h3>
        </Header>

        <Content>
          <Section>
            <SectionTitle>제품 정보</SectionTitle>
            <Grid>
              <FullItem>
                <label>제품코드</label>
                <Value>{data.productCode}</Value>
              </FullItem>
              <FullItem>
                <label>제품명</label>
                <Value>{data.productName}</Value>
              </FullItem>
              <Item>
                <label>전압(V)</label>
                <Value>{data.voltage}V</Value>
              </Item>
              <Item>
                <label>용량(Ah)</label>
                <Value>{data.capacityAh}Ah</Value>
              </Item>
            </Grid>
          </Section>

          <Section>
            <SectionTitle>BOM 자재 추가</SectionTitle>
            <FilterBar>
              <SelectBar
                type="single"
                width="250px"
                placeholder="자재 선택"
                options={materialOptions}
                value={newRow.materialCode}
                onChange={(e) =>
                  setNewRow((p) => ({ ...p, materialCode: e.target.value }))
                }
              />
              <SelectBar
                type="single"
                width="150px"
                placeholder="공정 선택"
                options={processOptions}
                value={newRow.process}
                onChange={(e) =>
                  setNewRow((p) => ({ ...p, process: e.target.value }))
                }
              />
              <Input
                type="number"
                placeholder="소요량"
                value={newRow.qty}
                onChange={(e) =>
                  setNewRow((p) => ({ ...p, qty: e.target.value }))
                }
              />
              <Button variant="ok" size="form" onClick={handleAddRow}>
                + 추가
              </Button>
            </FilterBar>
          </Section>

          <Section>
            <SectionTitle>BOM 리스트 ({bomList.length})</SectionTitle>
            <TableWrap>
              <TableStyle
                columns={columns}
                data={bomList}
                selectable={false}
                hover={false}
              />
            </TableWrap>
          </Section>
        </Content>

        <Footer>
          <Button variant="cancel" size="l" onClick={onClose}>
            취소
          </Button>
          <Button variant="ok" size="l" onClick={handleSaveAll}>
            수정 완료
          </Button>
        </Footer>
      </Container>
    </SideDrawer>
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
  height: 38px;
  font-size: var(--fontSm);
  color: var(--font);
`;

const Input = styled.input`
  padding: 10px 12px;
  height: 38px;
  border-radius: 12px;
  border: 1px solid var(--border);
  font-size: 14px;
  outline: none;
  width: 150px;
  transition: all 0.2s;
  box-sizing: border-box;

  &:focus {
    border-color: var(--font2);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }
  :hover {
    border-color: var(--font2);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }
`;

const FilterBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  width: 100%;

  & > :first-child {
    flex-grow: 1;
  }
`;

const TableInput = styled.input`
  width: 100%;
  padding: 6px;
  border: 1px solid var(--border);
  border-radius: 10px;
  text-align: center;
  box-sizing: border-box;
  transition: all 0.2s;
  &:focus {
    border-color: var(--font2);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }
  :hover {
    border-color: var(--font2);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }
`;

const TableSelect = styled.select`
  width: 100%;
  padding: 6px;
  border: 1px solid var(--border);
  border-radius: 10px;
  box-sizing: border-box;
  &:focus {
    border-color: var(--font2);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }
  :hover {
    border-color: var(--font2);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }
`;

const TableWrap = styled.div`
  margin-bottom: 50px;
`;

const DeleteBtn = styled.button`
  background: var(--bgError);
  color: var(--error);
  border: none;
  padding: 6px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  &:hover {
    background: #ffdbdb;
  }
`;

const Footer = styled.div`
  margin-top: auto;
  background: white;
  padding: 20px;
  display: flex;
  justify-content: center;
  gap: 15px;
`;
