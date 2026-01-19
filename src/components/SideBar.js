import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import styled from "styled-components";

/* =========================
   최근 페이지 라벨
========================= */
const PAGE_LABEL = {
  "/mes/dashboard": "대시보드",

  // 기준 정보
  "/mes/master/machine": "설비 관리",
  "/mes/master/process": "공정 관리",
  "/mes/master/bom": "BOM 관리",
  "/mes/master/worker": "작업자 관리",

  // 생산
  "/mes/workorders": "작업지시 관리",
  "/mes/process-log": "공정 로그",
  "/mes/lot": "LOT 관리",

  // 품질
  "/mes/quality/test": "검사 이력",
  "/mes/quality/defect": "불량 관리",

  // 자재
  "/mes/material": "자재 관리",
  "/mes/material-stock": "자재 재고 관리",
  "/mes/material-tx": "자재 이력 조회",

  // 제품
  "/mes/product": "제품 관리",
  "/mes/inventory": "제품 재고 관리",
  "/mes/shipment": "제품 출하 관리",

  // 리포트
  "/mes/report/product-report": "생산 리포트",
  "/mes/report/trace": "Traceability 조회",
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
      { to: "/mes/master/machine", label: "설비 관리" },
      { to: "/mes/master/process", label: "공정 관리" },
      { to: "/mes/master/bom", label: "BOM 관리" },
      { to: "/mes/master/worker", label: "작업자 관리" },
    ],
  },
  {
    key: "production",
    title: "생산 관리",
    items: [
      { to: "/mes/workorders", label: "작업지시 관리" },
      { to: "/mes/process-log", label: "공정 로그" },
      { to: "/mes/lot", label: "LOT 관리" },
    ],
  },
  {
    key: "quality",
    title: "품질 관리",
    items: [
      { to: "/mes/quality/test", label: "검사 이력" },
      { to: "/mes/quality/defect", label: "불량 관리" },
    ],
  },
  {
    key: "inventory",
    title: "자재/제품 관리",
    groups: [
      {
        key: "material",
        title: "자재 관리",
        items: [
          { to: "/mes/material", label: "자재 관리" },
          { to: "/mes/material-stock", label: "자재 재고 관리" },
          { to: "/mes/material-tx", label: "자재 이력 조회" },
        ],
      },
      {
        key: "product",
        title: "제품 관리",
        items: [
          { to: "/mes/product", label: "제품 관리" },
          { to: "/mes/inventory", label: "제품 재고 관리" },
          { to: "/mes/shipment", label: "제품 출하 관리" },
        ],
      },
    ],
  },
  {
    key: "report",
    title: "리포트 / 조회",
    items: [
      { to: "/mes/report/product-report", label: "생산 리포트" },
      { to: "/mes/report/trace", label: "Traceability 조회" },
    ],
  },
  {
    key: "test",
    title: "test",
    items: [{ to: "/mes/test", label: "test" }],
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
     🔹 대분류/중분류 열림 상태
  ========================= */
  const [openKeys, setOpenKeys] = useState([]);

  // 현재 경로에 해당하는 대분류 자동 오픈
  useEffect(() => {
    const currentGroup = MENU.find((group) => {
      if (group.items?.some((it) => location.pathname.startsWith(it.to)))
        return true;
      if (
        group.groups?.some((g) =>
          g.items.some((it) => location.pathname.startsWith(it.to))
        )
      )
        return true;
      return false;
    });

    if (currentGroup && !openKeys.includes(currentGroup.key)) {
      setOpenKeys((prev) => [...prev, currentGroup.key]);
    }
  }, [location.pathname]);

  // inventory 안의 중분류 자동 오픈 (material/product)
  useEffect(() => {
    const inv = MENU.find((g) => g.key === "inventory");
    if (!inv?.groups) return;

    const mid = inv.groups.find((mg) =>
      mg.items.some((it) => location.pathname.startsWith(it.to))
    );
    if (mid && !openKeys.includes(mid.key)) {
      setOpenKeys((prev) => [...prev, mid.key]);
    }
  }, [location.pathname]);

  const toggleKey = (key) => {
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
                <GroupTitle onClick={() => toggleKey(group.key)}>
                  {group.title}
                  <Arrow $open={open}>▾</Arrow>
                </GroupTitle>

                {open && (
                  <GroupBody>
                    {/* 2단: 일반 메뉴 */}
                    {group.items && (
                      <GroupItems>
                        {group.items.map((item) => (
                          <MenuLink key={item.to} to={item.to}>
                            {item.label}
                          </MenuLink>
                        ))}
                      </GroupItems>
                    )}

                    {/* 3단: 중분류 + 소분류 */}
                    {group.groups &&
                      group.groups.map((mid) => {
                        const midOpen = openKeys.includes(mid.key);
                        return (
                          <MidWrap key={mid.key}>
                            <MidTitle onClick={() => toggleKey(mid.key)}>
                              {mid.title}
                              <Arrow $open={midOpen}>▾</Arrow>
                            </MidTitle>

                            {midOpen && (
                              <MidItems>
                                {mid.items.map((item) => (
                                  <MenuLink key={item.to} to={item.to}>
                                    {item.label}
                                  </MenuLink>
                                ))}
                              </MidItems>
                            )}
                          </MidWrap>
                        );
                      })}
                  </GroupBody>
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
         메인 영역 (탭바 완전 유지)
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
   styled (원래 테마 변수 기반 유지)
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
  margin-top: 16px;
  padding: 10px 12px;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: -0.2px;
  opacity: 0.9;
  cursor: pointer;

  display: flex;
  align-items: center;
  justify-content: space-between;

  /* 원래 톤 유지하면서 강조 */
  background: rgba(99, 102, 241, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;

  &:hover {
    background: rgba(99, 102, 241, 0.14);
  }
`;

const Arrow = styled.span`
  font-size: 11px;
  opacity: 0.7;
  transform: ${({ $open }) => ($open ? "rotate(180deg)" : "rotate(0deg)")};
  transition: transform 0.2s ease;
`;

const GroupBody = styled.div`
  margin-top: 8px;
`;

const GroupItems = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 10px;
`;

const MidWrap = styled.div`
  margin-top: 10px;
`;

const MidTitle = styled.div`
  padding: 8px 10px;
  font-size: 12px;
  font-weight: 700;
  opacity: 0.85;
  cursor: pointer;

  display: flex;
  align-items: center;
  justify-content: space-between;

  border-radius: 8px;
  background: rgba(255, 255, 255, 0.04);

  &:hover {
    background: rgba(255, 255, 255, 0.07);
  }
`;

const MidItems = styled.div`
  margin-top: 6px;
  margin-left: 8px;
  padding-left: 10px;
  border-left: 2px solid rgba(99, 102, 241, 0.25);

  display: flex;
  flex-direction: column;
  gap: 4px;
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
    font-weight: 700;
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
