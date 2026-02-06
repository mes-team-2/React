import styled from "styled-components";
import { rgba } from "polished";

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

const Card = styled.div`
  background: white;
  border-radius: 15px;
  padding: 30px 20px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: var(--shadow);
`;

const IconBox = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: color-mix(
    in srgb,
    ${(props) => props.color || "black"},
    transparent 90%
  );
  color: ${(props) => props.color};
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 20px;
    height: 20px;
  }
`;

const TextBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  span {
    font-size: var(--fontSm);
    opacity: 0.7;
  }

  strong {
    display: block;
    font-size: var(--fontXl);
    font-weight: var(--bold);
  }
`;
