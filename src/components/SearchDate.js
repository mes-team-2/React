import styled, { createGlobalStyle, keyframes } from "styled-components";
import { useState } from "react";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendarAlt, FaChevronLeft, FaChevronRight } from "react-icons/fa";

/**
 * @param {string} width 
 * @param {function} onChange 
 */
const SearchDate = ({ width, onChange }) => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const handleStartDateChange = (date) => {
    setStartDate(date);
    if (onChange) onChange(date, endDate);
  };

  const handleEndDateChange = (date) => {
    setEndDate(date);
    if (onChange) onChange(startDate, date);
  };

  return (
    <Container width={width}>
      <DatePickerStyles />

      <CustomDatePicker
        selected={startDate}
        onChange={handleStartDateChange}
        placeholder="시작일"
        selectsStart
        startDate={startDate}
        endDate={endDate}
      />
      <Separator>~</Separator>
      <CustomDatePicker
        selected={endDate}
        onChange={handleEndDateChange}
        placeholder="종료일"
        selectsEnd
        startDate={startDate}
        endDate={endDate}
        minDate={startDate}
      />
    </Container>
  );
};

export default SearchDate;


const CustomHeader = ({
  date,
  decreaseMonth,
  increaseMonth,
  prevMonthButtonDisabled,
  nextMonthButtonDisabled,
}) => (
  <HeaderContainer>
    <NavButton onClick={decreaseMonth} disabled={prevMonthButtonDisabled}>
      <FaChevronLeft />
    </NavButton>
    <CurrentMonth>
      {date.getFullYear()}년 {date.getMonth() + 1}월
    </CurrentMonth>
    <NavButton onClick={increaseMonth} disabled={nextMonthButtonDisabled}>
      <FaChevronRight />
    </NavButton>
  </HeaderContainer>
);

const CustomDatePicker = ({ selected, onChange, placeholder, ...rest }) => (
  <DateInputWrapper>
    <StyledDatePicker
      selected={selected}
      onChange={onChange}
      dateFormat="yyyy-MM-dd"
      placeholderText={placeholder}
      renderCustomHeader={CustomHeader}
      {...rest}
    />
    <CalendarIcon />
  </DateInputWrapper>
);


const sizeMap = {
  s: '200px',
  m: '300px',
  l: '400px'
};

const Container = styled.div`
  display: flex;
  width: ${props => sizeMap[props.width] || props.width};
  height: 30px;
  align-items: center;
  gap: 2px;
  box-sizing: border-box;
`;

const DateInputWrapper = styled.div`
  position: relative;
  flex: 1;
  width: 100%;
  height: 100%;

  .react-datepicker-wrapper {
    width: 100%;
    height: 100%;
    display: block;
  }
  .react-datepicker__input-container {
    height: 100%;
    width: 100%;
  }
`;

const StyledDatePicker = styled(ReactDatePicker)`
  width: 100%;
  height: 30px;
  padding: 0 15px;
  border: 1px solid transparent;
  border-radius: 50px;
  background-color: var(--background2);
  color: var(--font);
  font-size: var(--fontSm);
  box-sizing: border-box;
  outline: none;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border: 1px solid var(--font2);
    box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.05); 
  }

  &:focus {
    border: 1px solid var(--font2);
    box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.05); 
  }

  &::placeholder {
    color: var(--font2);
  }
`;

const CalendarIcon = styled(FaCalendarAlt)`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--font2);
  font-size: 12px;
  pointer-events: none;
  z-index: 1;
`;

const Separator = styled.span`
  font-size: var(--fontSm);
  color: var(--font2);
  flex-shrink: 0;
  padding: 0 2px;
`;


const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 5px 5px 5px;
  background-color: var(--background);
`;

const CurrentMonth = styled.span`
  font-size: var(--fontSm);
  font-weight: bold;
  color: var(--font);
  letter-spacing: -0.5px; 
`;

const NavButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: var(--font2);
  font-size: var(--fontXxs);
  width: 24px;   
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--background2);
    color: var(--main);
  }
  &:disabled {
    opacity: 0.3;
    cursor: default;
  }
`;


const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
`;

const DatePickerStyles = createGlobalStyle`
  .react-datepicker-popper {
    z-index: 9999 !important;
    padding-top: 2px; 
  }

  .react-datepicker {
    font-family: inherit;
    border: 1px solid var(--border);
    border-radius: 12px;
    background-color: var(--background);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08); 
    padding-bottom: 8px; 
    overflow: hidden;
    animation: ${fadeIn} 0.2s ease-out;
    font-size: var(--fontXs); 
  }

  .react-datepicker__header {
    background-color: var(--background);
    border-bottom: none;
    padding-top: 0;
  }

  .react-datepicker__day-names {
    margin-top: 5px;
    border-bottom: 1px solid var(--border);
    padding-bottom: 5px;
  }

  .react-datepicker__day-name {
    color: var(--font2);
    font-weight: var(--medium);
    width: 28px;
    line-height: 28px;
    margin: 1px;
    font-size: var(--fontXxs); 
  }

  .react-datepicker__month {
    margin: 5px 8px 0 8px; 
  }

  .react-datepicker__day {
    width: 28px; 
    line-height: 28px;
    margin: 1px;
    border-radius: 20%;
    color: var(--font);
    font-size: 12px;
    font-weight: var(--normal);
    transition: all 0.2s ease;

    &:hover {
      background-color: var(--background2);
      color: var(--main);
    }
  }

  /* 선택된 날짜 */
  .react-datepicker__day--selected,
  .react-datepicker__day--keyboard-selected,
  .react-datepicker__day--in-range,
  .react-datepicker__day--in-selecting-range {
    background-color: var(--background2) !important;
    color: var(--main) !important;
    font-weight: var(--bold);
    border-radius: 20%; 
  }

  /* 오늘 날짜 */
  .react-datepicker__day--today {
    font-weight: var(--bold);
    color: var(--main);
    position: relative;

    &::after {
      content: '';
      position: absolute;
      bottom: 3px; 
      left: 50%;
      transform: translateX(-50%);
      width: 3px;
      height: 3px;
      background-color: var(--main);
      border-radius: 50%;
    }
  }
  
  /* 선택된 상태에서 오늘 날짜 점 색상 */
  .react-datepicker__day--selected.react-datepicker__day--today::after {
    background-color: var(--main); 
  }

  .react-datepicker__day--disabled {
    color: var(--font2);
    opacity: 0.5;
    cursor: not-allowed;
    &:hover {
      background-color: transparent;
      color: var(--font2);
    }
  }

  .react-datepicker__triangle {
    display: none;
  }
`;