import styled from "styled-components";
import { useEffect, useState, useMemo } from "react";
import {
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
  ComposedChart,
  Line,
} from "recharts";

import {
  FaClock,
  FaChartBar,
  FaTools,
  FaUserCheck,
  FaTachometerAlt,
  FaExclamationCircle,
  FaWifi,
  FaCheckCircle,
  FaTemperatureHigh,
  FaTint,
} from "react-icons/fa";

import { FiClipboard, FiCheckCircle, FiAlertTriangle } from "react-icons/fi";

import SummaryCard from "../components/SummaryCard";

/* =========================
   CONSTANTS & STYLES
========================= */
const CHART_COLORS = {
  actual: "var(--main)", // 양품 (파랑)
  defect: "var(--error)", // 불량 (빨강)
  rate: "var(--run)", // 불량률 (녹색)
  grid: "var(--border)",
  text: "var(--font2)",
  bg: "var(--background2)",
};

const PIE_COLORS = ["#FF5B5B", "#FF9F0A", "#938bff", "#34C759", "#AF52DE"];

const getNowTime = () =>
  new Date().toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

/* =========================
   COMPONENT
========================= */
export default function Dashboard() {
  const [time, setTime] = useState(getNowTime());
  const [startIndex, setStartIndex] = useState(0);

  /* -------------------------
      MOCK DATA
  ------------------------- */
  const MACHINE_ENV = [
    {
      id: "M-01",
      machine: "전극공정 #1",
      temperature: 32.5,
      humidity: 68,
      voltage: 12.1,
      status: "NORMAL",
    },
    {
      id: "M-02",
      machine: "조립공정 #2",
      temperature: 41.2,
      humidity: 75,
      voltage: 11.4,
      status: "WARNING",
    },
    {
      id: "M-03",
      machine: "활성화 #1",
      temperature: 55.8,
      humidity: 82,
      voltage: 10.8,
      status: "ERROR",
    },
    {
      id: "M-04",
      machine: "패키징 #1",
      temperature: 28.4,
      humidity: 60,
      voltage: 12.0,
      status: "NORMAL",
    },
    {
      id: "M-05",
      machine: "충방전기 #3",
      temperature: 30.1,
      humidity: 62,
      voltage: 11.9,
      status: "NORMAL",
    },
  ];

  const WORKER_INFO = {
    total: 18,
    working: 14,
    standby: 4,
    teams: [
      { name: "조립 1팀", total: 6, working: 5, standby: 1, note: "정상" },
      { name: "조립 2팀", total: 5, working: 5, standby: 0, note: "풀가동" },
      { name: "포장팀", total: 3, working: 1, standby: 2, note: "교대대기" },
      { name: "검사팀", total: 4, working: 3, standby: 1, note: "정상" },
    ],
  };

  // OEE 지표 + 기존 생산성 지표 통합
  const PROCESS_EFF = {
    oee: 87.5,
    availability: 94.2,
    performance: 96.8,
    uph: 120, // 시간당 생산량
    defectRate: 3.8, // 공정 불량률
    materialUsage: 52, // 자재 소모율
  };

  const DEFECT_TYPE_DATA = [
    { name: "전압 불량", value: 30 },
    { name: "용량 미달", value: 25 },
    { name: "외관 불량", value: 20 },
    { name: "누액", value: 15 },
    { name: "기타", value: 10 },
  ];

  const fullData = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => {
      const hour = i.toString().padStart(2, "0") + ":00";
      const actual = Math.floor(Math.random() * 200) + 200;
      const defect = Math.floor(Math.random() * 20) + 5;
      const total = actual + defect;
      return {
        time: hour,
        _actual: actual,
        _defect: defect,
        _defectRate: (defect / total) * 100 > 15 ? 15 : (defect / total) * 100,
      };
    });
  }, []);

  useEffect(() => {
    const clock = setInterval(() => {
      setTime(getNowTime());
      setStartIndex((prev) => (prev + 1) % 24);
    }, 1000);
    return () => clearInterval(clock);
  }, []);

  const visibleData = useMemo(() => {
    const items = [];
    for (let i = 0; i < 8; i++) {
      items.push(fullData[(startIndex + i) % 24]);
    }
    return items;
  }, [startIndex, fullData]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <TooltipBox>
          <p className="label">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}:{" "}
              {entry.value.toFixed(entry.name === "불량률" ? 2 : 0)}
              {entry.name === "불량률" ? "%" : " EA"}
            </p>
          ))}
        </TooltipBox>
      );
    }
    return null;
  };

  return (
    <Wrapper>
      {/* 1. Header */}
      <Header>
        <TitleArea>
          <h1>Dashboard</h1>
          <p>실시간 생산 모니터링 시스템</p>
        </TitleArea>
        <TimeCard>
          <div className="env-info">
            <FaTemperatureHigh className="icon-temp" /> <span>23℃</span>
            <FaTint className="icon-humidity" /> <span>48%</span>
          </div>
          <div className="divider" />
          <div className="clock-info">
            <FaClock /> <span>{time}</span>
          </div>
        </TimeCard>
      </Header>

      {/* 2. Top Summary */}
      <TopSummaryGrid>
        <SummaryCard
          label="생산 계획 달성률"
          value="92.5%"
          icon={<FiClipboard />}
          color="var(--main)"
        />
        <SummaryCard
          label="양품"
          value="2,450 EA / 96.2%"
          icon={<FiCheckCircle />}
          color="var(--run)"
        />
        <SummaryCard
          label="불량"
          value="98 EA / 3.8%"
          icon={<FiAlertTriangle />}
          color="var(--error)"
        />
      </TopSummaryGrid>

      {/* 3. Main Dashboard Grid */}
      <MainDashboardGrid>
        <ChartCard $colSpan={2}>
          <CardHeader>
            <CardHeaderTitle>
              <FaChartBar style={{ color: "var(--main)" }} />
              <span>시간별 생산 현황</span>
            </CardHeaderTitle>
            <div className="legend">
              <span
                className="dot rate"
                style={{ backgroundColor: CHART_COLORS.rate }}
              ></span>
              불량률(%)
              <span
                className="dot actual"
                style={{ backgroundColor: CHART_COLORS.actual }}
              ></span>
              양품(EA)
              <span
                className="dot defect"
                style={{ backgroundColor: CHART_COLORS.defect }}
              ></span>
              불량(EA)
            </div>
          </CardHeader>
          <ChartWrapper>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={visibleData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  horizontal={true}
                  stroke={CHART_COLORS.grid}
                  strokeOpacity={0.8}
                />
                <XAxis
                  dataKey="time"
                  tick={{ fill: CHART_COLORS.text, fontSize: 12 }}
                  axisLine={{ stroke: CHART_COLORS.grid }}
                  tickLine={false}
                  dy={10}
                />
                <YAxis
                  yAxisId="left"
                  width={60}
                  tick={{ fill: CHART_COLORS.text, fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  unit=" EA"
                  domain={[0, 500]}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  width={60}
                  tick={{ fill: CHART_COLORS.rate, fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  unit="%"
                  domain={[0, 15]}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: CHART_COLORS.bg }}
                />
                <Bar
                  yAxisId="left"
                  dataKey="_actual"
                  name="양품"
                  stackId="a"
                  fill={CHART_COLORS.actual}
                  radius={[0, 0, 4, 4]}
                  barSize={28}
                  isAnimationActive={false}
                />
                <Bar
                  yAxisId="left"
                  dataKey="_defect"
                  name="불량"
                  stackId="a"
                  fill={CHART_COLORS.defect}
                  radius={[4, 4, 0, 0]}
                  barSize={28}
                  isAnimationActive={false}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="_defectRate"
                  name="불량률"
                  stroke={CHART_COLORS.rate}
                  strokeWidth={3}
                  dot={{ r: 4, fill: CHART_COLORS.rate }}
                  isAnimationActive={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartWrapper>
        </ChartCard>

        <ChartCard>
          <CardHeader>
            <CardHeaderTitle>
              <FaExclamationCircle style={{ color: "var(--main)" }} />
              <span>불량 유형 분석</span>
            </CardHeaderTitle>
          </CardHeader>
          <ChartWrapper>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={DEFECT_TYPE_DATA}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {DEFECT_TYPE_DATA.map((_, i) => (
                    <Cell
                      key={i}
                      fill={PIE_COLORS[i % PIE_COLORS.length]}
                      stroke="none"
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend
                  iconType="circle"
                  layout="vertical"
                  verticalAlign="middle"
                  align="right"
                  wrapperStyle={{ fontSize: "11px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartWrapper>
        </ChartCard>

        <ListCard $colSpan={2}>
          <CardHeader>
            <CardHeaderTitle>
              <FaTools style={{ color: "var(--main)" }} />
              <span>설비 가동 현황</span>
            </CardHeaderTitle>
            <HeaderSubText>실시간 모니터링</HeaderSubText>
          </CardHeader>
          <TableWrapper>
            <ListTable>
              <thead>
                <tr>
                  <th width="30%">설비명</th>
                  <th>온도</th>
                  <th>습도</th>
                  <th>전압</th>
                  <th width="20%">상태</th>
                </tr>
              </thead>
              <tbody>
                {MACHINE_ENV.map((m) => (
                  <tr key={m.id}>
                    <td>
                      <div className="machine-info">
                        <div className="icon-box">
                          <FaWifi />
                        </div>
                        <div>
                          <div className="name">{m.machine}</div>
                          <div className="sub">{m.id}</div>
                        </div>
                      </div>
                    </td>
                    <td>{m.temperature}℃</td>
                    <td>{m.humidity}%</td>
                    <td>{m.voltage}V</td>
                    <td>
                      <StatusBadge $status={m.status}>{m.status}</StatusBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </ListTable>
          </TableWrapper>
        </ListCard>

        <WidgetCard>
          <CardHeader>
            <CardHeaderTitle>
              <FaTachometerAlt style={{ color: "var(--main)" }} />
              <span>공정 효율 (OEE & KPI)</span>
            </CardHeaderTitle>
          </CardHeader>

          <EfficiencyItem>
            <div className="top">
              <span>종합 설비 효율 (OEE)</span>
              <strong>{PROCESS_EFF.oee}%</strong>
            </div>
            <ProgressBar $percent={PROCESS_EFF.oee} $color="var(--main)" />
          </EfficiencyItem>

          <EfficiencyItem>
            <div className="top">
              <span>설비 가동률 (Availability)</span>
              <strong>{PROCESS_EFF.availability}%</strong>
            </div>
            <ProgressBar
              $percent={PROCESS_EFF.availability}
              $color="var(--run)"
            />
          </EfficiencyItem>

          <EfficiencyItem>
            <div className="top">
              <span>성능 효율 (Performance)</span>
              <strong>{PROCESS_EFF.performance}%</strong>
            </div>
            <ProgressBar
              $percent={PROCESS_EFF.performance}
              $color="var(--kpi)"
            />
          </EfficiencyItem>

          <EfficiencyItem>
            <div className="top">
              <span>공정 불량률</span>
              <strong>{PROCESS_EFF.defectRate}%</strong>
            </div>
            {/* 불량률은 낮을수록 좋으므로 Warning 색상 사용 */}
            <ProgressBar
              $percent={PROCESS_EFF.defectRate * 5}
              $color="var(--error)"
            />
          </EfficiencyItem>

          <EfficiencyItem>
            <div className="top">
              <span>자재 소모율</span>
              <strong>{PROCESS_EFF.materialUsage}%</strong>
            </div>
            <ProgressBar
              $percent={PROCESS_EFF.materialUsage}
              $color="var(--waiting)"
            />
          </EfficiencyItem>
        </WidgetCard>

        <ListCard $colSpan={2}>
          <CardHeader>
            <CardHeaderTitle>
              <FaUserCheck style={{ color: "var(--main)" }} />
              <span>작업자 현황</span>
            </CardHeaderTitle>
            <WorkerSummary>
              <SummaryItem>
                총원: <b>{WORKER_INFO.total}</b>
              </SummaryItem>
              <SummaryItem>
                작업중: <b className="run">{WORKER_INFO.working}</b>
              </SummaryItem>
              <SummaryItem>
                대기: <b className="wait">{WORKER_INFO.standby}</b>
              </SummaryItem>
            </WorkerSummary>
          </CardHeader>
          <TableWrapper>
            <ListTable>
              <thead>
                <tr>
                  <th width="25%">팀명</th>
                  <th>총 인원</th>
                  <th>작업중</th>
                  <th>대기중</th>
                  <th width="25%">비고</th>
                </tr>
              </thead>
              <tbody>
                {WORKER_INFO.teams.map((team, idx) => (
                  <tr key={idx}>
                    <td>
                      <TableBoldText>{team.name}</TableBoldText>
                    </td>
                    <td>{team.total}명</td>
                    <td>
                      <b className="run">{team.working}명</b>
                    </td>
                    <td>
                      <b className="wait">{team.standby}명</b>
                    </td>
                    <td>
                      <TableSubText>{team.note}</TableSubText>
                    </td>
                  </tr>
                ))}
              </tbody>
            </ListTable>
          </TableWrapper>
        </ListCard>

        <WidgetCard>
          <CardHeader>
            <CardHeaderTitle>
              <FaCheckCircle style={{ color: "var(--main)" }} />
              <span>공지사항 / 메모</span>
            </CardHeaderTitle>
          </CardHeader>
          <EmptyState>표시할 데이터가 없습니다.</EmptyState>
        </WidgetCard>
      </MainDashboardGrid>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-bottom: 40px;
`;
const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 10px;
`;
const TitleArea = styled.div`
  h1 {
    font-size: var(--font2xl);
    font-weight: var(--bold);
    color: var(--font);
    margin-bottom: 4px;
  }
  p {
    font-size: var(--fontSm);
    color: var(--font2);
  }
`;

const TimeCard = styled.div`
  background: var(--background);
  padding: 8px 24px;
  border-radius: 50px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: var(--shadow);
  color: var(--font);
  font-weight: var(--bold);
  font-size: var(--fontMd);
  border: 1px solid var(--border);
  .env-info {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--font2);
    font-size: var(--fontSm);
    .icon-temp {
      color: var(--error);
    }
    .icon-humidity {
      color: var(--main);
    }
  }
  .divider {
    width: 1px;
    height: 16px;
    background: var(--border);
  }
  .clock-info {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--main);
  }
`;

const TopSummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;
const MainDashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: 300px 450px 350px;
  gap: 20px;
  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
    grid-template-rows: auto;
  }
`;
const Card = styled.div`
  background: var(--background);
  border-radius: 16px;
  padding: 24px;
  box-shadow: var(--shadow);
  border: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  height: 100%;
  box-sizing: border-box;
  overflow: hidden;
`;
const ChartCard = styled(Card)`
  grid-column: span ${(props) => props.$colSpan || 1};
`;
const ListCard = styled(Card)`
  grid-column: span ${(props) => props.$colSpan || 1};
  padding: 0;
`;
const WidgetCard = styled(Card)`
  padding: 24px;
  gap: 20px;
`;
const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  ${ListCard} & {
    padding: 24px 24px 0 24px;
  }
  .legend {
    display: flex;
    gap: 12px;
    font-size: var(--fontXs);
    color: var(--font2);
    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      display: inline-block;
      margin-right: 6px;
    }
  }
`;
const CardHeaderTitle = styled.h3`
  font-size: var(--fontLg);
  font-weight: var(--bold);
  color: var(--font);
  display: flex;
  align-items: center;
  gap: 8px;
  svg {
    color: var(--font2);
    font-size: 18px;
    display: flex;
  }
`;
const HeaderSubText = styled.span`
  font-size: 12px;
  color: var(--font2);
`;
const WorkerSummary = styled.div`
  display: flex;
  gap: 15px;
  font-size: 13px;
  color: var(--font);
`;
const SummaryItem = styled.span`
  b {
    font-weight: var(--bold);
  }
  b.run {
    color: var(--run);
  }
  b.wait {
    color: var(--waiting);
  }
`;
const ChartWrapper = styled.div`
  flex: 1;
  width: 100%;
  min-height: 0;
  padding: 10px;
`;
const TableWrapper = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  &::-webkit-scrollbar {
    width: 4px;
  }
`;
const ListTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: var(--fontSm);
  th {
    text-align: center;
    color: var(--font2);
    font-weight: var(--medium);
    padding: 10px;
    border-bottom: 1px solid var(--border);
    background: var(--background2);
    font-size: var(--fontXs);
    position: sticky;
    top: 0;
    z-index: 1;
  }
  td {
    text-align: center;
    padding: 12px 10px;
    border-bottom: 1px solid var(--border);
    color: var(--font);
    vertical-align: middle;
  }
  tr:last-child td {
    border-bottom: none;
  }
  .run {
    color: var(--run);
    font-weight: bold;
  }
  .wait {
    color: var(--waiting);
    font-weight: bold;
  }
  .machine-info {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding-left: 20px;
    gap: 12px;
    .icon-box {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      background: var(--background2);
      color: var(--font2);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .name {
      font-weight: var(--bold);
      color: var(--font);
      font-size: var(--fontSm);
    }
    .sub {
      font-size: var(--fontXxs);
      color: var(--font2);
    }
  }
`;
const TableBoldText = styled.span`
  font-weight: var(--bold);
`;
const TableSubText = styled.span`
  color: var(--font2);
`;
const StatusBadge = styled.span`
  display: inline-block;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: var(--bold);
  text-align: center;
  min-width: 60px;
  background-color: ${(props) =>
    props.$status === "ERROR"
      ? "var(--bgError)"
      : props.$status === "WARNING"
        ? "var(--bgWaiting)"
        : "var(--bgRun)"};
  color: ${(props) =>
    props.$status === "ERROR"
      ? "var(--error)"
      : props.$status === "WARNING"
        ? "var(--waiting)"
        : "var(--run)"};
`;
const EfficiencyItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 5px;
  .top {
    display: flex;
    justify-content: space-between;
    font-size: var(--fontSm);
    color: var(--font2);
    strong {
      color: var(--font);
      font-weight: var(--bold);
      font-size: var(--fontMd);
    }
  }
`;
const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: var(--background2);
  border-radius: 4px;
  overflow: hidden;
  position: relative;
  &::after {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: ${(props) => props.$percent}%;
    background: ${(props) => props.$color};
    border-radius: 4px;
    transition: width 0.5s ease-out;
  }
`;
const EmptyState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--font2);
  font-size: 13px;
`;
const TooltipBox = styled.div`
  background: #fff;
  padding: 10px;
  border: 1px solid var(--border);
  box-shadow: var(--shadow);
  border-radius: 8px;
  font-size: 12px;
  .label {
    font-weight: bold;
    margin-bottom: 5px;
    color: var(--font);
  }
`;
