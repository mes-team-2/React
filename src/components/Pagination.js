import React from "react";
import styled from "styled-components";

const Pagination = ({ page, totalPages, onPageChange }) => {
  // 페이지가 1개 이하라면 페이지네이션 노출 X
  if (totalPages <= 1) return null;

  // 한 번에 보여줄 페이지 번호 개수
  const limit = 10;

  const startPage = Math.floor((page - 1) / limit) * limit + 1;

  const endPage = Math.min(startPage + limit - 1, totalPages);

  return (
    <PaginationContainer>
      {/* 맨 처음으로 */}
      <PageBtn
        onClick={() => onPageChange(1)}
        disabled={page === 1}
      >
        {"<<"}
      </PageBtn>

      {/* 이전 페이지 */}
      <PageBtn
        onClick={() => onPageChange(Math.max(page - 1, 1))}
        disabled={page === 1}
      >
        {"<"}
      </PageBtn>

      {Array.from({ length: endPage - startPage + 1 }).map((_, idx) => {
        const pageNum = startPage + idx;
        return (
          <PageBtn
            key={pageNum}
            $active={page === pageNum}
            onClick={() => onPageChange(pageNum)}
          >
            {pageNum}
          </PageBtn>
        );
      })}

      {/* 다음 페이지 */}
      <PageBtn
        onClick={() => onPageChange(Math.min(page + 1, totalPages))}
        disabled={page === totalPages}
      >
        {">"}
      </PageBtn>

      {/* 맨 마지막으로 */}
      <PageBtn
        onClick={() => onPageChange(totalPages)}
        disabled={page === totalPages}
      >
        {">>"}
      </PageBtn>
    </PaginationContainer>
  );
};

export default Pagination;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 5px;
  padding: 10px;
  box-sizing: border-box;
`;

const PageBtn = styled.button`
  min-width: 30px;
  height: 30px;
  border: 1px solid var(--border);
  border-radius: 5px;
  cursor: pointer;
  
  background-color: ${({ $active }) =>
    $active ? "var(--main)" : "white"};
  
  color: ${({ $active }) => ($active ? "white" : "var(--font)")};

  font-size: var(--fontXs);

  &:disabled {
    cursor: default;
    opacity: 0.5;
  }

  &:hover:not(:disabled) {
    background-color: ${({ $active }) =>
    $active ? "var(--main)" : "var(--border)"};
  }
`;