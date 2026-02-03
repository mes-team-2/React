import styled from "styled-components";
import SideDrawer from "../../components/SideDrawer";
import Button from "../../components/Button";

export default function MachineFormDrawer({
  open,
  mode, // create | edit
  form,
  setForm,
  onClose,
  onSubmit,
}) {
  return (
    <SideDrawer open={open} width={360} onClose={onClose}>
      <Wrapper>
        <Title>{mode === "create" ? "설비 추가" : "설비 수정"}</Title>

        <Field>
          <label>설비 코드</label>
          <input
            value={form.machineCode}
            disabled={mode === "edit"}
            onChange={(e) =>
              setForm((p) => ({ ...p, machineCode: e.target.value }))
            }
          />
        </Field>

        <Field>
          <label>설비명</label>
          <input
            value={form.machineName}
            onChange={(e) =>
              setForm((p) => ({ ...p, machineName: e.target.value }))
            }
          />
        </Field>

        <Field>
          <label>공정 코드</label>
          <input
            value={form.processCode}
            onChange={(e) =>
              setForm((p) => ({ ...p, processCode: e.target.value }))
            }
          />
        </Field>

        <CheckRow>
          <span>사용 여부</span>

          <Toggle
            $active={form.active}
            onClick={() => setForm((p) => ({ ...p, active: !p.active }))}
          >
            <Knob $active={form.active} />
          </Toggle>

          <ToggleLabel $active={form.active}>
            {form.active ? "사용" : "미사용"}
          </ToggleLabel>
        </CheckRow>

        <Footer>
          <Button variant="cancel" size="m" onClick={onClose}>
            취소
          </Button>
          <Button variant="ok" size="m" onClick={onSubmit}>
            {mode === "create" ? "추가" : "수정"}
          </Button>
        </Footer>
      </Wrapper>
    </SideDrawer>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const Title = styled.div`
  font-size: 16px;
  font-weight: 700;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;

  label {
    font-size: 12px;
    opacity: 0.7;
  }

  input {
    padding: 8px 10px;
    border-radius: 6px;
    border: 1px solid var(--border);
  }
`;

const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 10px;
`;

const CheckRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 8px;
  font-size: 12px;

  span {
    min-width: 60px;
    opacity: 0.7;
  }
`;

const Toggle = styled.div`
  width: 44px;
  height: 22px;
  border-radius: 11px;
  background: ${(p) => (p.$active ? "var(--main)" : "#ccc")};
  position: relative;
  cursor: pointer;
  transition: background 0.2s ease;
  user-select: none;
`;

const Knob = styled.div`
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  position: absolute;
  top: 2px;
  left: ${(p) => (p.$active ? "24px" : "2px")};
  transition: left 0.2s ease;
`;

const ToggleLabel = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: ${(p) => (p.$active ? "var(--main)" : "#777")};
`;
