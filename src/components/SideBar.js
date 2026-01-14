import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import styled from "styled-components";

/* =========================
   페이지 라벨 매핑
========================= */
const PAGE_LABEL = {
  "/mes/dashboard": "대시보드",
  "/mes/workorders": "작업지시",
  "/mes/lot": "LOT/이력",
  "/mes/process-log": "공정 로그",
  "/mes/quality": "품질/불량",
  "/mes/material": "자재",
  "/mes/bom": "BOM",
  "/mes/machine": "설비",
  "/mes/inventory": "재고",
};

const STORAGE_KEY = "mes_recent_pages";

export default function SideBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const tabsRef = useRef(null);

  /* =========================
     🔹 새로고침 유지
  ========================= */
  const [recentPages, setRecentPages] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  /* =========================
     🔹 페이지 이동 시 탭 추가
  ========================= */
  useEffect(() => {
    const path = location.pathname;
    const label = PAGE_LABEL[path];
    if (!label) return;

    setRecentPages((prev) => {
      if (prev.some((p) => p.path === path)) return prev;

      const next = [...prev, { path, label }];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, [location.pathname]);

  /* =========================
     🔹 새 탭 기준 자동 스크롤
  ========================= */
  useEffect(() => {
    if (!tabsRef.current) return;

    tabsRef.current.scrollTo({
      left: tabsRef.current.scrollWidth,
      behavior: "smooth",
    });
  }, [recentPages.length]);

  /* =========================
     🔹 탭 삭제
  ========================= */
  const removeTab = (path) => {
    setRecentPages((prev) => {
      const next = prev.filter((p) => p.path !== path);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  return (
    <Shell>
      <Sidebar>
        <Brand>
          <div className="logo">Z-Zone</div>
          <div className="sub">Battery</div>
        </Brand>

        <Nav>
          <SectionTitle>모니터링</SectionTitle>
          <MenuLink to="/mes/dashboard">대시보드</MenuLink>
          <MenuLink to="/mes/workorders">작업지시</MenuLink>
          <MenuLink to="/mes/lot">LOT/이력</MenuLink>

          <Divider />

          <SectionTitle>생산/품질</SectionTitle>
          <MenuLink to="/mes/process-log">공정 로그</MenuLink>
          <MenuLink to="/mes/quality">품질/불량</MenuLink>

          <Divider />

          <SectionTitle>기준정보</SectionTitle>
          <MenuLink to="/mes/material">자재</MenuLink>
          <MenuLink to="/mes/bom">BOM</MenuLink>
          <MenuLink to="/mes/machine">설비</MenuLink>
          <MenuLink to="/mes/inventory">재고</MenuLink>
        </Nav>

        <SidebarFooter>
          <small>© {new Date().getFullYear()} MES</small>
        </SidebarFooter>
      </Sidebar>

      <Main>
        <TopBar>
          {/* 🔹 최근 페이지 탭 */}
          <TopLeft ref={tabsRef}>
            {recentPages.map((p) => {
              const active = location.pathname === p.path;
              return (
                <Tab
                  key={p.path}
                  $active={active}
                  onClick={() => navigate(p.path)}
                >
                  <span>{p.label}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeTab(p.path);
                    }}
                  >
                    ✕
                  </button>
                </Tab>
              );
            })}
          </TopLeft>

          {/* 🔹 검색 */}
          <div className="right">
            <Search placeholder="검색 (예: LOT, 작업지시번호)" />
          </div>
        </TopBar>

        <Content>
          <Outlet />
        </Content>
      </Main>
    </Shell>
  );
}

/* =========================
   styled
========================= */

const Shell = styled.div`
  display: grid;
  grid-template-columns: 260px 1fr;
  min-height: 100vh;
  background: var(--background2);
`;

const Sidebar = styled.aside`
  position: sticky;
  top: 0;
  height: 100vh;
  background: var(--background);
  display: flex;
  flex-direction: column;
`;

const Brand = styled.div`
  padding: 18px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);

  .logo {
    font-weight: 800;
    font-size: 18px;
  }
  .sub {
    font-size: 12px;
    opacity: 0.7;
  }
`;

const Nav = styled.nav`
  padding: 12px 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  overflow: auto;
`;

const SectionTitle = styled.div`
  margin: 14px 10px 6px;
  font-size: 11px;
  opacity: 0.55;
`;

const Divider = styled.div`
  height: 1px;
  margin: 10px 8px;
  background: rgba(255, 255, 255, 0.08);
`;

const MenuLink = styled(NavLink)`
  padding: 10px;
  border-radius: 10px;

  &:hover {
    background: var(--main2);
  }

  &.active {
    background: rgba(99, 102, 241, 0.25);
  }
`;

const SidebarFooter = styled.div`
  padding: 12px 16px;
  opacity: 0.6;
`;

const Main = styled.main`
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

const TopBar = styled.header`
  position: sticky;
  top: 0;
  z-index: 5;
  background: rgba(246, 247, 251, 0.9);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  padding: 14px 22px;
  gap: 12px;
`;

const TopLeft = styled.div`
  display: flex;
  gap: 8px;
  max-width: calc(100vw - 500px);
  overflow-x: auto;
  padding-bottom: 2px;

  &::-webkit-scrollbar {
    height: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.15);
    border-radius: 10px;
  }
`;

const Tab = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: ${({ $active }) =>
    $active ? "var(--main2)" : "var(--background)"};
  font-size: 13px;
  cursor: pointer;
  white-space: nowrap;

  span {
    font-weight: ${({ $active }) => ($active ? "600" : "400")};
  }

  button {
    font-size: 12px;
    opacity: 0.6;
  }
`;

const Search = styled.input`
  width: min(320px, 36vw);
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid var(--border);

  &:focus {
    border-color: var(--main);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
  }
`;

const Content = styled.section`
  padding: 22px;
  min-width: 0;
`;
