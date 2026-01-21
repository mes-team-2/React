import React, { useState, useRef, useEffect } from 'react';

// MES 시스템 메인 컴포넌트
const MesApp = () => {
    // -----------------------------------------------------------
    // [1] State 관리 (데이터 및 UI 상태)
    // -----------------------------------------------------------
    
    // 사용자가 입력한 작업 내용을 저장하는 상태
    const [inputTask, setInputTask] = useState('');

    // 화면 왼쪽 목록에 표시할 할 일 리스트
    const [todoList, setTodoList] = useState([]);

    // 화면 오른쪽 가상 콘솔창에 표시할 로그 리스트
    const [serverLogs, setServerLogs] = useState([]);

    // 시스템 통신 상태 (READY, SENDING, SUCCESS)
    const [systemStatus, setSystemStatus] = useState('READY');

    // 로그 창 자동 스크롤을 위한 Ref
    const logEndRef = useRef(null);

    // -----------------------------------------------------------
    // [2] 로직 및 핸들러 (기능 구현)
    // -----------------------------------------------------------

    // 로그가 추가될 때마다 스크롤을 최하단으로 내리는 효과
    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [serverLogs]);

    // 입력창 값 변경 핸들러
    const handleChange = (e) => {
        setInputTask(e.target.value);
    };

    // [가상 서블릿] 서버 역할을 하는 함수
    // 실제 백엔드 없이 데이터를 받아 로그를 찍고 처리 성공을 반환함
    const mockServletDoPost = (data) => {
        const { task, worker, time } = data;
        
        // 서버 로그 형식으로 문자열 생성
        const newLog = `[SERVER] Received: "${task}" (Worker: ${worker}, Time: ${time})`;
        
        // 로그 상태 업데이트 (기존 로그 배열 뒤에 추가)
        setServerLogs(prevLogs => [...prevLogs, newLog]);
        return true;
    };

    // 전송 버튼 클릭 핸들러
    const handleSubmit = () => {
        // 빈 값 체크
        if (!inputTask.trim()) {
            alert("작업 내용을 입력해주세요.");
            return;
        }

        // 상태 변경: 전송 중 (노란색 표시 예정)
        setSystemStatus('SENDING');

        // 전송할 데이터 객체 포장
        const payload = {
            id: Date.now(),
            task: inputTask,
            worker: 'User_Process_A',
            time: new Date().toLocaleTimeString()
        };

        // 네트워크 지연 시뮬레이션 (0.5초 후 실행)
        setTimeout(() => {
            const isSuccess = mockServletDoPost(payload);

            if (isSuccess) {
                // 목록에 추가 (최신순)
                setTodoList(prev => [payload, ...prev]);
                setInputTask(''); // 입력창 비우기
                setSystemStatus('SUCCESS'); // 상태 변경: 성공 (파란색)

                // 1초 뒤 다시 대기 상태(녹색)로 복귀
                setTimeout(() => setSystemStatus('READY'), 1000);
            }
        }, 500);
    };

    // -----------------------------------------------------------
    // [3] 스타일 객체 정의 (CSS Class 대신 사용)
    // -----------------------------------------------------------
    const styles = {
        container: {
            fontFamily: "'Consolas', sans-serif", // 시스템 폰트
            maxWidth: '1000px',
            margin: '20px auto',
            backgroundColor: '#f4f4f4',
            border: '2px solid #333',
            boxShadow: '0 5px 15px rgba(0,0,0,0.2)'
        },
        header: {
            backgroundColor: '#2c3e50', // 짙은 남색 (헤더)
            color: 'white',
            padding: '15px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '3px solid #1a252f'
        },
        // 상태 뱃지 스타일 (상태값에 따라 배경색 동적 변경을 위해 함수로 분리 가능하나 간단히 처리)
        statusBadge: {
            padding: '5px 15px',
            borderRadius: '4px',
            fontWeight: 'bold',
            color: 'white',
            backgroundColor: systemStatus === 'READY' ? '#27ae60' : // 녹색
                           systemStatus === 'SENDING' ? '#f39c12' : // 주황색
                           '#2980b9' // 파란색 (SUCCESS)
        },
        bodyLayout: {
            display: 'flex', // 좌우 분할을 위한 FlexBox
            minHeight: '500px'
        },
        clientSection: {
            flex: 1, // 50% 너비
            padding: '20px',
            backgroundColor: '#ffffff',
            borderRight: '2px solid #ccc'
        },
        serverSection: {
            flex: 1, // 50% 너비
            padding: '20px',
            backgroundColor: '#1e1e1e', // 터미널 검은색 배경
            color: '#00ff00', // 터미널 녹색 글씨
            display: 'flex',
            flexDirection: 'column'
        },
        sectionTitle: {
            borderBottom: '2px solid #ddd',
            paddingBottom: '10px',
            marginBottom: '15px',
            fontSize: '1.2rem',
            color: '#333'
        },
        serverTitle: { // 서버쪽 타이틀은 색상이 다름
            borderBottom: '1px solid #555',
            paddingBottom: '10px',
            marginBottom: '15px',
            fontSize: '1.2rem',
            color: '#fff'
        },
        inputGroup: {
            display: 'flex',
            gap: '10px',
            marginBottom: '20px'
        },
        input: {
            flex: 1,
            padding: '10px',
            fontSize: '1rem',
            border: '2px solid #ccc',
            borderRadius: '4px'
        },
        button: {
            padding: '10px 20px',
            backgroundColor: '#34495e',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
        },
        list: {
            listStyle: 'none',
            padding: 0
        },
        listItem: {
            backgroundColor: '#f9f9f9',
            border: '1px solid #eee',
            padding: '12px',
            marginBottom: '8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        },
        consoleWindow: {
            flex: 1,
            backgroundColor: 'black',
            padding: '10px',
            borderRadius: '5px',
            overflowY: 'auto', // 내용 많으면 스크롤
            fontFamily: "'Courier New', monospace",
            fontSize: '0.9rem',
            border: '1px solid #444'
        },
        logLine: {
            marginBottom: '4px',
            wordBreak: 'break-all'
        }
    };

    // -----------------------------------------------------------
    // [4] 화면 렌더링 (UI 구성)
    // -----------------------------------------------------------
    return (
        <div style={styles.container}>
            {/* 상단 헤더 영역 */}
            <header style={styles.header}>
                <h2 style={{margin: 0}}>MES Task Manager</h2>
                <div style={styles.statusBadge}>
                    STATUS: {systemStatus}
                </div>
            </header>

            {/* 메인 컨텐츠 영역 (좌: 클라이언트 / 우: 서버) */}
            <div style={styles.bodyLayout}>
                
                {/* 왼쪽: 작업자 입력 화면 */}
                <section style={styles.clientSection}>
                    <h3 style={styles.sectionTitle}>📋 작업 지시 입력 (Client)</h3>
                    
                    <div style={styles.inputGroup}>
                        <input
                            style={styles.input}
                            type="text"
                            placeholder="작업 내용을 입력하세요..."
                            value={inputTask}
                            onChange={handleChange}
                            onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                        />
                        <button style={styles.button} onClick={handleSubmit}>
                            전송
                        </button>
                    </div>

                    <h4 style={{marginTop: '30px', color: '#666'}}>등록된 작업 목록</h4>
                    <ul style={styles.list}>
                        {todoList.length === 0 ? (
                            <li style={{color: '#999', textAlign: 'center'}}>데이터가 없습니다.</li>
                        ) : (
                            todoList.map((item) => (
                                <li key={item.id} style={styles.listItem}>
                                    <span style={{fontWeight: 'bold'}}>{item.task}</span>
                                    <span style={{fontSize: '0.8rem', color: '#888'}}>{item.time}</span>
                                </li>
                            ))
                        )}
                    </ul>
                </section>

                {/* 오른쪽: 가상 서버 콘솔 화면 */}
                <section style={styles.serverSection}>
                    <h3 style={styles.serverTitle}>🖥️ 서블릿 콘솔 (Server Output)</h3>
                    
                    <div style={styles.consoleWindow}>
                        {serverLogs.map((log, index) => (
                            <div key={index} style={styles.logLine}>
                                <span style={{color: '#ff00ff', marginRight: '5px'}}>&gt;</span>
                                {log}
                            </div>
                        ))}
                        {/* 스크롤 하단 고정용 더미 요소 */}
                        <div ref={logEndRef} />
                    </div>

                    <div style={{marginTop: '10px', fontSize: '0.8rem', color: '#777', textAlign: 'center'}}>
                        * Java Servlet의 System.out.println 동작을 시뮬레이션 중입니다.
                    </div>
                </section>

            </div>
        </div>
    );
};

export default MesApp;