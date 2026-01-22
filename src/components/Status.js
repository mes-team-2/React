import React from "react";
import {
  FiAlertTriangle,
  FiRefreshCw,
  FiCheckCircle,
  FiShield,
} from "react-icons/fi";
import styled from "styled-components";
import { LuHourglass } from "react-icons/lu";
import { AiFillSafetyCertificate } from "react-icons/ai";

// 텍스트 색상(color), 배경색(bg), 아이콘(icon), 라벨(label)
const STATUS_CONFIG = {
  WAITING: {
    label: "WAITING",
    iconColor: "var(--waiting)",
    textColor: "var(--font)",
    bg: "var(--bgWaiting)",
    icon: <LuHourglass />,
  },
  FAIL: {
    label: "FAIL",
    iconColor: "var(--error)",
    textColor: "var(--font)",
    icon: <FiAlertTriangle />,
  },
  RUN: {
    label: "RUN",
    iconColor: "var(--run)",
    textColor: "var(--font)",
    bg: "var(--bgRun)",
    icon: <FiRefreshCw />,
  },
  COMPLETE: {
    label: "COMPLETE",
    iconColor: "var(--complete)",
    textColor: "var(--font)",
    bg: "var(--bgComplete)",
    icon: <FiCheckCircle />,
  },
  OK: {
    label: "OK",
    iconColor: "var(--complete)",
    textColor: "var(--font)",
    bg: "var(--bgComplete)",
    icon: <FiCheckCircle />,
  },
  // 예외 처리를 위한 기본값 (정의되지 않은 상태가 들어올 경우)
  DEFAULT: {
    label: "-",
    iconColor: "var(--stop)",
    textColor: "var(--font)",
    bg: "var(--bgStop)",
    icon: null,
  },
  SAFE: {
    //안전
    label: "안전",
    iconColor: "var(--run)",
    textColor: "var(--font)",
    bg: "var(--bgRun)",
    icon: <AiFillSafetyCertificate />,
  },
  CAUTION: {
    //주의
    label: "주의",
    iconColor: "var(--waiting)",
    textColor: "var(--font)",
    bg: "var(--bgWaiting)",
    icon: <FiCheckCircle />,
  },
  DANGER: {
    //경고
    label: "경고",
    iconColor: "var(--error)",
    textColor: "var(--font)",
    bg: "var(--bgError)",
    icon: <FiAlertTriangle />,
  },
};

const Status = ({ status }) => {
  const statusKey = status ? status.toUpperCase() : "DEFAULT";
  const config = STATUS_CONFIG[statusKey] || STATUS_CONFIG.DEFAULT;

  return (
    <BadgeWrapper $bg={config.bg}>
      {config.icon && (
        <IconWrapper $color={config.iconColor}>{config.icon}</IconWrapper>
      )}
      <TextWrapper $color={config.textColor}>{config.label}</TextWrapper>
    </BadgeWrapper>
  );
};

const BadgeWrapper = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: normal;
  min-width: 110px;
  box-shadow: 0 1px 2px 1px rgba(0, 0, 0, 0.05);
  white-space: nowrap;

  background-color: ${(props) => props.$bg};
`;

const IconWrapper = styled.span`
  display: flex;
  align-items: center;
  font-size: 14px;
  color: ${(props) => props.$color};
`;

const TextWrapper = styled.span`
  line-height: 1;
  padding-top: 1px;
  color: ${(props) => props.$color};
`;

export default Status;
