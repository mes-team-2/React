import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import styled from "styled-components";
import logo from "../images/logo.png";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
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
const IconStar = ({ filled = false, color = "currentColor" }) => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <polygon
      points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
      fill={filled ? color : "none"}
      stroke={filled ? color : "var(--font2)"}
      strokeWidth="2"
    />
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
  "/mes/process-monitoring": "공정 모니터링",

  // 기준 정보
  "/mes/master/machine": "설비 관리",
  "/mes/master/process": "공정 관리",
  "/mes/master/bom": "BOM 관리",
  "/mes/master/worker": "작업자 관리",
  "/mes/master/product": "제품 관리",
  "/mes/master/material": "자재 관리",

  // 생산
  "/mes/workorders": "작업지시 관리",
  "/mes/process-log": "공정 이력",
  "/mes/product-lot": "제품 LOT 관리",

  // 품질
  "/mes/quality/test-log": "검사 이력",
  "/mes/quality/defect": "불량 이력",

  // 자재
  "/mes/inventory/material-list": "자재 재고 조회",
  "/mes/inventory/material-tx": "자재 이력 조회",

  // 제품
  "/mes/inventory/product": "제품 관리",
  "/mes/inventory/fg-inventory": "제품 재고 관리",
  "/mes/inventory/shipment": "제품 출하 관리",
  "/mes/inventory/material-lot": "자재 LOT 관리",

  // 리포트
  "/mes/report/product-report": "생산 리포트",
  "/mes/report/trace": "Traceability 조회",
};

const RECENT_PAGES_KEY = "mes_recent_pages";

/* =========================
   사이드바 메뉴 구조
========================= */
const MENU = [
  {
    key: "monitoring",
    title: "모니터링",
    items: [
      { to: "/mes/dashboard", label: "대시보드" },
      { to: "/mes/process-monitoring", label: "공정 모니터링" },
    ],
  },
  {
    key: "master",
    title: "기준 정보 관리",
    items: [
      { to: "/mes/master/machine", label: "설비 관리" },
      { to: "/mes/master/process", label: "공정 관리" },
      { to: "/mes/master/product", label: "제품 관리" },
      { to: "/mes/master/material", label: "자재 관리" },
      { to: "/mes/master/bom", label: "BOM 관리" },
      { to: "/mes/master/worker", label: "작업자 관리" },
    ],
  },
  {
    key: "production",
    title: "생산 관리",
    items: [
      { to: "/mes/workorders", label: "작업지시 관리" },
      { to: "/mes/process-log", label: "공정 이력" },

      { to: "/mes/product-lot", label: "제품 LOT 관리" },
    ],
  },
  {
    key: "quality",
    title: "품질 관리",
    items: [
      { to: "/mes/quality/test-log", label: "검사 이력" },
      { to: "/mes/quality/defect", label: "불량 이력" },
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
          { to: "/mes/inventory/material-lot", label: "자재 LOT 관리" },
          { to: "/mes/inventory/material-list", label: "자재 재고 조회" },
          { to: "/mes/inventory/material-tx", label: "자재 입출고 이력 조회" },
        ],
      },
      {
        key: "product",
        title: "제품 관리",
        items: [
          { to: "/mes/inventory/fg-inventory", label: "제품 재고 조회" },
          { to: "/mes/inventory/shipment", label: "제품 입출고 이력 조회" },
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
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const dragMovedRef = useRef(false);
  const dragPinIndexRef = useRef(null);

  const [userInfo, setUserInfo] = useState({
    name: "Guest",
    code: "",
  });

  const location = useLocation();
  const navigate = useNavigate();
  const tabsRef = useRef(null);
  const { logout } = useContext(AuthContext);

  const [draggingPinIndex, setDraggingPinIndex] = useState(null);
  const [dragOverPinIndex, setDragOverPinIndex] = useState(null);

  const [recentPages, setRecentPages] = useState(() => {
    const saved = localStorage.getItem(RECENT_PAGES_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const PIN_KEY = "mes_pinned_tabs";

  const [pinnedTabs, setPinnedTabs] = useState(() => {
    const saved = localStorage.getItem(PIN_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const currentPath = location.pathname;
  const currentLabel = PAGE_LABEL[currentPath];
  const isPinned = pinnedTabs.some((p) => p.path === currentPath);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    const path = location.pathname;
    const label = PAGE_LABEL[path];
    if (!label) return;

    setRecentPages((prev) => {
      if (prev.some((p) => p.path === path)) return prev;
      const next = [...prev, { path, label }];
      localStorage.setItem(RECENT_PAGES_KEY, JSON.stringify(next));
      return next;
    });
  }, [location.pathname]);

  useEffect(() => {
    const name = localStorage.getItem("workerName");
    const code = localStorage.getItem("workerCode");

    if (name && code) {
      setUserInfo({ name, code });
    }
  }, []);

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
      localStorage.setItem(RECENT_PAGES_KEY, JSON.stringify(next));
      return next;
    });
  };

  /* =========================
     대분류/중분류 열림 상태
  ========================= */

  const SIDEBAR_OPEN_KEY = "mes_sidebar_open_keys";
  const [openKeys, setOpenKeys] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_OPEN_KEY);
    return saved ? JSON.parse(saved) : [];
  });

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

  const onMouseDownTabs = (e) => {
    if (!tabsRef.current) return;
    isDraggingRef.current = true;
    dragMovedRef.current = false;
    startXRef.current = e.pageX;
    scrollLeftRef.current = tabsRef.current.scrollLeft;
  };

  const onMouseMoveTabs = (e) => {
    if (!isDraggingRef.current || !tabsRef.current) return;
    const x = e.pageX;
    const walk = x - startXRef.current;

    if (Math.abs(walk) > 5) {
      dragMovedRef.current = true; // ⭐ 드래그 판정
    }

    tabsRef.current.scrollLeft = scrollLeftRef.current - walk;
  };

  const stopDragTabs = () => {
    isDraggingRef.current = false;

    // 다음 클릭부터는 정상 클릭 허용
    setTimeout(() => {
      dragMovedRef.current = false;
    }, 0);
  };

  const visibleTabs = [
    ...pinnedTabs,
    ...recentPages.filter((r) => !pinnedTabs.some((p) => p.path === r.path)),
  ];

  const toggleCurrentPin = () => {
    if (!currentLabel) return; // 라벨 없는 페이지는 제외

    setPinnedTabs((prev) => {
      const exists = prev.some((p) => p.path === currentPath);

      const next = exists
        ? prev.filter((p) => p.path !== currentPath)
        : [...prev, { path: currentPath, label: currentLabel }];

      localStorage.setItem(PIN_KEY, JSON.stringify(next));
      return next;
    });
  };

  const onPinDragStart = (index) => {
    dragPinIndexRef.current = index;
  };

  const onPinDrop = (targetIndex) => {
    const from = dragPinIndexRef.current;
    if (from === null || from === targetIndex) return;

    setPinnedTabs((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(targetIndex, 0, moved);

      localStorage.setItem(PIN_KEY, JSON.stringify(next));
      return next;
    });

    dragPinIndexRef.current = null;
  };

  const unpinTab = (path) => {
    setPinnedTabs((prev) => {
      const next = prev.filter((t) => t.path !== path);
      localStorage.setItem(PIN_KEY, JSON.stringify(next));
      return next;
    });
  };

  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;

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

    if (currentGroup) {
      setOpenKeys((prev) =>
        prev.includes(currentGroup.key) ? prev : [...prev, currentGroup.key],
      );
    }

    initializedRef.current = true;
  }, [location.pathname]);

  useEffect(() => {
    localStorage.setItem(SIDEBAR_OPEN_KEY, JSON.stringify(openKeys));
  }, [openKeys]);

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
                              <MenuLink
                                key={item.to}
                                to={item.to}
                                onClick={(e) => {
                                  if (location.pathname === item.to) {
                                    e.preventDefault();
                                    navigate(0); // 현재 페이지 강제 새로고침
                                  }
                                }}
                              >
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
              <UserName>{userInfo.name}</UserName>
              <UserId>{userInfo.code}</UserId>
            </UserInfo>
          </UserProfile>
        </ScrollContainer>
        <LogoutArea>
          <LogoutButton onClick={handleLogout}>로그아웃</LogoutButton>
        </LogoutArea>
      </Sidebar>

      <Main>
        <TopBar>
          <TopBarLeft>
            <PaddedIconBtn onClick={toggleCurrentPin}>
              <IconStar filled={isPinned} color="#efc364" />
            </PaddedIconBtn>

            <Divider />
            <PaddedIconBtn onClick={() => navigate("/")}>
              <IconHome />
            </PaddedIconBtn>
            <Divider />
            <BorderedChevronBtn onClick={() => scrollTabs("left")}>
              <IconChevronLeft />
            </BorderedChevronBtn>

            {/* ⭐ 고정 탭 영역 */}
            <PinnedTabs>
              {pinnedTabs.map((p, idx) => {
                const active = currentPath === p.path;

                return (
                  <Tab
                    key={`pin-${p.path}`}
                    $active={active}
                    draggable
                    className={
                      draggingPinIndex === idx
                        ? "dragging"
                        : dragOverPinIndex === idx
                          ? "drag-over"
                          : ""
                    }
                    onDragStart={() => {
                      setDraggingPinIndex(idx);
                      onPinDragStart(idx);
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      if (idx !== draggingPinIndex) {
                        setDragOverPinIndex(idx);
                      }
                    }}
                    onDragLeave={() => setDragOverPinIndex(null)}
                    onDrop={() => {
                      onPinDrop(idx);
                      setDragOverPinIndex(null);
                      setDraggingPinIndex(null);
                    }}
                    onDragEnd={() => {
                      setDraggingPinIndex(null);
                      setDragOverPinIndex(null);
                    }}
                    onClick={() => {
                      if (dragMovedRef.current) return;
                      navigate(p.path);
                    }}
                  >
                    <span>{p.label}</span>
                    <PinnedStar
                      onClick={(e) => {
                        e.stopPropagation();
                        unpinTab(p.path);
                      }}
                    >
                      <IconStar />
                    </PinnedStar>
                  </Tab>
                );
              })}
            </PinnedTabs>

            {/* ▶ 스크롤 탭 영역 */}
            <TabsContainer
              ref={tabsRef}
              onMouseDown={onMouseDownTabs}
              onMouseMove={onMouseMoveTabs}
              onMouseUp={stopDragTabs}
              onMouseLeave={stopDragTabs}
            >
              {recentPages
                .filter((r) => !pinnedTabs.some((p) => p.path === r.path))
                .map((p) => {
                  const active = currentPath === p.path;

                  return (
                    <Tab
                      key={`tab-${p.path}`}
                      $active={active}
                      onClick={() => {
                        if (dragMovedRef.current) return;
                        navigate(p.path);
                      }}
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
    background-color: var(--background2);
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
  height: 100%;
  overflow-x: auto;
  cursor: grab;
  user-select: none;

  &:active {
    cursor: grabbing;
  }

  &::-webkit-scrollbar {
    display: none;
  }
`;

const Tab = styled.div`
  min-width: 150px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-right: 1px solid var(--border);
  cursor: pointer;
  user-select: none;
  position: relative; /* ⭐ underline 기준 */
  transition:
    opacity 0.15s ease,
    box-shadow 0.15s ease;

  /* =========================
     ✅ 기존 활성 탭 스타일 (복구)
  ========================= */
  &::after {
    content: "";
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 3px;
    background: var(--main); /* 파란 포인트 */
    opacity: ${({ $active }) => ($active ? 1 : 0)};
    transition: opacity 0.15s ease;
  }

  font-weight: ${({ $active }) => ($active ? "600" : "400")};

  /* =========================
     드래그 중 피드백 (덮지 않음)
  ========================= */
  &.dragging {
    opacity: ${({ $active }) => ($active ? 0.9 : 0.6)};
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
    cursor: grabbing;
  }

  /* =========================
     드롭 위치 인디케이터
  ========================= */
  &.drag-over::before {
    content: "";
    position: absolute;
    left: 0;
    top: 15%;
    height: 70%;
    width: 3px;
    background: var(--main);
    border-radius: 2px;
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
  padding: 25px;
  background-color: var(--background);
  height: 100%;
`;
const LogoutArea = styled.div`
  padding: 16px;
  border-top: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LogoutButton = styled.button`
  width: 80%;
  height: 25px;
  padding: 0;
  border-radius: 999px;
  border: none;
  background: var(--main);
  color: var(--font3);
  font-size: var(--fontXs);
  font-weight: var(--medium);
  cursor: pointer;

  &:hover {
    background: #003ad6;
  }
`;

const PinnedTabs = styled.div`
  display: flex;
  height: 100%;
  border-right: 1px solid var(--border);
  user-select: none;
`;

const PinnedStar = styled.button`
  display: flex;
  align-items: center;
  margin-right: 6px;
  padding: 0;
  background: transparent;
  border: 0;
  cursor: pointer;
  color: var(--main);

  svg {
    width: 16px;
    height: 16px;
  }

  svg polygon,
  svg path {
    fill: #efc364;
    stroke: none;
  }
`;
