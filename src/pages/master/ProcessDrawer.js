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
  return (
    <SideDrawer
      open={open}
      width={420}
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

        <FieldRow>
          <label>
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) =>
                setForm((p) => ({ ...p, active: e.target.checked }))
              }
            />
            사용 여부
          </label>
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

const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 16px;
  margin-top: 10px;
  border-top: 1px solid var(--border);
`;
