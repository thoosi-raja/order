import React, { useEffect, useState } from 'react'
import useWebSocket from 'react-use-websocket';
import styled from "styled-components";
import PriceLevel from '../PriceLevel';
import DepthVisualizer from '../DepthVisualizer';
import TopBar from '../TopBar';

const WSS_FEED_URL = 'wss://api-pub.bitfinex.com/ws/2';
const OrderGraph = () => {

    const [bid, setBid] = useState({});
    const [bidCount, setBidCount] = useState(0);
    const [askCount, setAskCount] = useState(0);
    const [ask, setAsk] = useState({});

    const { sendJsonMessage, getWebSocket } = useWebSocket(WSS_FEED_URL, {
        onOpen: () => console.log('WebSocket connection opened.'),
        onClose: () => console.log('WebSocket connection closed.'),
        shouldReconnect: (closeEvent) => true,
        onMessage: (event) =>  constructData(JSON.parse(event.data))
    });
    useEffect(() => {
        const connect = () => {
            const unSubscribeMessage = {
                event: "unsubscribe",
                channel: "book",
                symbol: "tBTCUSD"
            };
            sendJsonMessage(unSubscribeMessage);
      
            const subscribeMessage = {
                event: "subscribe",
                channel: "book",
                symbol: "tBTCUSD"
            };
            sendJsonMessage(subscribeMessage);
        }
        connect();
    
      return () => {
        getWebSocket()?.close();
      }
    }, [])

    const processData = (orderData) => {
      let price = orderData[0];
      let count = orderData[1];
      let amount = orderData[2];
      if(count > 0) {
        if(amount > 0) {
          let newBid = {...bid};
          if(newBid[price] != undefined) {
            newBid[price] = {
              'amount': newBid[price].amount + amount,
              'count': newBid[price].count + count,
            }
          }
          else{
            newBid[price] = {
              'amount': amount,
              'count': count,
            }
          }
            setBidCount((oldCount) => oldCount + count);
            setBid(newBid);
        }
        else {
          let newAsk = {...ask};
          if(newAsk[price] != undefined) {
            newAsk[price] = {
              'amount': newAsk[price].amount + amount,
              'count': newAsk[price].count + count,
            }
          }
          else{
            newAsk[price] = {
              'amount': amount,
              'count': count,
            }
          }
          setAskCount((oldCount) => oldCount + count);
          setAsk(newAsk);
        }
      }
      else {
        if(amount = 1) {
          let newBid = {...bid};
          if(newBid[price] != undefined) {
            newBid[price] = {
              'amount': newBid[price].amount - amount,
              'count': newBid[price].count - count,
            }
            if(newBid[price].count < 0 && newBid[price].amount < 0) delete newBid[price];
          }
          setBidCount((oldCount) => oldCount - count);
          setBid(newBid);
        }
        else {
          let newAsk = {...ask};
          if(newAsk[price] != undefined) {
            newAsk[price] = {
              'amount': newAsk[price].amount - amount,
              'count': newAsk[price].count - count,
            }
            if(newAsk[price].count < 0 && newAsk[price].amount < 0) delete newAsk[price];
          }
          setAskCount((oldCount) => oldCount - count);
          setAsk(newAsk);
        }
      }
    }



    const constructData = (data) => {
      if(data.length > 0 && data[1].length > 3) {
        let oldData = data[1];
        oldData.forEach(order => processData(order));
      }
      else if(data.length > 0 && data[1].length > 2) {
        processData(data[1]);
      }
    }

    const sortOrders = (o, orderType) => {
      return Object.keys(o)
        .sort((a,b) => orderType === 'BID' ? b > a: a > b)
        .reduce((r, k) => (r[k] = o[k], r), {})
    }

    const formatNumber = (arg) => {
      return new Intl.NumberFormat('en-US').format(arg);
    };


    const buildPriceLevels = (levels, orderType)=> {
      const sortedLevelsByPrice= sortOrders(levels, orderType);
      return (
        Object.keys(sortedLevelsByPrice).map((level, idx) => {
          if(idx < (Object.keys(bid).length < 50 || Object.keys(ask).length < 50 ? Object.keys(bid).length > Object.keys(ask).length ? Object.keys(ask).length : Object.keys(bid).length : 50)) {
            console.log((sortedLevelsByPrice[level].count/bidCount)*100)
            const calculatedTotal = sortedLevelsByPrice[level].amount;
            const total = formatNumber(calculatedTotal);
            const depth = orderType === 'BID' ? (sortedLevelsByPrice[level].count/bidCount)*1000 : (sortedLevelsByPrice[level].count/askCount)*1000;
            const size = formatNumber(sortedLevelsByPrice[level].count);
            const price = level;
    
            return (
              <PriceLevelRowContainer key={idx}>
              <DepthVisualizer key={depth} depth={depth} orderType={orderType} />
                <PriceLevel key={size + total}
                              total={total}
                              size={size}
                              price={price}
                              reversedFieldsOrder={orderType === 'ASK'}
                              windowWidth={window.innerWidth} />
              </PriceLevelRowContainer>
            );
          }
        })
      );
    };
    
  return (
    <Container>
      <TopBar />
      <WrapContainer>
          <TableContainer>
              <div>{buildPriceLevels(bid, 'BID')}</div>
          </TableContainer>
          <TableContainer>
            <div>
              {buildPriceLevels(ask, 'ASK')}
            </div>
          </TableContainer>
      </WrapContainer>
    </Container>
  )
}

export default OrderGraph;

const Container = styled.div`
  display: flex;
  height: 100vh;
  width: 100hw;
  flex-direction: column;
  background: #121723;
`;

const WrapContainer = styled.div`
  display: flex;
  height: 90%;
  flex-direction: row;
  justify-content: flex-end;
  align-items: start;
  border-color: #263946;
  color: #000;
  background: #121723;
`;

const TableContainer = styled.div`
  display: flex;
  width: 50%;
  height: 100px;
  flex-direction: column;
  color: #bfc1c8;
`;
const PriceLevelRowContainer = styled.div`
  margin: .155em 0;
`
