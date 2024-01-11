import React from 'react'
import styled from "styled-components";

const TopBar = () => {
  return (
    <Container>
      <div>
        AMOUNT
      </div>
      <div>
        COUNT
      </div>
      <div>
        PRICE
      </div>
      <div>
        PRICE
      </div>
      <div>
        COUNT
      </div>
      <div>
        AMOUNT
      </div>
    </Container>
  )
}

export default TopBar;

const Container = styled.div`
  height: 10%;
  width: 100%;
  display: flex;
  color: #bfc1c8;
  flex-direction: row;
  align-items: center;
  justify-content: space-around;
  /* background: red; */

`;