import styled from "styled-components";
import { useMemo, useState } from "react";
import Table from "../../components/TableStyle";
import QRCodeCreate from "../../components/QRCodeCreate";

// 불량 코드 한글 매핑 상수
const DEFECT_NAMES = {
  SCRATCH: "스크래치",
  THICKNESS_ERROR: "두께 불량",
  MISALIGNMENT: "정렬 불량",
  MISSING_PART: "부품 누락",
  LOW_VOLTAGE: "전압 미달",
  HIGH_TEMP: "고온 발생",
  WELDING_ERROR: "용접 불량",
  LABEL_ERROR: "라벨 부착 불량",
  DIMENSION_ERROR: "치수 불량",
  FOREIGN_MATERIAL: "이물질 혼입",
  ETC: "기타",
  NONE: "양품",
};

// 코드 -> 한글 변환 헬퍼 함수
const getDefectName = (code) => DEFECT_NAMES[code] || code;

export default function QualityDefectLogDetail({ log }) {
  const defectName = useMemo(() => {
    if (!log?.defectCode) return "-";
    return getDefectName(log.defectCode);
  }, [log]);

  console.log("DETAIL ROW:", log);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });

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
    { key: "defectType", label: "불량 코드", width: 180 },
    {
      key: "defectType",
      label: "불량 유형",
      width: 180,
      render: (code) => getDefectName(code), // 코드(SCRATCH) -> 한글(스크래치) 변환
    },
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
          <h3>불량 이력 상세</h3>
        </div>
      </Header>

      <Content>
        <Section>
          <SectionTitle>LOT 정보</SectionTitle>
          <QRBox>
            <QRCodeCreate
              value={log.lotNo}
              size="m"
              showText={true}
              showDownload={true}
            />
          </QRBox>
          <Item>
            <label>LOT 번호</label>
            <Value>{log.lotNo}</Value>
          </Item>
        </Section>
        <Section>
          <SectionTitle>공정 정보</SectionTitle>
          <Grid>
            <Item>
              <label>공정번호</label>
              {/* 연결 필요 */}
              <Value>{log.processCode ?? "-"}</Value>
            </Item>
            <Item>
              <label>공정명</label>
              <Value>{log.processName ?? "-"}</Value>
            </Item>
          </Grid>
        </Section>
        <Section>
          <SectionTitle>설비 정보</SectionTitle>
          <Grid>
            <Item>
              <label>설비코드</label>
              <Value>{log.machineCode ?? "-"}</Value>
            </Item>
            <Item>
              <label>설비명</label>
              <Value>{log.machineName ?? "-"}</Value>
            </Item>
          </Grid>
        </Section>
        <Section>
          <SectionTitle>불량 정보</SectionTitle>
          <Grid>
            <FullItem>
              <label>발생일자</label>
              <Value>{log.occurredAtText ?? "-"}</Value>
            </FullItem>
            <FullItem>
              <label>불량수량</label>
              <Value>{log.defectQty ?? "-"}</Value>
            </FullItem>
          </Grid>
          <Item>
            <label>불량 유형별 이력</label>
            <Table
              columns={columns}
              data={sortedDefectSummary}
              sortConfig={sortConfig}
              onSort={(key) =>
                setSortConfig((prev) => ({
                  key,
                  direction:
                    prev.key === key && prev.direction === "asc"
                      ? "desc"
                      : "asc",
                }))
              }
              selectable={false}
            />
          </Item>
        </Section>
      </Content>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  height: 100%;
`;
const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  h3 {
    font-size: var(--fontHd);
    font-weight: var(--bold);
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
const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px;
  overflow-y: auto;
  padding-right: 10px;
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: var(--background2);
    border-radius: 3px;
  }
`;
const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SectionTitle = styled.h4`
  font-size: var(--fontMd);
  font-weight: var(--bold);
  color: var(--font);
  display: flex;
  align-items: center;
  position: relative;
  padding-left: 12px;
  &::before {
    content: "";
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 16px;
    background-color: var(--main);
    border-radius: 2px;
  }
`;

const QRBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;
const Empty = styled.div`
  padding: 40px 20px;
  text-align: center;
  opacity: 0.6;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
`;
const Item = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  label {
    font-size: var(--fontXs);
    font-weight: var(--medium);
    color: var(--font2);
    padding: 2px;
  }
`;
const FullItem = styled(Item)`
  grid-column: 1 / -1;
`;
const Value = styled.div`
  display: flex;
  align-items: center;
  padding: 10px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--background);
  min-height: 38px;
  font-size: var(--fontSm);
  color: var(--font);
`;
