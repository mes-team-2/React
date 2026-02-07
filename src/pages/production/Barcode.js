// src/pages/production/BarcodePage.js
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Barcode from "react-barcode";
import { FaBarcode, FaBoxOpen, FaTimes, FaPrint } from "react-icons/fa";

const PRODUCTS = [
  {
    id: 1,
    name: "DDR5 Memory Module 16GB",
    barcode: "8801234567891",
    category: "Memory",
    price: 85000,
    stock: 150,
    location: "A-01-02",
    description: "High performance RAM for servers.",
  },
  {
    id: 2,
    name: "NAND Flash Controller",
    barcode: "8801234567892",
    category: "Controller",
    price: 12000,
    stock: 5000,
    location: "B-05-11",
    description: "Next-gen storage controller chip.",
  },
  {
    id: 3,
    name: "Display Driver IC (DDI)",
    barcode: "8801234567893",
    category: "Logic",
    price: 5500,
    stock: 1200,
    location: "A-02-05",
    description: "OLED display driver.",
  },
  {
    id: 4,
    name: "Camera Image Sensor",
    barcode: "PROD-2024-001",
    category: "Sensor",
    price: 45000,
    stock: 300,
    location: "C-10-01",
    description: "108MP Mobile Image Sensor.",
  },
  {
    id: 5,
    name: "test",
    barcode: "8801111111111",
    category: "Sensor",
    price: 45000,
    stock: 300,
    location: "C-01-01",
    description: "108MP Mobile Image Sensor.",
  },
  {
    id: 6,
    name: "test2",
    barcode: "aaaaaaaa",
    category: "Sensor",
    price: 45000,
    stock: 300,
    location: "C-01-01",
    description: "108MP Mobile Image Sensor.",
  },
];

const BarcodePage = () => {
  /* =========================
     State
  ========================= */
  const [products] = useState(PRODUCTS);
  const [scannedProduct, setScannedProduct] = useState(null);
  const [inputBuffer, setInputBuffer] = useState("");
  const [manualInput, setManualInput] = useState("");

  /* =========================
     Barcode Scanner Listener
  ========================= */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        if (inputBuffer.length > 0) {
          handleScan(inputBuffer);
          setInputBuffer("");
        }
      } else {
        if (e.key.length === 1) {
          setInputBuffer((prev) => prev + e.key);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [inputBuffer]);

  /* =========================
     Scan Logic
  ========================= */
  const handleScan = (code) => {
    const found = products.find(
      (p) => p.barcode.toLowerCase() === code.toLowerCase(),
    );

    if (found) {
      setScannedProduct(found);
    } else {
      alert(`Product not found for barcode: ${code}`);
    }
  };

  /* =========================
     Manual Test
  ========================= */
  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualInput.trim()) {
      handleScan(manualInput.trim());
      setManualInput("");
    }
  };

  return (
    <Container>
      <Header>
        <TitleGroup>
          <FaBarcode size={24} />
          <h1>Barcode System</h1>
        </TitleGroup>

        <TestBox onSubmit={handleManualSubmit}>
          <input
            placeholder="Scan or Type Barcode..."
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            autoFocus
          />
          <button type="submit">Check</button>
        </TestBox>
      </Header>

      <Content>
        <ProductGrid>
          {products.map((product) => (
            <ProductCard key={product.id}>
              <CardHeader>
                <ProductName>{product.name}</ProductName>
                <CategoryBadge>{product.category}</CategoryBadge>
              </CardHeader>

              <BarcodeWrapper>
                <Barcode value={product.barcode} width={1.5} height={50} />
              </BarcodeWrapper>

              <CardFooter>
                <span>Stock: {product.stock}</span>
                <PrintBtn
                  onClick={() => alert(`Print label for ${product.name}`)}
                >
                  <FaPrint /> Print
                </PrintBtn>
              </CardFooter>
            </ProductCard>
          ))}
        </ProductGrid>
      </Content>

      {/* ===== Scan Result Modal ===== */}
      {scannedProduct && (
        <Overlay onClick={() => setScannedProduct(null)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h2>Scan Result</h2>
              <CloseBtn onClick={() => setScannedProduct(null)}>
                <FaTimes />
              </CloseBtn>
            </ModalHeader>

            <ModalBody>
              <FaBoxOpen size={60} color="#2ecc71" />
              <ResultTitle>{scannedProduct.name}</ResultTitle>
              <ResultBarcode>{scannedProduct.barcode}</ResultBarcode>

              <InfoGrid>
                <InfoItem>
                  <label>Category</label>
                  <span>{scannedProduct.category}</span>
                </InfoItem>
                <InfoItem>
                  <label>Location</label>
                  <span>{scannedProduct.location}</span>
                </InfoItem>
                <InfoItem>
                  <label>Price</label>
                  <span>₩{scannedProduct.price.toLocaleString()}</span>
                </InfoItem>
                <InfoItem>
                  <label>Stock</label>
                  <StockValue>{scannedProduct.stock} EA</StockValue>
                </InfoItem>
              </InfoGrid>

              <DescBox>
                <h4>Description</h4>
                <p>{scannedProduct.description}</p>
              </DescBox>
            </ModalBody>
          </ModalContent>
        </Overlay>
      )}
    </Container>
  );
};

export default BarcodePage;

/* =========================
   Styled Components
========================= */

const Container = styled.div`
  width: 100%;
  height: 100%;
  padding: 20px;
  background: #f5f6fa;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const TitleGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  h1 {
    font-size: 24px;
    margin: 0;
  }
`;

const TestBox = styled.form`
  display: flex;
  gap: 10px;
  input {
    padding: 8px 12px;
    width: 250px;
  }
`;

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
`;

const ProductCard = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
`;

const ProductName = styled.div`
  font-weight: 600;
`;

const CategoryBadge = styled.span`
  font-size: 11px;
  background: #eef2f7;
  padding: 4px 8px;
  border-radius: 4px;
`;

const BarcodeWrapper = styled.div`
  margin: 10px 0;
`;

const CardFooter = styled.div`
  display: flex;
  justify-content: space-between;
`;

const PrintBtn = styled.button`
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalContent = styled.div`
  background: white;
  width: 500px;
  border-radius: 12px;
  overflow: hidden;
`;

const ModalHeader = styled.div`
  padding: 20px;
  display: flex;
  justify-content: space-between;
`;

const CloseBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
`;

const ModalBody = styled.div`
  padding: 30px;
  text-align: center;
`;

const ResultTitle = styled.h3`
  margin: 10px 0;
`;

const ResultBarcode = styled.div`
  font-family: monospace;
  background: #f0f0f0;
  padding: 4px 12px;
  border-radius: 20px;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin: 25px 0;
`;

const InfoItem = styled.div`
  label {
    font-size: 12px;
    color: #888;
  }
`;

const StockValue = styled.span`
  color: #2ecc71;
  font-weight: bold;
`;

const DescBox = styled.div`
  background: #f9f9f9;
  padding: 15px;
  border-radius: 8px;
`;
