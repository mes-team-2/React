import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import styled from "styled-components";

/* =========================
   최근 페이지 라벨
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

/* =========================
   사이드바 메뉴 구조
========================= */
const MENU = [
  {
    key: "master",
    title: "기준 정보 관리",
    items: [
      { to: "/mes/machine", label: "설비 관리" },
      { to: "/mes/process", label: "공정 관리" },
      { to: "/mes/bom", label: "BOM 관리" },
      { to: "/mes/worker", label: "작업자 관리" },
    ],
  },
  {
    key: "production",
    title: "생산 관리",
    items: [
      { to: "/mes/workorders", label: "작업지시 관리" },
      { to: "/mes/lot", label: "LOT 관리" },
    ],
  },
  {
    key: "quality",
    title: "품질 관리",
    items: [
      { to: "/mes/quality-test", label: "검사 이력" },
      { to: "/mes/quality-defect", label: "불량 관리" },
    ],
  },
  {
    key: "inventory",
    title: "자재 / 제품 관리",
    items: [
      { to: "/mes/material", label: "자재 관리" },
      { to: "/mes/material-tx", label: "자재 이력" },
      { to: "/mes/product", label: "제품 관리" },
      { to: "/mes/inventory", label: "제품 재고 관리" },
      { to: "/mes/shipment", label: "제품 출하 관리" },
    ],
  },
  {
    key: "report",
    title: "리포트 / 조회",
    items: [
      { to: "/mes/report", label: "생산 리포트" },
      { to: "/mes/trace", label: "Traceability 조회" },
    ],
  },
];

export default function SideBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const tabsRef = useRef(null);

  /* =========================
     🔹 상단 탭 (원래 그대로)
  ========================= */
  const [recentPages, setRecentPages] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

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

  useEffect(() => {
    if (!tabsRef.current) return;
    tabsRef.current.scrollTo({
      left: tabsRef.current.scrollWidth,
      behavior: "smooth",
    });
  }, [recentPages.length]);

  const removeTab = (path) => {
    setRecentPages((prev) => {
      const next = prev.filter((p) => p.path !== path);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  /* =========================
     🔹 대분류 열림 상태 (복수)
  ========================= */
  const [openKeys, setOpenKeys] = useState([]);

  useEffect(() => {
    const current = MENU.find((group) =>
      group.items.some((item) => location.pathname.startsWith(item.to))
    );
    if (current && !openKeys.includes(current.key)) {
      setOpenKeys((prev) => [...prev, current.key]);
    }
  }, [location.pathname]);

  const toggleGroup = (key) => {
    setOpenKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  return (
    <Shell>
      <Sidebar>
        <Brand>
          <div className="logo">Z-Zone</div>
          <div className="sub">Battery MES</div>
        </Brand>

        {/* ===== 사이드 메뉴 ===== */}
        <Nav>
          {MENU.map((group) => {
            const open = openKeys.includes(group.key);
            return (
              <div key={group.key}>
                <GroupTitle onClick={() => toggleGroup(group.key)}>
                  {group.title}
                  <Arrow $open={open}>▾</Arrow>
                </GroupTitle>

                {open && (
                  <GroupItems>
                    {group.items.map((item) => (
                      <MenuLink key={item.to} to={item.to}>
                        {item.label}
                      </MenuLink>
                    ))}
                  </GroupItems>
                )}
              </div>
            );
          })}
        </Nav>

        <SidebarFooter>
          <small>© {new Date().getFullYear()} MES</small>
        </SidebarFooter>
      </Sidebar>

      {/* =========================
         메인 영역 (탭바 완전 복구)
      ========================= */}
      <Main>
        <TopBar>
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
   styled (탭바 원본 스타일)
========================= */

const Shell = styled.div`
  display: grid;
  grid-template-columns: 260px 1fr;
  min-height: 100vh;
  background: var(--background2);
`;

const Sidebar = styled.aside`
  background: var(--background);
  display: flex;
  flex-direction: column;
`;

const Brand = styled.div`
  padding: 18px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
`;

const Nav = styled.nav`
  padding: 12px;
  flex: 1;
  overflow-y: auto;
`;

const GroupTitle = styled.div`
  margin-top: 12px;
  padding: 8px 10px;
  font-size: 12px;
  font-weight: 600;
  opacity: 0.7;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
`;

const Arrow = styled.span`
  transform: ${({ $open }) => ($open ? "rotate(180deg)" : "rotate(0deg)")};
  transition: 0.2s;
`;

const GroupItems = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 6px;
`;

const MenuLink = styled(NavLink)`
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 13px;

  &:hover {
    background: var(--main2);
  }

  &.active {
    background: rgba(99, 102, 241, 0.25);
    font-weight: 600;
  }
`;

const SidebarFooter = styled.div`
  padding: 12px 16px;
  font-size: 12px;
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
  padding: 18px 22px;
  gap: 10px;
`;

const TopLeft = styled.div`
  display: flex;
  gap: 8px;
  max-width: calc(100vw - 500px);
  overflow-x: auto;
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
`;

const Search = styled.input`
  width: min(320px, 36vw);
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid var(--border);
`;

const Content = styled.section`
  padding: 22px;
`;
