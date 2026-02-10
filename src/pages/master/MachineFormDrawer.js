import styled from "styled-components";
import SideDrawer from "../../components/SideDrawer";
import Button from "../../components/Button";
import SelectBar from "../../components/SelectBar";
import Status from "../../components/Status";
import { MachineAPI } from "../../api/AxiosAPI";

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
  const currentActive = form.active ? "true" : "false";

  // 설비 코드 중복 체크 핸들러
  const handleCheckDuplicate = async () => {
    // 수정 모드이거나 입력값이 없으면 체크하지 않음
    if (mode === "edit" || !form.machineCode) return;

    try {
      // 전체 설비 목록을 가져옴
      const res = await MachineAPI.getList();
      const allMachines = res.data;

      // 입력한 코드와 일치하는 설비가 있는지 확인
      const isDuplicate = allMachines.some(
        (machine) => machine.machineCode === form.machineCode,
      );

      // 중복이면 경고창 띄우고 입력값 초기화
      if (isDuplicate) {
        alert("이미 등록된 설비 코드입니다.");
        setForm((prev) => ({ ...prev, machineCode: "" }));
      }
    } catch (err) {
      console.error("중복 체크 중 오류 발생:", err);
    }
  };

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
                  // 포커스가 벗어날 때(입력 완료 후) 중복 체크 실행
                  onBlur={handleCheckDuplicate}
                  placeholder="설비 코드를 입력하세요"
                />
              </FullItem>

              <FullItem>
                <label>설비명</label>
                <Input
                  value={form.machineName || ""}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, machineName: e.target.value }))
                  }
                  placeholder="설비명을 입력하세요"
                />
              </FullItem>

              <Item>
                <label>사용 여부</label>
                <SelectBar
                  width="100%"
                  type="single"
                  placeholder="상태 선택"
                  options={activeOptions}
                  value={currentActive}
                  onChange={(e) => {
                    console.log(
                      "active type:",
                      typeof form.active,
                      form.active,
                    );
                    const raw = e?.target?.value;
                    setForm((p) => ({ ...p, active: raw === "true" }));
                  }}
                />
              </Item>
              <Item>
                <label>설비상태</label>
                <Status
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
                  placeholder="공정코드를 입력하세요"
                />
              </FullItem>
              <FullItem>
                <label>공정명</label>
                <Input
                  value={form.processName || ""}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, processName: e.target.value }))
                  }
                  placeholder="공정명을 입력하세요"
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
