import styled from "styled-components";
import SideDrawer from "../../components/SideDrawer";
import Button from "../../components/Button";

/* =========================
   공정 등록 / 수정 Drawer
========================= */
export default function ProcessDrawer({
  open,
  mode, // create | edit
  form,
  setForm,
  onClose,
  onSubmit,
}) {
  const toggleActive = () => {
    setForm((p) => ({ ...p, active: !p.active }));
  };

  return (
    <SideDrawer
      open={open}
      width={430}
      title={mode === "create" ? "공정 등록" : "공정 수정"}
      onClose={onClose}
    >
      <Form>
        <Field>
          <label>공정 순서</label>
          <input
            type="number"
            value={form.seq}
            disabled={mode === "edit"}
            onChange={(e) => setForm((p) => ({ ...p, seq: e.target.value }))}
          />
        </Field>

        <Field>
          <label>공정 코드</label>
          <input
            value={form.processCode}
            disabled={mode === "edit"}
            onChange={(e) =>
              setForm((p) => ({ ...p, processCode: e.target.value }))
            }
          />
        </Field>

        <Field>
          <label>공정명</label>
          <input
            value={form.processName}
            onChange={(e) =>
              setForm((p) => ({ ...p, processName: e.target.value }))
            }
          />
        </Field>

        {/* ✅ 사용 여부 토글 (안정형) */}
        <FieldRow>
          <ToggleRow>
            <span>사용 여부</span>

            <Toggle
              role="switch"
              aria-checked={form.active}
              tabIndex={0}
              $active={form.active}
              onClick={toggleActive}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggleActive();
                }
              }}
            >
              <ToggleThumb $active={form.active} />
            </Toggle>

            <StateText $active={form.active}>
              {form.active ? "사용중" : "중지"}
            </StateText>
          </ToggleRow>
        </FieldRow>

        <Footer>
          <Button variant="cancel" size="m" onClick={onClose}>
            취소
          </Button>

          <Button variant="ok" size="m" onClick={onSubmit}>
            {mode === "create" ? "등록" : "수정"}
          </Button>
        </Footer>
      </Form>
    </SideDrawer>
  );
}

/* =========================
   styled
========================= */

const Form = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
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
    border: 1px solid var(--border);
    border-radius: 6px;
  }
`;

const FieldRow = styled.div`
  font-size: 13px;
`;

const ToggleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  span {
    font-size: 12px;
    opacity: 0.7;
    min-width: 60px;
  }
`;

/* ⭐ background 오류 방지: background 대신 background-color 사용 */
const Toggle = styled.div`
  width: 44px;
  height: 22px;
  border-radius: 11px;
  background-color: ${(p) => (p.$active ? "var(--main)" : "#c9c9c9")};
  position: relative;
  cursor: pointer;
  transition: background-color 0.2s ease;
  flex-shrink: 0;
`;

const ToggleThumb = styled.div`
  width: 18px;
  height: 18px;
  background-color: #fff;
  border-radius: 50%;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: transform 0.2s ease;
  transform: ${(p) => (p.$active ? "translateX(22px)" : "translateX(0)")};
`;

const StateText = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: ${(p) => (p.$active ? "var(--main)" : "#888")};
`;

const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 16px;
  margin-top: 10px;
  border-top: 1px solid var(--border);
`;
