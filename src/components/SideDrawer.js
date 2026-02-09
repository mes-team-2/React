import styled from "styled-components";

export default function SideDrawer({
  open,
  onClose,
  width = 760, // ⭐ 기본값
  children,
}) {
  if (!open) return null;

  return (
    <Overlay onMouseDown={onClose}>
      <Drawer width={width} onMouseDown={(e) => e.stopPropagation()}>
        <Close onMouseDown={onClose}>✕</Close>
        {children}
      </Drawer>
    </Overlay>
  );
}

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 1000;
`;

const Drawer = styled.div`
  position: absolute;
  right: 0;
  top: 0;
  width: ${(p) => p.width}px;
  height: 100%;
  background: var(--background);
  padding: 20px;
  overflow-y: auto;
`;

const Close = styled.button`
  position: absolute;
  top: 14px;
  right: 14px;
  border: none;
  background: none;
  font-size: var(--fontXl);
`;
