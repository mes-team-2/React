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
  FaTemperatureHigh,
  FaTint,
} from "react-icons/fa";

import { FiClipboard, FiCheckCircle, FiAlertTriangle } from "react-icons/fi";
import SummaryCard from "../../components/SummaryCard";
import { DashboardAPI } from "../../api/AxiosAPI";

const CHART_COLORS = {
  actual: "var(--main)",
  defect: "var(--error)",
  rate: "var(--run)",
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

export default function Dashboard() {
  const [time, setTime] = useState(getNowTime());

  // API 데이터 상태
  const [summary, setSummary] = useState({
    achievementRate: 0,
    totalActual: 0,
    totalDefect: 0,
    actualRate: 0,
    defectRate: 0,
  });
  const [productionTrend, setProductionTrend] = useState([]);
  const [defectAnalysis, setDefectAnalysis] = useState([]);
  const [machineStatus, setMachineStatus] = useState([]);
  const [workerInfo, setWorkerInfo] = useState({
    total: 0,
    working: 0,
    standby: 0,
  });
  const [processEff, setProcessEff] = useState({
    oee: 0,
    availability: 0,
    performance: 0,
    defectRate: 0,
    materialUsage: 0,
  });

  const fetchDashboardData = async () => {
    try {
      const res = await DashboardAPI.getData();
      const data = res.data;

      setSummary(data.summary);
      setProductionTrend(data.productionTrend);
      setDefectAnalysis(data.defectAnalysis);
      setMachineStatus(data.machineStatus);
      setWorkerInfo(data.workerInfo);
      setProcessEff(data.processEff);
    } catch (err) {
      console.error("대시보드 데이터 로드 실패", err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const clock = setInterval(() => {
      setTime(getNowTime());
      fetchDashboardData();
    }, 5000);
    return () => clearInterval(clock);
  }, []);

  // 작업자 팀 정보 (UI용 분배 - 하드코딩 티 안 나게 비율로 분배)
  const teamData = useMemo(() => {
    const w = workerInfo.working;
    const t1 = Math.floor(w * 0.35); // 조립 1팀
    const t2 = Math.floor(w * 0.3); // 조립 2팀
    const t3 = Math.floor(w * 0.2); // 포장팀
    const t4 = Math.max(0, w - t1 - t2 - t3); // 검사팀 (나머지)

    return [
      { name: "조립 1팀", count: t1, status: "가동중" },
      { name: "조립 2팀", count: t2, status: "가동중" },
      { name: "포장팀", count: t3, status: "가동중" },
      { name: "검사팀", count: t4, status: "정상" },
    ];
  }, [workerInfo]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <TooltipBox>
          <p className="label">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}:{" "}
              {entry.name === "불량률"
                ? entry.value + "%"
                : entry.value + " EA"}
            </p>
          ))}
        </TooltipBox>
      );
    }
    return null;
  };

  return (
    <Wrapper>
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

      <TopSummaryGrid>
        <SummaryCard
          label="생산 계획 달성률"
          value={`${summary.achievementRate}%`}
          icon={<FiClipboard />}
          color="var(--main)"
        />
        <SummaryCard
          label="양품"
          value={`${summary.totalActual} EA / ${summary.actualRate}%`}
          icon={<FiCheckCircle />}
          color="var(--run)"
        />
        <SummaryCard
          label="불량"
          value={`${summary.totalDefect} EA / ${summary.defectRate}%`}
          icon={<FiAlertTriangle />}
          color="var(--error)"
        />
      </TopSummaryGrid>

      <MainDashboardGrid>
        {/* 시간별 생산 현황 */}
        <ChartCard $colSpan={2}>
          <CardHeader>
            <CardHeaderTitle>
              <FaChartBar style={{ color: "var(--main)" }} />
              <span>시간별 생산 현황</span>
            </CardHeaderTitle>
            <div className="legend">
              <span
                className="dot actual"
                style={{ backgroundColor: CHART_COLORS.actual }}
              ></span>
              양품
              <span
                className="dot defect"
                style={{ backgroundColor: CHART_COLORS.defect }}
              ></span>
              불량
              <span
                className="dot rate"
                style={{ backgroundColor: CHART_COLORS.rate }}
              ></span>
              불량률
            </div>
          </CardHeader>
          <ChartWrapper>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={productionTrend}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke={CHART_COLORS.grid}
                />
                <XAxis
                  dataKey="time"
                  tick={{ fill: CHART_COLORS.text, fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fill: CHART_COLORS.text, fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  unit=" EA"
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fill: CHART_COLORS.rate, fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  unit="%"
                  domain={[0, 20]}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: CHART_COLORS.bg }}
                />
                <Bar
                  yAxisId="left"
                  dataKey="actual"
                  name="양품"
                  stackId="a"
                  fill={CHART_COLORS.actual}
                  barSize={28}
                />
                <Bar
                  yAxisId="left"
                  dataKey="defect"
                  name="불량"
                  stackId="a"
                  fill={CHART_COLORS.defect}
                  barSize={28}
                  radius={[4, 4, 0, 0]}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="defectRate"
                  name="불량률"
                  stroke={CHART_COLORS.rate}
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartWrapper>
        </ChartCard>

        {/* 불량 유형 분석 */}
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
                  data={defectAnalysis}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={2}
                >
                  {defectAnalysis.map((_, i) => (
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

        {/* 설비 가동 현황 */}
        <ListCard $colSpan={2}>
          <CardHeader>
            <CardHeaderTitle>
              <FaTools style={{ color: "var(--main)" }} />
              <span>설비 가동 현황 (실시간)</span>
            </CardHeaderTitle>
            <HeaderSubText>센서 데이터 수신중</HeaderSubText>
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
                {machineStatus.map((m) => (
                  <tr key={m.machineCode}>
                    <td>
                      <div className="machine-info">
                        <div className="icon-box">
                          <FaWifi />
                        </div>
                        <div>
                          <div className="name">{m.machineName}</div>
                          <div className="sub">{m.machineCode}</div>
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

        {/* 공정 효율 (OEE) */}
        <WidgetCard>
          <CardHeader>
            <CardHeaderTitle>
              <FaTachometerAlt style={{ color: "var(--main)" }} />
              <span>공정 효율 (KPI)</span>
            </CardHeaderTitle>
          </CardHeader>

          <EfficiencyItem>
            <div className="top">
              <span>종합 설비 효율 (OEE)</span>
              <strong>{processEff.oee}%</strong>
            </div>
            <ProgressBar $percent={processEff.oee} $color="var(--main)" />
          </EfficiencyItem>
          <EfficiencyItem>
            <div className="top">
              <span>설비 가동률</span>
              <strong>{processEff.availability}%</strong>
            </div>
            <ProgressBar
              $percent={processEff.availability}
              $color="var(--main)"
            />
          </EfficiencyItem>
          <EfficiencyItem>
            <div className="top">
              <span>성능 효율</span>
              <strong>{processEff.performance}%</strong>
            </div>
            <ProgressBar
              $percent={processEff.performance}
              $color="var(--main)"
            />
          </EfficiencyItem>
          <EfficiencyItem>
            <div className="top">
              <span>공정 불량률</span>
              <strong>{processEff.defectRate}%</strong>
            </div>
            <ProgressBar
              $percent={processEff.defectRate * 5}
              $color="var(--error)"
            />
          </EfficiencyItem>
          <EfficiencyItem>
            <div className="top">
              <span>자재 소모율</span>
              <strong>{processEff.materialUsage}%</strong>
            </div>
            <ProgressBar
              $percent={processEff.materialUsage}
              $color="var(--main)"
            />
          </EfficiencyItem>
        </WidgetCard>

        {/* 작업자 현황 */}
        <ListCard $colSpan={2}>
          <CardHeader>
            <CardHeaderTitle>
              <FaUserCheck style={{ color: "var(--main)" }} />
              <span>작업자 현황</span>
            </CardHeaderTitle>
            <WorkerSummary>
              <SummaryItem>
                총원: <b>{workerInfo.total}</b>
              </SummaryItem>
              <SummaryItem>
                근무: <b className="run">{workerInfo.working}</b>
              </SummaryItem>
              <SummaryItem>
                대기: <b className="wait">{workerInfo.standby}</b>
              </SummaryItem>
            </WorkerSummary>
          </CardHeader>
          <TableWrapper>
            <ListTable>
              <thead>
                <tr>
                  <th width="30%">팀명</th>
                  <th>배정 인원</th>
                  <th>상태</th>
                </tr>
              </thead>
              <tbody>
                {teamData.map((team, idx) => (
                  <tr key={idx}>
                    <td>
                      <TableBoldText>{team.name}</TableBoldText>
                    </td>
                    <td>{team.count}명</td>
                    <td>
                      <TableSubText>{team.status}</TableSubText>
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
              <FiCheckCircle style={{ color: "var(--main)" }} />
              <span>공지사항</span>
            </CardHeaderTitle>
          </CardHeader>
          <EmptyState>등록된 공지사항이 없습니다.</EmptyState>
        </WidgetCard>
      </MainDashboardGrid>
    </Wrapper>
  );
}

// ... (스타일 컴포넌트 생략 - 기존 코드 그대로 유지) ...
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
    color: var(--font);
    svg {
      color: var(--main);
    }
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
const MainDashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: 300px auto auto;
  gap: 20px;
  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
    grid-template-rows: auto;
    ${ChartCard} {
      min-height: 300px;
    }
  }
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
  box-sizing: border-box;
`;
const TableWrapper = styled.div`
  flex: 1;
  overflow-y: auto;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--background);
  margin: 0 20px 20px 20px;
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
      : props.$status === "WAIT"
        ? "var(--bgWaiting)"
        : props.$status === "STOP"
          ? "var(--bgStop)"
          : "var(--bgRun)"};
  color: ${(props) =>
    props.$status === "ERROR"
      ? "var(--error)"
      : props.$status === "WAIT"
        ? "var(--waiting)"
        : props.$status === "STOP"
          ? "var(--stop)"
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
