import { gql } from "@apollo/client";

export const GET_LPDATA = gql`
    {
        liquidityPositionSnapshots(subgraphError: allow, orderDirection: desc, orderBy: timestamp,first: 1, where: {pair: "0x013dc10923ce63381627ce195f710bc8cc81a8c9"} ) {
            timestamp
            reserveUSD
            liquidityTokenBalance
            liquidityTokenTotalSupply
            pair {
                id
                reserveUSD
            }
        }
        pair(id: "0x5cec0ccc21d2eb89a0613f6ca4b19b07c75909b0") {
            token1Price
        }
        token(id: "0xc6c6239614723298591f16bb2f779c9199b5ab1a") {
            derivedETH
        }
    }
`;