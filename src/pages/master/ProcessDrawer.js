import styled from "styled-components";
import SideDrawer from "../../components/SideDrawer";
import SelectBar from "../../components/SelectBar";
import Button from "../../components/Button";

export default function ProcessDrawer({
  open,
  mode, // create | edit
  form,
  setForm,
  onClose,
  onSubmit,
}) {
  const activeOptions = [
    { value: true, label: "사용중" },
    { value: false, label: "중지" },
  ];

  // 유효성 검사 및 제출 핸들러
  const handleSubmit = () => {
    // 필수값 체크
    if (!form.seq) {
      alert("공정 순서를 입력해주세요.");
      return;
    }
    if (!form.processName) {
      alert("공정명을 입력해주세요.");
      return;
    }
    if (form.active === undefined || form.active === null) {
      alert("사용 여부를 선택해주세요.");
      return;
    }

    // 2. 유효성 통과 시 부모의 onSubmit 호출
    onSubmit();
  };

  return (
    <SideDrawer open={open} onClose={onClose}>
      <Wrap>
        <Header>
          <h3>{mode === "create" ? "신규 공정 등록" : "공정 수정"}</h3>
        </Header>
        <Content>
          <Section>
            <SectionTitle>공정 정보</SectionTitle>
            <DataGrid>
              <FullItem>
                <label>공정 코드</label>
                <Input
                  value={form.processCode}
                  disabled={true} // 사용자 입력 불가
                  readOnly // 읽기 전용
                  placeholder="자동 생성"
                />
              </FullItem>

              <FullItem>
                <label>공정명</label>
                <Input
                  value={form.processName}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, processName: e.target.value }))
                  }
                  placeholder="공정 이름을 입력하세요"
                />
              </FullItem>
            </DataGrid>
          </Section>
          <Section>
            <SectionTitle>공정 가동 정보</SectionTitle>
            <DataGrid>
              <Item>
                <label>공정 순서</label>
                <Input
                  type="number"
                  value={form.seq}
                  disabled={mode === "edit"}
                  onChange={(e) => {
                    const val = e.target.value;
                    setForm((p) => ({
                      ...p,
                      seq: val,
                      // create 모드일 때 공정 순서에 따라 공정 코드 자동 생성 (PROC-001 형식)
                      processCode:
                        mode === "create" && val
                          ? `PROC-${val.padStart(3, "0")}`
                          : p.processCode,
                    }));
                  }}
                  placeholder="공정 순서를 입력하세요"
                />
              </Item>
              <Item>
                <label>사용 여부</label>
                <SelectBar
                  width="100%"
                  type="single"
                  placeholder="상태 선택"
                  options={activeOptions}
                  value={form.active}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, active: e.target.value }))
                  }
                />
              </Item>
            </DataGrid>
          </Section>
        </Content>

        <Footer>
          <Button variant="cancel" size="l" onClick={onClose}>
            취소
          </Button>
          <Button variant="ok" size="l" onClick={onSubmit}>
            {mode === "create" ? "등록" : "수정"}
          </Button>
        </Footer>
      </Wrap>
    </SideDrawer>
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

const FullItem = styled(Item)`
  grid-column: 1 / -1;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--background);
  height: 38px;
  font-size: var(--fontXs);
  color: var(--font);
  box-sizing: border-box;
  outline: none;
  transition: all 0.2s;

  &:focus {
    border-color: var(--font2);
    box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.05);
  }
  &:disabled {
    background-color: var(--background2);
    color: var(--font2);
    cursor: not-allowed;
  }
`;

const Footer = styled.div`
  margin-top: auto;
  display: flex;
  justify-content: center;
  gap: 50px;
`;
