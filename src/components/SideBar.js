import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import styled from "styled-components";
import logo from "../images/logo.png";

const IconHome = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
);
const IconStar = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
  </svg>
);
const IconChevronLeft = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <polyline points="15 18 9 12 15 6"></polyline>
  </svg>
);
const IconChevronRight = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);
const IconSearch = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#999"
    strokeWidth="2"
  >
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);
const IconUser = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);
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
  "/mes/quality/test-log": "검사 이력",
  "/mes/quality/defect": "불량 관리",

  // 자재
  "/mes/material": "자재 관리",
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
      { to: "/mes/quality/test-log", label: "검사 이력" },
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
  {
    key: "barcode",
    title: "바코드",
    items: [{ to: "barcode", label: "바코드" }],
  },
];

export default function SideBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const tabsRef = useRef(null);

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
     대분류/중분류 열림 상태
  ========================= */
  const [openKeys, setOpenKeys] = useState([]);

  // 현재 경로에 해당하는 대분류 자동 오픈
  useEffect(() => {
    const currentGroup = MENU.find((group) => {
      if (group.items?.some((it) => location.pathname.startsWith(it.to)))
        return true;
      if (
        group.groups?.some((g) =>
          g.items.some((it) => location.pathname.startsWith(it.to)),
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
      mg.items.some((it) => location.pathname.startsWith(it.to)),
    );
    if (mid && !openKeys.includes(mid.key)) {
      setOpenKeys((prev) => [...prev, mid.key]);
    }
  }, [location.pathname]);

  const toggleKey = (key) => {
    setOpenKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  /* =========================
      탭 스크롤 핸들러 (좌우 이동)
  ========================= */
  const scrollTabs = (direction) => {
    if (tabsRef.current) {
      const scrollAmount = 200; // 스크롤 이동 거리
      tabsRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <Shell>
      <Sidebar>
        <Brand>
          <Logo src={logo} alt="logo" onClick={() => navigate("/")} />
        </Brand>

        {/* ===== 사이드 메뉴 ===== */}
        <ScrollContainer>
          <Nav>
            {MENU.map((group) => {
              const open = openKeys.includes(group.key);
              return (
                <NavGroup key={group.key} $isOpen={open}>
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
                </NavGroup>
              );
            })}
          </Nav>
          <UserProfile>
            <UserAvatar>
              <IconUser />
            </UserAvatar>
            <UserInfo>
              <UserName>Kim Harin</UserName>
              <UserId>Z20180355</UserId>
            </UserInfo>
          </UserProfile>
        </ScrollContainer>
      </Sidebar>

      <Main>
        <TopBar>
          <TopBarLeft>
            <PaddedIconBtn>
              <IconStar />
            </PaddedIconBtn>
            <Divider />
            <PaddedIconBtn onClick={() => navigate("/")}>
              <IconHome />
            </PaddedIconBtn>
            <Divider />
            <BorderedChevronBtn onClick={() => scrollTabs("left")}>
              <IconChevronLeft />
            </BorderedChevronBtn>

            <TabsContainer ref={tabsRef}>
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
            </TabsContainer>

            <IconBtn onClick={() => scrollTabs("right")}>
              <IconChevronRight />
            </IconBtn>
          </TopBarLeft>

          <TopBarRight>
            <SearchWrapper>
              <SearchIcon>
                <IconSearch />
              </SearchIcon>
              <SearchInput placeholder="Search" />
            </SearchWrapper>
          </TopBarRight>
        </TopBar>

        <Content>
          <Outlet />
        </Content>
      </Main>
    </Shell>
  );
}

const Shell = styled.div`
  display: grid;
  grid-template-columns: 200px 1fr;
  min-height: 100vh;
  background: var(--background2);
`;

const Sidebar = styled.aside`
  background: var(--background);
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--border);
`;

const Logo = styled.img`
  width: 100%;
  min-width: 100px;
  height: 100%;
  cursor: pointer;
  object-fit: cover;
  box-sizing: border-box;
  padding: 10px 60px;
`;

const Brand = styled.div`
  box-sizing: border-box;
  flex: 0 0 auto;
`;

const ScrollContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #ddd;
    border-radius: 4px;
  }
`;

const Nav = styled.nav`
  padding: 10px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const NavGroup = styled.div`
  padding: 0;
  border-bottom: ${({ $isOpen }) =>
    $isOpen ? "1px solid var(--border)" : "none"};

  &:last-child {
    border-bottom: none;
  }
`;

const GroupTitle = styled.div`
  padding: 5px 10px;
  font-size: var(--fontMd);
  font-weight: var(--bold);
  color: var(--font);
  letter-spacing: -0.5px;
  cursor: pointer;

  display: flex;
  align-items: center;
  justify-content: space-between;

  border: none;

  &:hover {
    background-color: rgb(from var(--main2) r g b / 0.3);
    border-radius: 15px;
  }
`;

const Arrow = styled.span`
  font-size: var(--fontLg);
  color: var(--font);
  transform: ${({ $open }) => ($open ? "rotate(180deg)" : "rotate(0deg)")};
  transition: transform 0.2s ease;
`;

const GroupBody = styled.div`
  padding: 10px 0 5px 5px;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const GroupItems = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const MidWrap = styled.div`
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const MidTitle = styled.div`
  padding: 10px;
  font-size: var(--fontSm);
  font-weight: var(--bold);
  color: var(--font);
  letter-spacing: -0.5px;
  cursor: pointer;

  display: flex;
  align-items: center;
  justify-content: space-between;

  border: none;

  &:hover {
    background-color: rgb(from var(--main2) r g b / 0.3);
    border-radius: 15px;
  }
`;

const MidItems = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding-left: 5px;
`;

const MenuLink = styled(NavLink)`
  padding: 5px 10px;
  border-radius: 8px;
  font-size: var(--fontSm);

  &:hover {
    background-color: rgb(from var(--main2) r g b / 0.3);
    border-radius: 15px;
  }

  &.active {
    background-color: rgb(from var(--main2) r g b / 0.3);
    border-radius: 15px;
  }
`;

const UserProfile = styled.div`
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--background2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--font2);
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const UserName = styled.span`
  font-size: 15px;
  font-weight: 600;
  color: var(--font);
`;

const UserId = styled.span`
  font-size: 12px;
  color: var(--font2);
`;

const Main = styled.main`
  display: flex;
  flex-direction: column;
  min-width: 0;
`;
const TopBar = styled.header`
  position: sticky;
  top: 0;
  z-index: 10;
  height: 40px;
  background: var(--background);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0;
`;

const TopBarLeft = styled.div`
  display: flex;
  align-items: center;
  height: 100%;
  overflow: hidden;
`;

const IconBtn = styled.button`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--font);

  &:hover {
    background: var(--background2);
  }
`;

const PaddedIconBtn = styled(IconBtn)`
  width: auto;
  padding: 0 10px;
`;

const BorderedChevronBtn = styled(IconBtn)`
  border-right: 1px solid var(--border);
  width: 40px;
  height: 40px;
`;

const Divider = styled.div`
  width: 1px;
  height: 16px;
  background: var(--font2);
  margin: 0 4px;
`;

const TabsContainer = styled.div`
  display: flex;
  align-items: center;
  height: 100%;
  margin-left: 8px;
  overflow-x: auto;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const Tab = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  width: 150px;
  min-width: 150px;
  padding: 0 16px;
  font-size: 14px;
  color: var(--font);
  font-weight: ${({ $active }) => ($active ? "var(--bold)" : "var(--normal)")};
  cursor: pointer;
  position: relative;
  white-space: nowrap;

  border-right: 1px solid var(--border);

  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background: ${({ $active }) => ($active ? "var(--main)" : "transparent")};
  }

  &:hover {
    background-color: rgb(from var(--background2) r g b / 0.3);
  }

  button {
    margin-left: 8px;
    font-size: 14px;
    color: var(--font2);
    display: flex;
    align-items: center;
    &:hover {
      color: var(--font);
    }
  }
`;

const TopBarRight = styled.div`
  display: flex;
  align-items: center;
  padding: 0 10px;
`;

const SearchWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const SearchInput = styled.input`
  width: 250px;
  height: 30px;
  padding: 0 16px 0 40px;
  border-radius: 30px;
  border: 1px solid transparent;
  background: var(--background2);
  font-size: var(--fontSm);

  &:focus {
    background: white;
    border-color: var(--main);
    box-shadow: 0 0 0 2px rgba(0, 77, 252, 0.1);
  }

  &::placeholder {
    color: var(--font2);
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  pointer-events: none;
  color: var(--font2);
`;

const Content = styled.section`
  padding: 24px;
`;
