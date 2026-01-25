import styled from "styled-components";
import { useState } from "react";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendarAlt } from "react-icons/fa";
/**
 * @param {string} width 
 */

const SearchDate = (props) => {
  const [startDate, setStartDate] = useState(null); // 시작날짜
  const [endDate, setEndDate] = useState(null); // 종료날짜

  const handleStartDateChange = (date) => {
    setStartDate(date);
  };
  const handleEndDateChange = (date) => {
    setEndDate(date);
  };

  return (
    <Container width={props.width}>
      <CustomDatePicker
        selected={startDate}
        onChange={handleStartDateChange}
        placeholder="시작날짜"
      />
      <Separator>~</Separator>
      <CustomDatePicker
        selected={endDate}
        onChange={handleEndDateChange}
        placeholder="종료날짜"
      />
    </Container>
  );
};

export default SearchDate;

const sizeMap = {
  s: '200px',
  m: '300px',
  l: '400px'
};

const Container = styled.div`
  display: flex;
  width: ${props => sizeMap[props.width] || props.width};
  height: auto;
  height: 30px;
  justify-content: flex-start;
  align-items: center;
  gap: 5px;
  box-sizing: border-box;
  padding: 0 15px;
`;


const StyledDatePicker = styled(ReactDatePicker)`
  justify-content: flex-start;
  gap: 10px;
  display: flex;
  border: none;
  border-radius: 25px;
  font-size: var(--fontSm); 
  font-weight: var(--normal);
  color: var(--font); 
  
  background-color: var(--background2);
  width: 100%;
  min-width: 120px;
  height: 100%;
  border: 1px solid transparent;
  box-sizing: border-box;
  padding: 0 15px;
  cursor: pointer;

  &:focus {
    border: 1px solid var(--font2);
  }

  &:focus {
    outline: none;
  }
  &::placeholder {
    color: var(--font2);
  }
`;

const DateInputWrapper = styled.div`
  position: relative;
  flex: 1;
  width: 100%;
  height: 30px;

  .react-datepicker-wrapper {
    width: 100%;
    height: 100%;
    display: block;
  }

  .react-datepicker__input-container {
    height: 100%;
    width: 100%;
  }
  .react-datepicker-popper {
    z-index: 9999 !important; 
  }
`;

const CalendarIcon = styled(FaCalendarAlt)`
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--font2);
  font-size: var(--fontSm);
  pointer-events: none;
  z-index: 1; 
`;

const Separator = styled.p`
  font-size: 20px;
  color: var(--font);
  margin: 0;
  flex-shrink: 0; 
`;

const CustomDatePicker = ({
  selected,
  onChange,
  placeholder,
  ...rest
}) => (
  <DateInputWrapper>
    <StyledDatePicker
      selected={selected}
      onChange={onChange}
      dateFormat="yyyy/MM/dd"
      placeholderText={placeholder}
      {...rest}
    />
    <CalendarIcon />
  </DateInputWrapper>
);

