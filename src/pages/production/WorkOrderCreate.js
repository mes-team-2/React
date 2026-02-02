import { useEffect, useState } from "react";
import styled from "styled-components";
import { format } from "date-fns"; // 날짜 변환용
import { WorkOrderAPI } from "../../api/AxiosAPI";
import Button from "../../components/Button";
import SearchDate from "../../components/SearchDate";
import SelectBar from "../../components/SelectBar";

export default function WorkOrderCreate({ onSubmit, onClose }) {
  // 제품 목록 상태
  const [products, setProducts] = useState([]);

  // 폼 상태
  const [form, setForm] = useState({
    productCode: "",
    productName: "",
    plannedQty: "",
    dueDate: "",
    note: "",
  });

  // 제품 목록 불러오기
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await WorkOrderAPI.getProductList();
        // 응답 데이터 구조 확인 필요 (배열인지 체크)
        if (Array.isArray(res.data)) {
          setProducts(res.data);
        } else {
          console.warn("제품 목록 형식이 배열이 아닙니다:", res.data);
          setProducts([]);
        }
      } catch (err) {
        console.error("제품 목록 로드 실패", err);
        // 에러 상황에서도 UI가 깨지지 않도록 빈 배열 처리
        setProducts([]);
      }
    };
    fetchProducts();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "productCode") {
      const selectedProduct = products.find((p) => p.productCode === value);
      setForm((prev) => ({
        ...prev,
        [name]: value,
        productName: selectedProduct ? selectedProduct.productName : "",
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // SelectBar 변경 핸들러
  const handleProductSelect = (e) => {
    const value = e.target.value;
    const selectedProduct = products.find((p) => p.productCode === value);
    setForm((prev) => ({
      ...prev,
      productCode: value,
      productName: selectedProduct ? selectedProduct.productName : "",
    }));
  };

  // 작업기한 변경 핸들러
  const handleDueDateChange = (date) => {
    if (date) {
      setForm((prev) => ({ ...prev, dueDate: format(date, "yyyy-MM-dd") }));
    } else {
      setForm((prev) => ({ ...prev, dueDate: "" }));
    }
  };

  const handleSubmit = async () => {
    if (!form.productCode || !form.plannedQty || !form.dueDate) {
      alert("제품, 지시 수량, 작업기한은 필수 항목입니다.");
      return;
    }

    try {
      const payload = {
        productCode: form.productCode,
        plannedQty: parseInt(form.plannedQty),
        dueDate: form.dueDate,
        note: form.note,
      };

      const res = await WorkOrderAPI.createWorkOrder(payload);
      alert(res.data.message || "작업지시가 등록되었습니다.");

      // 폼 초기화
      setForm({
        productCode: "",
        productName: "",
        plannedQty: "",
        dueDate: "",
      });
      onSubmit?.(payload);
    } catch (err) {
      console.error(err);
      alert("등록 실패: " + (err.response?.data?.message || "서버 오류 발생"));
    }
  };

  // SelectBar 옵션
  const productOptions = products.map((p) => ({
    value: p.productCode,
    label: `${p.productName} (${p.productCode})`,
  }));

  return (
    <Wrapper>
      <Header>
        <h3>작업지시 등록</h3>
      </Header>

      <Content>
        <Section>
          <SectionTitle>생산 제품 정보</SectionTitle>
          <Grid>
            <FullItem>
              <label>제품 선택</label>
              <SelectBar
                width="100%"
                type="single"
                placeholder="제품을 선택하세요"
                options={productOptions}
                value={form.productCode}
                onChange={handleProductSelect}
              />
            </FullItem>
            <FullItem>
              <label>선택된 제품명</label>
              <Value>{form.productName || "-"}</Value>
            </FullItem>
            <FullItem>
              <label>선택된 코드</label>
              <Value>{form.productCode || "-"}</Value>
            </FullItem>
          </Grid>
        </Section>
        <Section>
          <SectionTitle>생산 정보</SectionTitle>
          <Grid>
            <FullItem>
              <label>지시 수량</label>
              <Input
                type="number"
                name="plannedQty"
                value={form.plannedQty}
                onChange={handleChange}
                placeholder="예: 1000"
              />
            </FullItem>

            <Item>
              <label>작업기한 (Due Date)</label>
              <SearchDate
                width="100%"
                type="single"
                onChange={handleDueDateChange}
                placeholder="작업기한 선택"
              />
            </Item>
          </Grid>
        </Section>
      </Content>

      <Footer>
        <Button variant="cancel" size="l" onClick={onClose}>
          취소
        </Button>
        <Button variant="ok" size="l" onClick={handleSubmit}>
          등록
        </Button>
      </Footer>
    </Wrapper>
  );
}

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

// 실제 입력 필드 스타일
const Input = styled.input`
  padding: 10px 12px;
  height: 38px;
  border-radius: 12px;
  border: 1px solid var(--border);
  font-size: 14px;
  outline: none;
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

const Footer = styled.div`
  margin-top: auto;
  display: flex;
  justify-content: center;
  gap: 50px;
`;
