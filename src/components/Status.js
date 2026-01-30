import React from "react";
import {
  FiAlertTriangle,
  FiRefreshCw,
  FiCheckCircle, FiXCircle, FiPauseCircle, FiBox, FiActivity
} from "react-icons/fi";
import styled, { css } from "styled-components";
import { LuHourglass } from "react-icons/lu";
import { AiFillSafetyCertificate } from "react-icons/ai";

import {
  IoArrowForwardCircleOutline,
  IoArrowBackCircleOutline,
} from "react-icons/io5";


// 텍스트 색상(color), 배경색(bg), 아이콘(icon), 라벨(label)
const STATUS_CONFIG = {
  // 공통/기본 상태
  WAITING: {
    label: "대기중",
    iconColor: "var(--waiting)",
    textColor: "var(--font)",
    bg: "var(--bgWaiting)",
    icon: <LuHourglass />,
  },
  FAIL: {
    label: "실패",
    iconColor: "var(--error)",
    textColor: "var(--font)",
    bg: "var(--bgError)",
    icon: <FiAlertTriangle />,
  },
  RUN: {
    label: "실행중",
    iconColor: "var(--run)",
    textColor: "var(--font)",
    bg: "var(--bgRun)",
    icon: <FiRefreshCw />,
  },
  COMPLETE: {
    label: "완료",
    iconColor: "var(--complete)",
    textColor: "var(--font)",
    bg: "var(--bgComplete)",
    icon: <FiCheckCircle />,
  },
  OK: {
    label: "정상",
    iconColor: "var(--complete)",
    textColor: "var(--font)",
    bg: "var(--bgComplete)",
    icon: <FiCheckCircle />,
  },
  // 생산 관리 (ProductLot 등)
  RUNNING: {
    label: "생산중(투입)",
    iconColor: "var(--run)",
    textColor: "var(--font)",
    bg: "var(--bgRun)",
    icon: <FiRefreshCw />,
  },
  COMPLETED: {
    label: "생산완료",
    iconColor: "var(--complete)",
    textColor: "var(--font)",
    bg: "var(--bgComplete)",
    icon: <FiCheckCircle />,
  },
  DEFECTIVE: {
    label: "불량 발생",
    iconColor: "var(--error)",
    textColor: "var(--font)",
    bg: "var(--bgError)",
    icon: <FiAlertTriangle />,
  },
  HOLD: {
    label: "보류(Hold)",
    iconColor: "var(--waiting)",
    textColor: "var(--font)",
    bg: "var(--bgWaiting)",
    icon: <FiPauseCircle />,
  },
  // 자재/재고 관리 (MaterialLot 등)
  EXHAUSTED: {
    label: "소진완료",
    iconColor: "var(--stop)",
    textColor: "var(--font)",
    bg: "var(--bgStop)",
    icon: <FiXCircle />,
  },
  MATIN: {
    label: "자재입고",
    iconColor: "var(--run)",
    textColor: "var(--font)",
    bg: "var(--bgRun)",
    icon: <FiBox />,
  },
  MATOUT: {
    label: "생산투입",
    iconColor: "var(--error)",
    textColor: "var(--font)",
    bg: "var(--bgError)",
    icon: <FiActivity />,
  },
  // 입출고/물류 관리
  IN: {
    label: "생산입고",
    iconColor: "var(--run)",
    textColor: "var(--font)",
    bg: "var(--bgRun)",
    icon: <FiBox />,
  },
  OUT: {
    label: "출고",
    iconColor: "var(--error)",
    textColor: "var(--font)",
    bg: "var(--bgError)",
    icon: <IoArrowForwardCircleOutline />,
  },
  FAILOUT: {
    label: "폐기",
    iconColor: "var(--waiting)",
    textColor: "var(--font)",
    bg: "var(--bgWaiting)",
    icon: <FiXCircle />,
  },
  // 안전 재고 상태
  SAFE: {
    label: "안전",
    iconColor: "var(--run)",
    textColor: "var(--font)",
    bg: "var(--bgRun)",
    icon: <AiFillSafetyCertificate />,
  },
  CAUTION: {
    label: "주의",
    iconColor: "var(--waiting)",
    textColor: "var(--font)",
    bg: "var(--bgWaiting)",
    icon: <FiCheckCircle />,
  },
  DANGER: {
    label: "경고",
    iconColor: "var(--error)",
    textColor: "var(--font)",
    bg: "var(--bgError)",
    icon: <FiAlertTriangle />,
  },
  // 구버전 호환 (Legacy)
  LOT_WAIT: {
    label: "대기중",
    iconColor: "var(--waiting)",
    textColor: "var(--font)",
    bg: "var(--bgWaiting)",
    icon: <LuHourglass />,
  },
  LOT_RUN: {
    label: "생산중(투입)",
    iconColor: "var(--run)",
    textColor: "var(--font)",
    bg: "var(--bgRun)",
    icon: <FiRefreshCw />,
  },
  LOT_ERR: {
    label: "품질/불량",
    iconColor: "var(--error)",
    textColor: "var(--font)",
    bg: "var(--bgError)",
    icon: <FiAlertTriangle />,
  },
  LOT_OK: {
    label: "생산완료",
    iconColor: "var(--complete)",
    textColor: "var(--font)",
    bg: "var(--bgComplete)",
    icon: <FiCheckCircle />,
  },
  // 예외 처리 (Default)
  DEFAULT: {
    label: "-",
    iconColor: "var(--stop)",
    textColor: "var(--font)",
    bg: "var(--bgStop)",
    icon: null,
  },
};

/**
 * @param {string} status - 상태 값 
 * @param {string} type - 'basic'(기본 캡슐형) / 'wide'(넓은 박스형)
 */

const Status = ({ status, type = "basic" }) => {
  const statusKey = status ? status.toUpperCase() : "DEFAULT";
  const config = STATUS_CONFIG[statusKey] || STATUS_CONFIG.DEFAULT;

  return (
    <BadgeWrapper $bg={config.bg} $type={type}>
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
  padding: 10px;
  font-size: var(--fontXs);
  font-weight: var(--medium);
  white-space: nowrap;
  background-color: ${(props) => props.$bg};
  box-sizing: border-box;

  ${(props) =>
    props.$type === "wide"
      ? css`
          width: 100%; 
          height: 38px;
          border-radius: 10px;
          border: 1px solid var(--border);
          justify-content: flex-start;
        `
      : css`
          min-width: 110px;
          height: 20px;
          padding: 6px 10px;
          border-radius: 9999px;
          box-shadow: 0 1px 2px 1px rgba(0, 0, 0, 0.05);
        `}
`;

const IconWrapper = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--fontSm);
  color: ${(props) => props.$color};
`;

const TextWrapper = styled.span`
  line-height: 1;
  color: ${(props) => props.$color};
`;

export default Status;
