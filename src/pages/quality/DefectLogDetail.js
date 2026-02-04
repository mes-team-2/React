import styled from "styled-components";
import { useMemo, useState } from "react";
import Table from "../../components/TableStyle";

export default function QualityDefectLogDetail({ log }) {
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });

  /* =========================
     불량 유형별 집계 + 최근 발생 시각
  ========================= */
  const defectSummary = useMemo(() => {
    if (!log?.defects) return [];

    const DEFECT_TYPE_BY_PROCESS = {
      "MAC-A-01": ["SCRATCH", "THICKNESS_ERROR"],
      "MAC-A-02": ["MISALIGNMENT", "MISSING_PART"],
      "MAC-A-03": ["LOW_VOLTAGE", "HIGH_TEMP"],
      "MAC-A-04": ["WELDING_ERROR", "LABEL_ERROR"],
      "MAC-A-05": ["DIMENSION_ERROR", "FOREIGN_MATERIAL"],
    };

    const allowedTypes =
      DEFECT_TYPE_BY_PROCESS[String(log.machineCode).trim()] ?? [];

    const map = {};

    log.defects.forEach((d) => {
      if (!allowedTypes.includes(d.defectType)) return;

      const type = d.defectType;
      const qty = Number(d.defectQty ?? 0);
      const time = d.occurredAtRaw;

      if (!map[type]) {
        map[type] = {
          defectType: type,
          qty: 0,
          occurredAtRaw: time,
          occurredAtText: d.occurredAtText,
        };
      }

      map[type].qty += qty;

      if (
        time &&
        (!map[type].occurredAtRaw || time > map[type].occurredAtRaw)
      ) {
        map[type].occurredAtRaw = time;
        map[type].occurredAtText = d.occurredAtText;
      }
    });

    return Object.values(map);
  }, [log]);

  /* =========================
     ✅ 정렬된 데이터 (추가)
  ========================= */
  const sortedDefectSummary = useMemo(() => {
    if (!sortConfig.key) return defectSummary;

    const sorted = [...defectSummary].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      // 숫자 정렬
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
      }

      // 날짜 정렬 (Raw 기준)
      if (sortConfig.key === "occurredAtText") {
        const aTime = new Date(a.occurredAtRaw).getTime();
        const bTime = new Date(b.occurredAtRaw).getTime();
        return sortConfig.direction === "asc" ? aTime - bTime : bTime - aTime;
      }

      // 문자열 정렬
      return sortConfig.direction === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });

    return sorted;
  }, [defectSummary, sortConfig]);

  if (!log) {
    return <Empty>불량 항목을 선택하세요.</Empty>;
  }

  const columns = [
    { key: "defectType", label: "불량 유형", width: 180 },
    { key: "qty", label: "총 불량 수량", width: 120 },
    {
      key: "occurredAtText",
      label: "최근 발생 시각",
      width: 180,
    },
  ];

  return (
    <Wrapper>
      <Header>
        <div>
          <h3>불량 상세</h3>
          <span>{log.lotNo}</span>
        </div>
      </Header>

      <InfoGrid>
        <InfoItem>
          <label>공정</label>
          <strong>{log.processName ?? "-"}</strong>
        </InfoItem>
        <InfoItem>
          <label>설비</label>
          <strong>{log.machineName ?? "-"}</strong>
        </InfoItem>
        <InfoItem>
          <label>불량 합계</label>
          <strong>{log.defectQty ?? 0}</strong>
        </InfoItem>
        <InfoItem>
          <label>LOT 최근 발생</label>
          <strong>{log.occurredAtText ?? "-"}</strong>
        </InfoItem>
      </InfoGrid>

      <Section>
        <SectionTitle>불량 유형별 이력</SectionTitle>
        <Table
          columns={columns}
          data={sortedDefectSummary}
          sortConfig={sortConfig}
          onSort={(key) =>
            setSortConfig((prev) => ({
              key,
              direction:
                prev.key === key && prev.direction === "asc" ? "desc" : "asc",
            }))
          }
          selectable={false}
        />
      </Section>
    </Wrapper>
  );
}

/* =========================
   styled (변경 없음)
========================= */

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 22px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;

  h3 {
    font-size: 18px;
    font-weight: 700;
    margin: 0;
  }

  span {
    font-size: 12px;
    opacity: 0.6;
  }
`;

const Badge = styled.div`
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
`;

const InfoItem = styled.div`
  background: white;
  border-radius: 12px;
  padding: 14px 16px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.04);

  label {
    font-size: 11px;
    opacity: 0.6;
  }

  strong {
    display: block;
    margin-top: 6px;
    font-size: 14px;
  }
`;

const Section = styled.section``;

const SectionTitle = styled.h4`
  margin-bottom: 10px;
  font-size: 15px;
  font-weight: 600;
`;

const Empty = styled.div`
  padding: 40px 20px;
  text-align: center;
  opacity: 0.6;
`;
