import styled from "styled-components";
import SideDrawer from "../../components/SideDrawer";
import Button from "../../components/Button";
import SelectBar from "../../components/SelectBar";
import Status from "../../components/Status";

export default function MachineFormDrawer({
  open,
  mode,
  form,
  setForm,
  onClose,
  onSubmit,
}) {
  // 옵션의 value를 문자열로 통일함
  const activeOptions = [
    { value: "true", label: "사용중" },
    { value: "false", label: "사용중지" },
  ];

  // form.active의 현재 값을 무조건 문자열 "true" 혹은 "false"로 정규화함
  const currentActive = String(form.active) === "true" ? "true" : "false";

  return (
    <SideDrawer open={open} onClose={onClose}>
      <Wrap>
        <Header>
          <h3>{mode === "create" ? "설비 추가" : "설비 수정"}</h3>
        </Header>
        <Content>
          <Section>
            <SectionTitle>설비 정보</SectionTitle>

            <DataGrid>
              <FullItem>
                <label>설비 코드</label>
                <Input
                  value={form.machineCode || ""}
                  disabled={mode === "edit"}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, machineCode: e.target.value }))
                  }
                />
              </FullItem>

              <FullItem>
                <label>설비명</label>
                <Input
                  value={form.machineName || ""}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, machineName: e.target.value }))
                  }
                />
              </FullItem>

              <Item>
                <label>사용 여부</label>
                {/* 핵심: key 값에 currentActive를 넣음
                  이렇게 하면 사용중지에서 사용중으로 바뀔 때 key가 변경됨
                  리액트는 key가 바뀌면 컴포넌트를 죽이고 새로 만들기 때문에 내부 로직에 상관없이 값이 바뀜
                */}
                <SelectBar
                  key={`select-${currentActive}`}
                  width="100%"
                  type="single"
                  placeholder="상태 선택"
                  options={activeOptions}
                  value={currentActive}
                  onChange={(val) => {
                    // 선택 시 부모의 상태를 즉시 업데이트함
                    setForm((p) => ({ ...p, active: String(val) }));
                  }}
                />
              </Item>
              <Item>
                <label>설비상태</label>
                <Status
                  // 정규화된 currentActive 값에 따라 YES/NO를 출력함
                  status={currentActive === "true" ? "YES" : "NO"}
                  type="wide"
                />
              </Item>
            </DataGrid>
          </Section>

          <Section>
            <SectionTitle>공정 정보</SectionTitle>
            <DataGrid>
              <FullItem>
                <label>공정 코드</label>
                <Input
                  value={form.processCode || ""}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, processCode: e.target.value }))
                  }
                />
              </FullItem>
              <FullItem>
                <label>공정명</label>
                <Input
                  value={form.processName || ""}
                  // 이전 코드에 있던 processCode 업데이트 오타 수정함
                  onChange={(e) =>
                    setForm((p) => ({ ...p, processName: e.target.value }))
                  }
                />
              </FullItem>
            </DataGrid>
          </Section>
        </Content>

        <Footer>
          <Button variant="cancel" size="m" onClick={onClose}>
            취소
          </Button>
          <Button variant="ok" size="m" onClick={onSubmit}>
            {mode === "create" ? "추가" : "수정"}
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

const Footer = styled.div`
  margin-top: auto;
  display: flex;
  justify-content: center;
  gap: 50px;
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
