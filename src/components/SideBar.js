import { NavLink, Outlet } from "react-router-dom";
import styled from "styled-components";

export default function SideBar() {
  return (
    <Shell>
      <Sidebar>
        <Brand>
          <div className="logo">MES</div>
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
          <MenuLink to="/mes/BOM">BOM</MenuLink>
          <MenuLink to="/mes/machine">설비</MenuLink>
          <MenuLink to="/mes/inventory">재고</MenuLink>
        </Nav>

        <SidebarFooter>
          <small>© {new Date().getFullYear()} MES</small>
        </SidebarFooter>
      </Sidebar>

      <Main>
        <TopBar>
          <h1>MES</h1>
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
  color: var(--font);
  display: flex;
  flex-direction: column;
  border-right: 1px solid rgba(255, 255, 255, 0.06);
`;

const Brand = styled.div`
  padding: 18px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);

  .logo {
    font-weight: 800;
    letter-spacing: 1px;
    font-size: 18px;
  }
  .sub {
    margin-top: 2px;
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
  letter-spacing: 0.6px;
`;

const Divider = styled.div`
  height: 1px;
  margin: 10px 8px;
  background: rgba(255, 255, 255, 0.08);
`;

const MenuLink = styled(NavLink)`
  color: var(--font);
  text-decoration: none;
  padding: 10px 10px;
  border-radius: 10px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 10px;

  &:hover {
    background: var(--main2);
  }

  &.active {
    background: rgba(99, 102, 241, 0.25);
    outline: 1px solid rgba(99, 102, 241, 0.35);
  }
`;

const SidebarFooter = styled.div`
  padding: 12px 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
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
  align-items: center;
  justify-content: space-between;
  padding: 18px 22px;

  h1 {
    margin: 0;
    font-size: 18px;
    letter-spacing: 0.2px;
    color: var(--font);
  }

  .right {
    display: flex;
    gap: 10px;
    align-items: center;
  }
`;

const Search = styled.input`
  width: min(480px, 48vw);
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid var(--border);
  outline: none;

  &:focus {
    border-color: var(--main);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
  }
`;

const Content = styled.section`
  padding: 22px;
  min-width: 0;
`;
