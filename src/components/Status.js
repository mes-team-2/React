import React from "react";
import {
  FiAlertTriangle,
  FiRefreshCw,
  FiCheckCircle,
  FiXCircle,
  FiPauseCircle,
  FiBox,
  FiActivity,
  FiPower,
  FiUserCheck,
  FiUserX,
  FiCircle,
} from "react-icons/fi";
import { FaRegPauseCircle } from "react-icons/fa";
import { IoPauseCircleOutline } from "react-icons/io5";
import { AiOutlinePauseCircle } from "react-icons/ai";
import { AlertTriangle, PlayCircle, PauseCircle, Power } from "lucide-react";
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
  ACTIVE: {
    label: "사용중",
    iconColor: "var(--complete)",
    textColor: "var(--font)",
    bg: "var(--bgComplete)",
    icon: <FiCheckCircle />,
  },
  INACTIVE: {
    label: "중지",
    iconColor: "var(--stop)",
    textColor: "var(--font)",
    bg: "var(--bgStop)",
    icon: <FiXCircle />,
  },
  OK: {
    label: "정상",
    iconColor: "var(--complete)",
    textColor: "var(--font)",
    bg: "var(--bgComplete)",
    icon: <FiCheckCircle />,
  },
  ON: {
    label: "출근",
    iconColor: "var(--run)", // 녹색/파란색 계열
    textColor: "var(--font)",
    bg: "var(--bgRun)",
    icon: <FiUserCheck />,
  },
  OFF: {
    label: "퇴근",
    iconColor: "var(--stop)", // 회색 계열
    textColor: "var(--font)",
    bg: "var(--bgStop)",
    icon: <FiUserX />,
  },
  // 생산 관리 (ProductLot 등)
  WAIT: {
    label: "대기중",
    iconColor: "var(--waiting)",
    textColor: "var(--font)",
    bg: "var(--bgWaiting)",
    icon: <LuHourglass />,
  },
  RUNNING: {
    label: "진행중",
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
    label: "불량",
    iconColor: "var(--error)",
    textColor: "var(--font)",
    bg: "var(--bgError)",
    icon: <FiAlertTriangle />,
  },
  HOLD: {
    label: "대기중",
    iconColor: "var(--waiting)",
    textColor: "var(--font)",
    bg: "var(--bgWaiting)",
    icon: <LuHourglass />,
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
    label: "생산 대기",
    iconColor: "var(--waiting)",
    textColor: "var(--font)",
    bg: "var(--bgWaiting)",
    icon: <LuHourglass />,
  },
  LOT_RUN: {
    label: "생산중",
    iconColor: "var(--run)",
    textColor: "var(--font)",
    bg: "var(--bgRun)",
    icon: <FiActivity />,
  },
  LOT_ERR: {
    label: "불량",
    iconColor: "var(--error)",
    textColor: "var(--font)",
    bg: "var(--bgError)",
    icon: <FiAlertTriangle />,
  },
  LOT_OK: {
    label: "생산 완료",
    iconColor: "var(--complete)",
    textColor: "var(--font)",
    bg: "var(--bgComplete)",
    icon: <FiCheckCircle />,
  },
  LOT_END: {
    label: "소진완료",
    iconColor: "var(--stop)",
    textColor: "var(--font)",
    bg: "var(--bgStop)",
    icon: <FiCheckCircle />,
  },
  YES: {
    label: "사용중",
    iconColor: "var(--run)", // 녹색/파란색 계열
    textColor: "var(--font)",
    bg: "var(--bgRun)",
    icon: <FiRefreshCw />,
  },
  NO: {
    label: "사용중지",
    iconColor: "var(--stop)", // 회색 계열
    textColor: "var(--font)",
    bg: "var(--bgStop)",
    icon: <FiPauseCircle />,
  },
  ERROR: {
    label: "불량",
    iconColor: "var(--error)",
    textColor: "var(--font)",
    bg: "var(--bgError)",
    icon: <FiAlertTriangle />,
  },
  STOP: {
    label: "중지",
    iconColor: "var(--stop)",
    textColor: "var(--font)",
    bg: "var(--bgStop)",
    icon: <FiPauseCircle />,
  },
  // ---  작업 지시 (WorkOrder) 상태 매핑 ---
  PENDING: {
    label: "대기중",
    iconColor: "var(--waiting)",
    textColor: "var(--font)",
    bg: "var(--bgWaiting)",
    icon: <LuHourglass />,
  },
  IN_PROGRESS: {
    label: "실행중",
    iconColor: "var(--run)",
    textColor: "var(--font)",
    bg: "var(--bgRun)",
    icon: <FiRefreshCw />,
  },
  DONE: {
    label: "완료",
    iconColor: "var(--complete)",
    textColor: "var(--font)",
    bg: "var(--bgComplete)",
    icon: <FiCheckCircle />,
  },
  CANCELED: {
    label: "취소됨",
    iconColor: "var(--stop)",
    textColor: "var(--font)",
    bg: "var(--bgStop)",
    icon: <FiXCircle />,
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
  // status가 불리언(true/false)으로 올 경우를 대비해 YES/NO 문자열로 치환
  let displayStatus = status;
  if (typeof status === "boolean") {
    displayStatus = status ? "YES" : "NO";
  }
  // 안전하게 대문자 변환
  let statusKey = displayStatus
    ? String(displayStatus).toUpperCase()
    : "DEFAULT";

  if (status === "IN_PROGRESS") statusKey = "RUNNING";

  // 설정값 가져오기
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
          font-size: var(--fontSm);
          font-weight: var(--normal);
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
  display: flex;
  align-items: center;
  justify-content: center;
`;

export default Status;
