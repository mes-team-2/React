import styled from "styled-components";
import { useEffect, useMemo, useState } from "react";
import Table from "../../components/TableStyle";
import Button from "../../components/Button";
import SelectBar from "../../components/SelectBar";
import { InventoryAPI } from "../../api/AxiosAPI";
import { Trash2 } from "lucide-react";
import SideDrawer from "../../components/SideDrawer";

export default function ProductForm({
  mode,
  initialData,
  onSubmit,
  onClose,
  open,
}) {
  const [product, setProduct] = useState({
    productCode: "",
    productName: "",
    voltage: 12,
    capacityAh: "",
    unit: "EA",
  });

  const [bomList, setBomList] = useState([]); // 선택된 BOM 리스트
  const [materials, setMaterials] = useState([]); // 전체 자재 목록 (API 로드)

  const [selectedIds, setSelectedIds] = useState([]);

  const [newRow, setNewRow] = useState({
    materialCode: "",
    qty: "",
    process: "전극공정",
  });

  // 수정 모드 초기값 세팅
  useEffect(() => {
    if (mode === "edit" && initialData) {
      setProduct({
        productCode: initialData.productCode,
        productName: initialData.productName,
        voltage: initialData.voltage,
        capacityAh: initialData.capacityAh,
        unit: initialData.unit || "EA",
      });
    }
  }, [mode, initialData]);

  // 자재 목록 조회
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const res = await InventoryAPI.getMaterialList();
        if (res.status === 200) {
          setMaterials(res.data);
        }
      } catch (err) {
        console.error("자재 목록 로드 실패", err);
      }
    };
    fetchMaterials();
  }, []);

  // SelectBar 옵션
  const materialOptions = useMemo(() => {
    return materials.map((m) => ({
      value: m.materialCode,
      label: `${m.materialName} (${m.materialCode})`,
    }));
  }, [materials]);

  const processOptions = [
    { value: "전극공정", label: "전극공정" },
    { value: "조립공정", label: "조립공정" },
    { value: "활성화공정", label: "활성화공정" },
    { value: "팩공정", label: "팩공정" },
    { value: "검사공정", label: "검사공정" },
  ];
  // 제품 정보 변경
  const handleProductChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  // BOM 추가 로직
  const handleAddRow = () => {
    if (!newRow.materialCode || !newRow.qty) {
      alert("자재와 소요량을 입력해주세요.");
      return;
    }
    // 중복 체크
    if (bomList.some((b) => b.materialCode === newRow.materialCode)) {
      alert("이미 추가된 자재입니다.");
      return;
    }

    const selectedMaterial = materials.find(
      (m) => m.materialCode === newRow.materialCode,
    );

    const newItem = {
      id: `temp-${Date.now()}`, // 임시 ID
      materialCode: newRow.materialCode,
      materialName: selectedMaterial?.materialName || "",
      unit: selectedMaterial?.unit || "EA",
      qty: Number(newRow.qty),
      process: newRow.process,
    };

    setBomList([...bomList, newItem]);
    setNewRow({ materialCode: "", qty: "", process: "전극공정" });
  };

  // BOM 수정/삭제
  const handleRowChange = (id, field, value) => {
    setBomList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
  };

  const handleDeleteRow = (id) => {
    setBomList((prev) => prev.filter((item) => item.id !== id));
  };

  // materialCode를 기준으로 수량 업데이트 + 자동 선택 로직
  const handleQtyChange = (code, value) => {
    const numValue = Number(value);

    // 수량 상태 업데이트
    setMaterials((prev) =>
      prev.map((m) => (m.materialCode === code ? { ...m, qty: value } : m)),
    );

    // 수량이 0보다 크면 자동으로 체크박스 선택
    if (numValue > 0) {
      setSelectedIds((prev) => {
        if (!prev.includes(code)) return [...prev, code];
        return prev;
      });
    }
  };

  const bomItems = useMemo(() => {
    // 체크된 항목 중 수량이 있는 것만 필터링
    return materials
      .filter((m) => selectedIds.includes(m.materialCode) && Number(m.qty) > 0)
      .map((m) => ({
        materialCode: m.materialCode,
        materialName: m.materialName,
        qty: Number(m.qty),
        unit: m.unit || "EA",
      }));
  }, [materials, selectedIds]);

  const handleSubmit = () => {
    if (
      !product.productCode?.toString().trim() ||
      !product.productName?.toString().trim() ||
      !product.voltage ||
      !product.capacityAh
    ) {
      alert("모든 제품 정보를 입력해주세요.");
      return;
    }

    if (mode === "create") {
      const payload = {
        product: {
          productCode: product.productCode,
          productName: product.productName,
          voltage: Number(product.voltage),
          capacityAh: Number(product.capacityAh),
          unit: product.unit,
        },
        // 구성된 BOM 리스트를 전송
        bomItems: bomList.map((item) => ({
          materialCode: item.materialCode,
          materialName: item.materialName,
          qty: Number(item.qty),
          unit: item.unit,
          process: item.process,
        })),
      };
      onSubmit(payload);
    } else {
      onSubmit({
        productName: product.productName,
        capacityAh: Number(product.capacityAh),
      });
    }
  };

  const columns = [
    { key: "materialCode", label: "자재 코드", width: 140 },
    { key: "materialName", label: "자재명", width: 80 },
    {
      key: "qty",
      label: "소요량",
      width: 80,
      render: (_, row) => (
        <TableInput
          type="number"
          min={0}
          value={row.qty}
          onChange={(e) => handleRowChange(row.id, "qty", e.target.value)}
          placeholder="0"
        />
      ),
    },
    { key: "unit", label: "단위", width: 50 },
    {
      key: "process",
      label: "투입 공정",
      width: 100,
      render: (_, row) => (
        <TableSelect
          value={row.process}
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
        <DeleteBtn onClick={() => handleDeleteRow(row.id)}>
          <Trash2 size={16} />
        </DeleteBtn>
      ),
    },
  ];

  return (
    <SideDrawer open={open} onClose={onClose} title="제품 등록">
      <Container>
        <Header>
          <h3>{mode === "create" ? "제품 등록" : "제품 수정"}</h3>
        </Header>

        <Content>
          <Section>
            <SectionTitle>제품 정보</SectionTitle>
            <Grid>
              <FullItem>
                <label>제품 코드</label>
                <Input
                  name="productCode"
                  value={product.productCode}
                  onChange={handleProductChange}
                  disabled={mode === "edit"}
                  placeholder="제품코드를 입력하세요"
                />
              </FullItem>
              <FullItem>
                <label>제품명</label>
                <Input
                  name="productName"
                  value={product.productName}
                  onChange={handleProductChange}
                  placeholder="제품명을 입력하세요"
                />
              </FullItem>
              <Item>
                <label>전압(V)</label>
                <Input
                  type="number"
                  name="voltage"
                  value={product.voltage}
                  onChange={handleProductChange}
                  disabled={mode === "edit"}
                />
              </Item>
              <Item>
                <label>용량(Ah)</label>
                <Input
                  type="number"
                  name="capacityAh"
                  value={product.capacityAh}
                  onChange={handleProductChange}
                  placeholder="제품명 용량(Ah)을 입력하세요"
                />
              </Item>
            </Grid>
          </Section>

          {mode === "create" && (
            <>
              <Section>
                <SectionTitle>BOM 자재 추가</SectionTitle>
                <FilterBar>
                  <div style={{ flex: 2 }}>
                    <SelectBar
                      type="single"
                      width="100%"
                      placeholder="자재 선택"
                      options={materialOptions}
                      value={newRow.materialCode}
                      onChange={(e) => {
                        const val = e.target ? e.target.value : e;
                        setNewRow((p) => ({ ...p, materialCode: val }));
                      }}
                    />
                  </div>
                  <div style={{ flex: 1.5 }}>
                    <SelectBar
                      type="single"
                      width="100%"
                      placeholder="공정 선택"
                      options={processOptions}
                      value={newRow.process}
                      onChange={(e) => {
                        const val = e.target ? e.target.value : e;
                        setNewRow((p) => ({ ...p, process: val }));
                      }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <Input
                      type="number"
                      placeholder="소요량"
                      value={newRow.qty}
                      onChange={(e) =>
                        setNewRow((p) => ({ ...p, qty: e.target.value }))
                      }
                    />
                  </div>
                  <Button variant="ok" size="form" onClick={handleAddRow}>
                    + 추가
                  </Button>
                </FilterBar>
              </Section>
              <Section>
                <SectionTitle>BOM 리스트 ({bomList.length})</SectionTitle>
                <TableWrap>
                  <Table
                    columns={columns}
                    data={bomList}
                    selectable={false}
                    hover={false}
                  />
                </TableWrap>
              </Section>
            </>
          )}
        </Content>

        <Footer>
          <Button variant="cancel" size="l" onClick={onClose}>
            취소
          </Button>
          <Button variant="ok" size="m" onClick={handleSubmit}>
            {mode === "create" ? "등록하기" : "수정하기"}
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
  width: 100%;
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
