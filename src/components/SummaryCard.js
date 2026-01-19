import styled from "styled-components";

export default function SummaryCard({ icon, label, value, color }) {
  return (
    <Card>
      <IconBox color={color}>{icon}</IconBox>
      <TextBox>
        <span>{label}</span>
        <strong>{value}</strong>
      </TextBox>
    </Card>
  );
}

/* =========================
   styled
========================= */

const Card = styled.div`
  background: white;
  border-radius: 16px;
  padding: 18px;
  display: flex;
  align-items: center;
  gap: 14px;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.04);
`;

const IconBox = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: ${(props) => props.color}22;
  color: ${(props) => props.color};
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 22px;
    height: 22px;
  }
`;

const TextBox = styled.div`
  span {
    font-size: 12px;
    opacity: 0.7;
  }

  strong {
    display: block;
    margin-top: 4px;
    font-size: 20px;
    font-weight: 700;
  }
`;
