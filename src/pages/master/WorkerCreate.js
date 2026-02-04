import styled from "styled-components";
import { useState, useEffect } from "react";
import SideDrawer from "../../components/SideDrawer";
import Button from "../../components/Button";
import SelectBar from "../../components/SelectBar";
import { WorkerAPI } from "../../api/AxiosAPI";

/**
 * @param {boolean} open - Drawer 열림 여부
 * @param {string} mode - 'create' | 'edit'
 * @param {object} initialData - 수정 시 초기 데이터 (없으면 빈 값)
 * @param {function} onClose - 닫기 핸들러
 * @param {function} onSuccess - 저장 성공 시 콜백 (목록 갱신용)
 */
export default function WorkerCreate({
  open,
  mode,
  initialData,
  onClose,
  onSuccess,
}) {
  const [form, setForm] = useState({
    id: null,
    workerNo: "",
    name: "",
    position: "작업자",
    joinedAt: "",
    active: true,
  });

  const positionOptions = [
    { value: "작업자", label: "작업자" },
    { value: "관리자", label: "관리자" },
  ];

  // Drawer가 열릴 때 초기 데이터 세팅
  useEffect(() => {
    if (open) {
      if (mode === "edit" && initialData) {
        setForm(initialData);
      } else {
        // Create 모드 초기화
        setForm({
          id: null,
          workerNo: "",
          name: "",
          position: "작업자",
          joinedAt: new Date().toISOString().split("T")[0],
          active: true,
        });
      }
    }
  }, [open, mode, initialData]);

  const handleCreate = async () => {
    if (!form.workerNo.trim() || !form.name.trim()) {
      alert("필수 정보를 입력해주세요.");
      return;
    }
    try {
      await WorkerAPI.create({
        workerNo: form.workerNo,
        name: form.name,
        position: form.position,
      });
      alert("등록되었습니다.");
      onSuccess(); // 부모에게 성공 알림
      onClose(); // Drawer 닫기
    } catch (err) {
      console.error(err);
      alert("등록 실패");
    }
  };

  const handleUpdate = async () => {
    try {
      await WorkerAPI.update(form.id, {
        name: form.name,
        position: form.position,
        active: form.active,
      });
      alert("수정되었습니다.");
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert("수정 실패");
    }
  };

  return (
    <SideDrawer open={open} onClose={onClose}>
      <Wrapper>
        <Header>
          <h3>{mode === "create" ? "작업자 등록" : "작업자 수정"}</h3>
        </Header>

        <Content>
          <Section>
            <SectionTitle>개인정보</SectionTitle>
            <Grid>
              <FullItem>
                <label>사원 번호</label>
                <Input
                  value={form.workerNo}
                  disabled={mode === "edit"}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, workerNo: e.target.value }))
                  }
                  placeholder="사원번호를 입력하세요"
                />
              </FullItem>
              <FullItem>
                <label>사원명</label>
                <Input
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="사원명을 입력하세요"
                />
              </FullItem>
              <FullItem>
                <label>입사일</label>
                <Input
                  value={form.joinedAt}
                  disabled
                  placeholder="자동 생성됨"
                />
              </FullItem>
            </Grid>
          </Section>

          <Section>
            <SectionTitle>권한정보</SectionTitle>
            <Grid>
              <FullItem>
                <label>직급</label>
                <SelectBar
                  type="single"
                  width="100%"
                  placeholder="직급 선택"
                  options={positionOptions}
                  value={form.position}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, position: e.target.value }))
                  }
                />
              </FullItem>
            </Grid>
          </Section>
        </Content>

        <Footer>
          <Button variant="cancel" size="m" onClick={onClose}>
            취소
          </Button>
          <Button
            variant="ok"
            size="m"
            onClick={mode === "create" ? handleCreate : handleUpdate}
          >
            {mode === "create" ? "등록" : "수정"}
          </Button>
        </Footer>
      </Wrapper>
    </SideDrawer>
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
