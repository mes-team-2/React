import styled from "styled-components";
import { useState } from "react";
import { InventoryAPI } from "../../api/AxiosAPI"; // API import
import Button from "../../components/Button";
import SelectBar from "../../components/SelectBar";

export default function MaterialCreate({ onClose }) {
  const [form, setForm] = useState({
    materialName: "",
    initialStock: "", // 기존 stockQty -> initialStock (기초재고)
    safeQty: "",
    unit: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    // 기초재고와 안전재고는 숫자만 입력되도록 제한
    if (name === "initialStock" || name === "safeQty") {
      const onlyNumber = value.replace(/[^0-9]/g, ""); // 숫자가 아닌 문자 제거
      setForm((prev) => ({ ...prev, [name]: onlyNumber }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // SelectBar용 옵션
  const unitOptions = [
    { value: "EA", label: "EA" },
    { value: "KG", label: "KG" },
    { value: "L", label: "L" },
    { value: "M", label: "M" },
  ];

  const handleSubmit = async () => {
    // 유효성 검사
    if (!form.materialName.trim()) {
      alert("자재명을 입력해주세요.");
      return;
    }
    if (!form.unit) {
      alert("단위를 선택해주세요.");
      return;
    }

    // 데이터 포맷팅 (숫자 변환)
    const requestData = {
      materialName: form.materialName,
      unit: form.unit,
      // 빈 값일 경우 0 처리
      initialStock: form.initialStock ? Number(form.initialStock) : 0,
      safeQty: form.safeQty ? Number(form.safeQty) : 0,
    };

    // API 호출
    try {
      const response = await InventoryAPI.registerMaterial(requestData);
      if (response.status === 200) {
        alert("자재가 성공적으로 등록되었습니다.");
        onClose(); // 모달 닫기 (Material.js의 useEffect가 닫히면서 목록 갱신 트리거)
      }
    } catch (e) {
      console.error("자재 등록 실패:", e);
      alert("자재 등록 중 오류가 발생했습니다.");
    }
  };

  return (
    <Wrapper>
      <Header>
        <h3>신규 자재 등록</h3>
      </Header>

      <Content>
        <Section>
          <SectionTitle>자재 정보</SectionTitle>
          <Grid>
            <FullItem>
              <label>no (자재번호)</label>
              <Input placeholder="자동 생성" disabled />
            </FullItem>
          </Grid>

          <FullItem>
            <label>자재 코드</label>
            <Input placeholder="자동 생성" disabled />
          </FullItem>

          <FullItem>
            <label>자재명 *</label>
            <Input
              name="materialName"
              value={form.materialName}
              onChange={handleChange}
              placeholder="자재 이름을 입력하세요"
            />
          </FullItem>
        </Section>

        <Section>
          <SectionTitle>자재 정보</SectionTitle>
          <Grid>
            <Item>
              <label>기초 재고</label>
              <Input
                name="initialStock"
                type="text"
                value={form.initialStock}
                onChange={handleChange}
                placeholder="초기 재고 수량을 입력하세요"
              />
            </Item>
            <Item>
              <label>안전재고</label>
              <Input
                name="safeQty"
                type="text"
                value={form.safeQty}
                onChange={handleChange}
                placeholder="안전재고 수량을 입력하세요"
              />
            </Item>
            <FullItem>
              <label>단위 *</label>
              <SelectBar
                type="single"
                width="100%"
                placeholder="자재 단위를 선택하세요"
                options={unitOptions}
                value={form.unit}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, unit: e.target.value }))
                }
              />
            </FullItem>
          </Grid>
        </Section>
      </Content>

      <Footer>
        <Button variant="cancel" size="l" width="100%" onClick={onClose}>
          취소
        </Button>
        <Button variant="ok" size="l" width="100%" onClick={handleSubmit}>
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
  padding-bottom: 150px;

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
