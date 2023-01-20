import { useDispatch, useSelector } from 'react-redux';
import { connect } from '../redux/blockchain/blockchainActions';
import { fetchData } from '../redux/data/dataActions';
import { useState, useEffect } from 'react';
import bgimg from '../assets/bgimg.png';
import EWTlogo from '../assets/EWTlogo.png';
import shellcoin from '../assets/shellcoin.png';
import susucoin from '../assets/susu.png';
import synthetix from '../assets/synthetix.png';
import work from '../assets/work.jpg';
import turtlefarmicon from '../assets/tttlogofarm.png';
import useColorChange from 'use-color-change';
import store from '../redux/store';
import Lightbox from "react-image-lightbox";
import "react-image-lightbox/style.css";
import { useQuery } from '@apollo/client';
import { GET_LPDATA } from '../queries/lpdata';

const Home = () => {
    /* global BigInt */
    const dispatch = useDispatch();
    const blockchain = useSelector((state) => state.blockchain);
    const bcdata = useSelector((state) => state.data);
    const [CONFIG, SET_CONFIG] = useState({
        CONTRACT_ADDRESS: "",
        CONTRACT_ADDRESS_SHL: "",
        CONTRACT_ADDRESS_CLP: "", 
        NETWORK: {
            NAME: "",
            SYMBOL: "",
            ID: 0,
        },
        GAS_LIMIT: 0,
    });

    const getConfig = async () => {
        const configResponse = await fetch('/config/config.json', {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
        });
        const config = await configResponse.json();
        SET_CONFIG(config);
    };

    useEffect(() => {
        getConfig();
    }, []);

    const getData = () => {
        if (blockchain.account !== "" && blockchain.smartContract !== null) {
            dispatch(fetchData(blockchain.account));
        }
    };

    useEffect(() => {
        getData();
    }, [blockchain.account]);

    window.addEventListener('load', function () {
        startApp();
    })
    async function startApp() {
        window.ethereum.sendAsync({
            method: "eth_accounts",
            params: [],
            jsonrpc: "2.0",
            id: new Date().getTime()
        }, function (error, result) {
            if (result["result"] !== "") dispatch(connect());
        });
    }

    const [userHasApprovedCLP, setUserHasApprovedCLP] = useState(false);
    const [userEarnedSHL, setUserEarnedSHL] = useState(0);
    const [userStakedCLP, setUserStakedCLP] = useState(0);

    const [userSHLBalance, setUserSHLBalance] = useState(0);
    const getUserSHLBalance = async () => {
        if (blockchain.account !== "") {
            const response = await fetch(
                `https://explorer.energyweb.org/api?module=account&action=tokenbalance&contractaddress=${CONFIG.CONTRACT_ADDRESS_SHL}&address=${String(blockchain.account)}`
            ).then((response) => response.json());
            if (response["result"] !== null && response["result"] !== undefined) {
                setUserSHLBalance(BigInt(response["result"])/BigInt(1e+18));
            }
        }
    };
    const [userCLPBalance, setUserCLPBalance] = useState(0);
    const getUserCLPBalance = async () => {
        if (blockchain.account !== "") {
            const response = await fetch(
                `https://explorer.energyweb.org/api?module=account&action=tokenbalance&contractaddress=${CONFIG.CONTRACT_ADDRESS_CLP}&address=${String(blockchain.account)}`
            ).then((response) => response.json());
            if (response["result"] !== null && response["result"] !== undefined) {
                setUserCLPBalance(BigInt(response["result"]));
            }
        }
    };

    // Calculate the value of the CLP token
    const [clpTokensInFarm, setClpTokensInFarm] = useState(0);
    const [braveShieldError, setBraveShieldError] = useState(false);
    const getClpTokensInFarm = async () => {
        try {
            const response = await fetch(
                `https://explorer.energyweb.org/api?module=account&action=tokenbalance&contractaddress=0x013Dc10923Ce63381627Ce195F710Bc8cc81a8C9&address=0xd99A2f8CE0c503363f81484220113A9CAfE44DC3`
            ).then((response) => response.json());
            if (response["result"] !== null && response["result"] !== undefined) {
                setClpTokensInFarm(response["result"]/1e+18);
            }
        } catch {setBraveShieldError(true)}
    };

    const [clpTokensTotalSupply, setClpTokensTotalSupply] = useState(0);
    const getTokensTotalSupply = async () => {
        try {
            const response = await fetch(
                `https://explorer.energyweb.org/api?module=stats&action=tokensupply&contractaddress=0x013Dc10923Ce63381627Ce195F710Bc8cc81a8C9`
            ).then((response) => response.json());
            if (response["result"] !== null && response["result"] !== undefined) {
                setClpTokensTotalSupply(response["result"]/1e+18);
            }
        } catch {setBraveShieldError(true)}
    };
    
    const [reserveUSD, setReserveUSD] = useState(0);
    var { loading, error, data } = useQuery(GET_LPDATA);
    useEffect(() => {
        if (data !== undefined && data !== null) {
            setReserveUSD(parseFloat(data["liquidityPositionSnapshots"][0]["reserveUSD"]).toFixed(3));
        }
    }, [loading]);

    const [LPvaluePerToken, setLPvaluePerToken] = useState(0);
    useEffect(() => {
        getClpTokensInFarm();
        getTokensTotalSupply();
        if (parseFloat(reserveUSD) >= 0 && parseFloat(clpTokensTotalSupply) >= 0) {
            setLPvaluePerToken((parseFloat(reserveUSD)/parseFloat(clpTokensTotalSupply)));
        }
    }, [reserveUSD, clpTokensTotalSupply]);
    // --------------------------------------------------

    useEffect(() => {
        getUserSHLBalance();
        getUserCLPBalance();
    }, [blockchain.account, CONFIG]);

    async function getEarnedRewards() {
        try {
            let earned = await store
                .getState()
                .blockchain.smartContract.methods.earned(String(bcdata.account))
                .call();
            setUserEarnedSHL(BigInt(earned)/BigInt(1e+16));
        } catch (error) {
            return;
        }
    }

    async function getStakedCLP() {
        try {
            let stakedCLP = await store
                .getState()
                .blockchain.smartContract.methods.balanceOf(String(bcdata.account))
                .call();
                setUserStakedCLP(stakedCLP/1e+18);
        } catch (error) {
            return;
        }
    }

    useEffect(() => {
        getEarnedRewards();
        getStakedCLP();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [blockchain, bcdata]);

    setInterval(function () {
        getEarnedRewards();
        getStakedCLP();
    }, 3000);

    const colorStyle = useColorChange(userEarnedSHL, {
        higher: "limegreen",
        lower: "crimson",
        duration: 2000
    });

    useEffect(() => {
        if (BigInt(bcdata.clpAllowance) > BigInt(1000000000000)) {
            setUserHasApprovedCLP(true);
        }
    }, [blockchain, bcdata]);

    async function approveSHLCLPtoContract() {
        let approveAmount = BigInt(10e+25);
        let cost = 0;
        let totalCostWei = String(cost);
        blockchain.clpSmartContract.methods.approve(String(CONFIG.CONTRACT_ADDRESS), approveAmount)
            .send({
                to: CONFIG.CONTRACT_ADDRESS,
                from: blockchain.account,
                value: totalCostWei,
                gasPrice: 100000000,
            }).then((receipt) => {
                console.log(`Transaction receipt: ${receipt}`)
                if (receipt["blockHash"] !== undefined && receipt["blockHash"] !== "") {
                    setUserHasApprovedCLP(true);
                }
            });
    }

    async function claimAllLPRewards() {
        let cost = 0;
        let totalCostWei = String(cost);
        blockchain.smartContract.methods.getReward()
            .send({
                to: CONFIG.CONTRACT_ADDRESS,
                from: blockchain.account,
                value: totalCostWei,
                gasPrice: 100000000,
            }).then((receipt) => {
                console.log(`Transaction receipt: ${receipt}`)
                if (receipt["blockHash"] !== undefined && receipt["blockHash"] !== "") {
                    getUserSHLBalance();
                    getUserCLPBalance();
                }
            });
    }

    const [isOpen, setIsOpen] = useState(false);
    async function stakeCustomAmount() {
        let customAmountCLP = document.getElementById('customAmountCLP').value
        customAmountCLP = BigInt(customAmountCLP * 1e+18);
        console.log(`Staking: ${customAmountCLP} CLP`);
        let cost = 0;
        let totalCostWei = String(cost);
        blockchain.smartContract.methods.stake(customAmountCLP)
            .send({
                to: CONFIG.CONTRACT_ADDRESS,
                from: blockchain.account,
                value: totalCostWei,
                gasPrice: 100000000,
            }).then((receipt) => {
                console.log(`Transaction receipt: ${receipt}`)
                if (receipt["blockHash"] !== undefined && receipt["blockHash"] !== "") {
                    if ((BigInt(customAmountCLP) / BigInt(1e+18)) <= 1) {
                        setIsOpen(true);
                    }
                }
                getUserSHLBalance();
                getUserCLPBalance();
            });
    }

    // -----------------------------------------
    async function stakeAllUserCLP() {
        let cost = 0;
        let totalCostWei = String(cost);
        console.log(`Staking: ${BigInt(userCLPBalance)} CLP`);
        blockchain.smartContract.methods.stake(BigInt(userCLPBalance))
            .send({
                to: CONFIG.CONTRACT_ADDRESS,
                from: blockchain.account,
                value: totalCostWei,
                gasPrice: 100000000,
            }).then((receipt) => {
                console.log(`Transaction receipt: ${receipt}`)
                if (receipt["blockHash"] !== undefined && receipt["blockHash"] !== "") {
                    if (BigInt(userCLPBalance) / BigInt(1e+18) <= 1) {
                        setIsOpen(true);
                    }
                }
                getUserSHLBalance();
                getUserCLPBalance();
            })
    }
    
    async function unstakeAllUserCLP() {
        let cost = 0;
        let totalCostWei = String(cost);
        blockchain.smartContract.methods.exit()
            .send({
                to: CONFIG.CONTRACT_ADDRESS,
                from: blockchain.account,
                value: totalCostWei,
                gasPrice: 100000000,
            }).then((receipt) => {
                console.log(`Transaction receipt: ${receipt}`)
                getUserSHLBalance();
                getUserCLPBalance();
            })
    }
    // -----------------------------------------

    // Get SHL price
    const [shlPrice, setShlPrice] = useState(0);
    useEffect(() => {
        if (data !== undefined) {
            setShlPrice(parseFloat(data["token"]["derivedETH"])*parseFloat(data["pair"]["token1Price"]))
        }
    }, [loading, data]);

    // Calculate APY
    const [apyPercentage, setApyPercentage] = useState(0);
    const [userEstimatedEarningsPerDayInSHL, setUserEstimatedEarningsPerDayInSHL] = useState(0);
    function calculateLP_APY() {
        if (userStakedCLP > 0 && clpTokensInFarm > 0) { 
            let percentageUserOfPool = parseFloat((userStakedCLP)/(clpTokensInFarm));
            let userEarningsPerSecond = 0.786*percentageUserOfPool;
            let userEarningsPerYear = userEarningsPerSecond*60*60*24*365;
            setUserEstimatedEarningsPerDayInSHL(userEarningsPerYear/365);
            
            let userEarningsPerYearInUSD = userEarningsPerYear*shlPrice
            let userInvestmentInUSD = LPvaluePerToken*userStakedCLP
            let calculatedAPY = userEarningsPerYearInUSD/userInvestmentInUSD*100;
            setApyPercentage(calculatedAPY.toFixed(2));
        }
    }

    useEffect(() => {
        calculateLP_APY();
    }, [userStakedCLP, shlPrice, LPvaluePerToken, clpTokensInFarm]);

    console.log('SHL price: ', shlPrice)
    console.log('USD value of 1 CLP: ', LPvaluePerToken)
    console.log('Amount staked CLP by user: ', userStakedCLP)

    return (
        <div className="flex flex-col mx-auto w-[96%] md:w-[88%] lg:w-[83%] xl:w-[76%] min-h-[100vh] py-4 sm:py-8 md:py-12 lg:py-16">
            <img className='bgimg fixed top-0 left-0 w-full h-full object-cover z-[-1]' src={bgimg} alt="the background" />

            <div className='rounded-xl sm:rounded-2xl 3xs:px-[2px] 2xs:px-1 xs:px-2 s:px-3 px-4 pt-6 sm:pt-8 pb-20 md:pb-16 flex flex-col bg-[rgb(245,245,255)]'>
                {blockchain.account === "" || blockchain.smartContract === null ? (
                <div> {/* Unconnected */}
                    <h1 className='mb-1 sm:mb-2 md:mb-3 text-lg md:text-xl lg:text-2xl text-center'>Welcome to the SeaShell<img className='inline h-6 w-6 ml-1 -translate-y-[2px]' src={shellcoin} alt="" /> liquidity farm!</h1>
                    <img className='mx-auto mb-1 sm:mb-2 md:mb-3 aspect-square w-[8em] md:w-[11em] lg:w-[14em] rounded-3xl sm:rounded-[2rem] md:rounded-[2.5rem] lg:rounded-[3.0rem]' src={turtlefarmicon} alt="" />
                    <h2 className='mb-1 sm:mb-2 md:mb-3 text-base md:text-lg lg:text-xl text-center'>Here you can stake your EWT/SHL liquidity pool tokens to earn SHL!</h2>
                    <h2 className='text-base md:text-lg lg:text-xl text-center'>To get EWT/SHL liquidity pool tokens (CLP) you first need to provide liquidity on <img 
                        className='inline h-6 w-6 mr-1 -translate-y-[2px]' src={susucoin} alt="" /><a className='text-blue-500 hover:text-purple-500' href='https://carbonswap.exchange/#/pool' rel='noreferrer' target='_blank'>Carbonswap</a> for the pair EWT/SHL. Here you can find a quick guide on how to provide liquidity to Carbonswap: <a 
                            className='text-blue-500 hover:text-purple-500' rel='noreferrer' target='_blank' href="https://docs.unbound.finance/guides/guide-to-adding-liquidity-to-uniswap-v2">guide-to-adding-liquidity-to-uniswap-v2</a> (the tutorial is for Uniswap, but Carbonswap works very similar).
                    </h2>
                    <h2 className='mb-4 sm:mb-5 md:mb-6 lg:mb-7 text-base md:text-lg lg:text-xl text-center'>Also please understand the risks of 'impermanent loss' before providing liquidity: <a 
                        className='text-blue-500 hover:text-purple-500' href='https://academy.binance.com/en/articles/impermanent-loss-explained' rel='noreferrer' target='_blank'>Impermanent loss explained</a>
                    </h2>
                    <div className='flex items-center justify-center mx-auto gradientAnimate rounded-[2rem] md:rounded-[2.5rem] w-[95%] sm:w-[90%] md:w-[85%] lg:w-[70%] xl:w-[60%] 2xl:w-[50%] 3xl:w-[40%] aspect-[8/10]'>
                        <div className='flex flex-col relative z-[99] py-5 px-3 sm:py-6 sm:px-4 md:py-7 md:px-5'>
                            <div className='flex flex-col'>
                            <div className='flex flex-col mx-auto'>
                                    <h1 className='xs:text-base text-lg md:text-xl lg:text-2xl text-center font-semibold'>Stake</h1>
                                    <div className='flex flex-row mx-auto'>
                                        <img className='xs:h-10 xs:w-10 s:h-12 s:w-12 h-14 w-14 mx-2' src={EWTlogo} alt="" />
                                        <img className='xs:h-10 xs:w-10 s:h-12 s:w-12 h-14 w-14 mx-2' src={shellcoin} alt="" />
                                    </div>
                                </div>
                                <div className='flex flex-col mx-auto'>
                                    <h1 className='xs:text-base text-lg md:text-xl lg:text-2xl text-center font-semibold'>Reward</h1>
                                    <img className='xs:h-8 xs:w-8 s:h-9 s:w-9 h-10 w-10 mx-auto' src={shellcoin} alt="" />
                                </div>
                            </div>
                            <button className='mt-4 xs:text-base text-lg md:text-xl flex text-center pl-1 pr-2 mx-auto justify-center
                            rounded-lg items-center bg-green-500 border-b-[3px] md:border-b-[5px] 
                            border-[rgb(24,136,65)] hover:brightness-[1.05] md:active:border-b-[3px] md:active:translate-y-[2px] 
                            active:border-b-[1px] active:translate-y-[2px]' onClick={(e) => {
                                e.preventDefault();
                                dispatch(connect());
                                getData();
                            }}>
                            <svg className='w-[35px] h-[35px] sm:w-[40px] sm:h-[40px] md:w-[45px] md:h-[45px]' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 318.6 318.6" strokeLinejoin="round">
                                <path d="M274.1 35.5l-99.5 73.9L193 65.8z" fill="#e2761b" stroke="#e2761b">
                                </path><g fill="#e4761b" stroke="#e4761b"><path d="M44.4 35.5l98.7 74.6-17.5-44.3zm193.9 171.3l-26.5 40.6 56.7 15.6 16.3-55.3z"></path><path d="M33.9 207.7L50.1 263l56.7-15.6-26.5-40.6zm69.7-69.5l-15.8 23.9 56.3 2.5-2-60.5z"></path><path d="M214.9 138.2l-39-34.8-1.3 61.2 56.2-2.5zM106.8 247.4l33.8-16.5-29.2-22.8zm71.1-16.5l33.9 16.5-4.7-39.3z"></path></g><path d="M211.8 247.4l-33.9-16.5 2.7 22.1-.3 9.3zm-105 0l31.5 14.9-.2-9.3 2.5-22.1z" fill="#d7c1b3" stroke="#d7c1b3"></path><path d="M138.8 193.5l-28.2-8.3 19.9-9.1zm40.9 0l8.3-17.4 20 9.1z" fill="#233447" stroke="#233447"></path><path d="M106.8 247.4l4.8-40.6-31.3.9zM207 206.8l4.8 40.6 26.5-39.7zm23.8-44.7l-56.2 2.5 5.2 28.9 8.3-17.4 20 9.1zm-120.2 23.1l20-9.1 8.2 17.4 5.3-28.9-56.3-2.5z" fill="#cd6116" stroke="#cd6116"></path><path d="M87.8 162.1l23.6 46-.8-22.9zm120.3 23.1l-1 22.9 23.7-46zm-64-20.6l-5.3 28.9 6.6 34.1 1.5-44.9zm30.5 0l-2.7 18 1.2 45 6.7-34.1z" fill="#e4751f" stroke="#e4751f"></path><path d="M179.8 193.5l-6.7 34.1 4.8 3.3 29.2-22.8 1-22.9zm-69.2-8.3l.8 22.9 29.2 22.8 4.8-3.3-6.6-34.1z" fill="#f6851b" stroke="#f6851b"></path><path d="M180.3 262.3l.3-9.3-2.5-2.2h-37.7l-2.3 2.2.2 9.3-31.5-14.9 11 9 22.3 15.5h38.3l22.4-15.5 11-9z" fill="#c0ad9e" stroke="#c0ad9e"></path><path d="M177.9 230.9l-4.8-3.3h-27.7l-4.8 3.3-2.5 22.1 2.3-2.2h37.7l2.5 2.2z" fill="#161616" stroke="#161616"></path><path d="M278.3 114.2l8.5-40.8-12.7-37.9-96.2 71.4 37 31.3 52.3 15.3 11.6-13.5-5-3.6 8-7.3-6.2-4.8 8-6.1zM31.8 73.4l8.5 40.8-5.4 4 8 6.1-6.1 4.8 8 7.3-5 3.6 11.5 13.5 52.3-15.3 37-31.3-96.2-71.4z" fill="#763d16" stroke="#763d16"></path><path d="M267.2 153.5l-52.3-15.3 15.9 23.9-23.7 46 31.2-.4h46.5zm-163.6-15.3l-52.3 15.3-17.4 54.2h46.4l31.1.4-23.6-46zm71 26.4l3.3-57.7 15.2-41.1h-67.5l15 41.1 3.5 57.7 1.2 18.2.1 44.8h27.7l.2-44.8z" fill="#f6851b" stroke="#f6851b"></path>
                            </svg>
                            Connect
                            </button>
                            <h1 className='xs:text-base text-lg md:text-xl lg:text-2xl text-center px-2'>You first have to connect with your Metamask</h1>
                        </div>
                    </div>
                    <div className='w-full flex justify-center'>
                        <p className='3xs:text-xs xs:text-sm text-base absolute z-[300] translate-y-7 translate-x-2 text-center'>Powered by Synthetix <img className='inline aspect-square w-5' src={synthetix} alt="" /></p>
                    </div>
                </div>
                ) : (
                <div className='p-2 sm:p-3 md:p-4'> {/* Connected */}
                {isOpen && <Lightbox
                    mainSrc={work}
                    onCloseRequest={() => setIsOpen(false)}
                    enableZoom={false}
                />}
                    <h1 className='mb-1 sm:mb-2 md:mb-3 text-lg md:text-xl lg:text-2xl text-center'>Welcome <span className='bg-[rgba(100,100,240,0.15)] break-words px-1 rounded-md'>{blockchain.account}</span> to the SeaShell<img className='inline h-6 w-6 ml-1 -translate-y-[2px]' src={shellcoin} alt="" /> liquidity farm!</h1>
                    <img className='mx-auto mb-1 sm:mb-2 md:mb-3 aspect-square w-[8em] md:w-[11em] lg:w-[14em] rounded-3xl sm:rounded-[2rem] md:rounded-[2.5rem] lg:rounded-[3.0rem]' src={turtlefarmicon} alt="" />
                    <h2 className='mb-1 sm:mb-2 md:mb-3 text-base md:text-lg lg:text-xl text-center'>Here you can stake your EWT/SHL liquidity pool tokens to earn SHL!</h2>
                    <h2 className='text-base md:text-lg lg:text-xl text-center'>To get EWT/SHL liquidity pool tokens (CLP) you first need to provide liquidity on <img 
                        className='inline h-6 w-6 mr-1 -translate-y-[2px]' src={susucoin} alt="" /><a className='text-blue-500 hover:text-purple-500' href='https://carbonswap.exchange/#/pool' rel='noreferrer' target='_blank'>Carbonswap</a> for the pair EWT/SHL. Here you can find a quick guide on how to provide liquidity to Carbonswap: <a 
                            className='text-blue-500 hover:text-purple-500' rel='noreferrer' target='_blank' href="https://docs.unbound.finance/guides/guide-to-adding-liquidity-to-uniswap-v2">guide-to-adding-liquidity-to-uniswap-v2</a> (the tutorial is for Uniswap, but Carbonswap works very similar).
                    </h2>
                    <h2 className='mb-4 sm:mb-5 md:mb-6 lg:mb-7 text-base md:text-lg lg:text-xl text-center'>Also please understand the risks of 'impermanent loss' before providing liquidity: <a 
                        className='text-blue-500 hover:text-purple-500' href='https://academy.binance.com/en/articles/impermanent-loss-explained' rel='noreferrer' target='_blank'>Impermanent loss explained</a>
                    </h2>
                    {braveShieldError === false ? ( 
                        <></>
                    ) : (
                        <div className='text-[rgba(230,110,110)] mb-5 sm:mb-7 px-4 sm:px-8 md:px-16 text-center s:text-xs text-sm sm:text-base md:text-lg lg:text-xl mx-auto'>Your shield is blocking the requests to gather some of the statistics. You can take your Brave browser shield down🙂. There are no ads here.</div>
                    )}
                    <div className='flex items-center justify-center mx-auto gradientAnimate rounded-[2rem] md:rounded-[2.5rem] w-[95%] sm:w-[90%] md:w-[85%] lg:w-[70%] xl:w-[60%] 2xl:w-[50%] 3xl:w-[40%] aspect-[8/10]'>
                        <div className='flex flex-col relative z-[99] py-5 px-3 sm:py-6 sm:px-4 md:py-7 md:px-5'>
                            <div className='flex flex-col'>
                                <div className='flex flex-col mx-auto'>
                                    <h1 className='3xs:text-xs 2xs:text-sm xs:text-base text-lg md:text-xl lg:text-2xl text-center font-semibold'>Stake</h1>
                                    <div className='flex flex-row mx-auto'>
                                        <img className='3xs:h-6 3xs:w-6 2xs:h-8 2xs:w-8 xs:h-10 xs:w-10 s:h-12 s:w-12 h-14 w-14 mx-2' src={EWTlogo} alt="" />
                                        <img className='3xs:h-6 3xs:w-6 2xs:h-8 2xs:w-8 xs:h-10 xs:w-10 s:h-12 s:w-12 h-14 w-14 mx-2' src={shellcoin} alt="" />
                                    </div>
                                </div>
                                <div className='flex flex-col mx-auto'>
                                    <h1 className='3xs:text-xs 2xs:text-sm xs:text-base text-lg md:text-xl lg:text-2xl text-center font-semibold'>Reward</h1>
                                    <img className='3xs:h-4 3xs:w-4 2xs:h-6 2xs:w-6 xs:h-8 xs:w-8 s:h-9 s:w-9 h-10 w-10 mx-auto' src={shellcoin} alt="" />
                                </div>
                                {userHasApprovedCLP === true ? (
                            <div>
                                <div className='flex flex-col mx-auto mb-1'>
                                    <h1 className='xs:text-base text-lg md:text-xl lg:text-2xl text-center font-semibold'>Your SHL balance: {parseFloat((userSHLBalance.toString())).toFixed(2)}</h1>
                                    <h1 className='xs:text-base text-lg md:text-xl lg:text-2xl text-center font-semibold'>Your CLP balance: {((parseFloat(userCLPBalance)/1e+18)).toFixed(5)}</h1>
                                </div>
                                    <button onClick={stakeAllUserCLP} className='my-1 2xs:my-[3px] 3xs:my-[2px] flex flex-row mx-auto bg-green-300 hover:brightness-110 rounded-xl sm:rounded-2xl md:rounded-2xl p-1 sm:p-2 md:p-3'>
                                        <h1 className='2xs:text-xs xs:text-sm text-base md:text-lg lg:text-xl text-center font-semibold flex my-auto'>Stake all your CLP</h1>
                                        <div className='flex flex-row mx-auto'>
                                            <img className='2xs:h-5 2xs:w-5 xs:h-6 xs:w-6 h-7 w-7 translate-x-[6px]' src={EWTlogo} alt="" />
                                            <img className='2xs:h-5 2xs:w-5 xs:h-6 xs:w-6 h-7 w-7 -translate-x-[6px]' src={shellcoin} alt="" />
                                        </div>
                                    </button>
                                    <div className='flex flex-row'>
                                        <input id='customAmountCLP' placeholder='amount to stake' className='border-gray-600 border-[3px] s:w-[160px] xs:w-[145px] 2xs:w-[125px] my-auto ml-1 mr-2 xs:mr-1 2xs:mx-[3px] 3xs:mx-[2px] rounded-md px-1 s:px-[3px] xs:px-[2px] 2xs:px-[1px] py-[1px] sm:py-[2px] md:py-[3px]' type="text" />
                                        <button onClick={stakeCustomAmount} className='my-1 2xs:my-[3px] 3xs:my-[2px] flex flex-row mx-auto bg-green-300 hover:brightness-110 rounded-xl sm:rounded-2xl md:rounded-2xl p-1 sm:p-2 md:p-3'>
                                            <div className='flex flex-row my-auto'>
                                                <h1 className='2xs:text-xs xs:text-sm text-base md:text-lg lg:text-xl text-center font-semibold flex my-auto'>Stake CLP</h1>
                                                <div className='flex flex-row mx-auto'>
                                                    <img className='2xs:h-5 2xs:w-5 xs:h-6 xs:w-6 h-7 w-7 translate-x-[6px]' src={EWTlogo} alt="" />
                                                    <img className='2xs:h-5 2xs:w-5 xs:h-6 xs:w-6 h-7 w-7 -translate-x-[6px]' src={shellcoin} alt="" />
                                                </div>
                                            </div>
                                        </button>
                                    </div>
                                    <button onClick={unstakeAllUserCLP} className='my-1 2xs:my-[3px] 3xs:my-[2px] flex flex-row mx-auto bg-red-300 hover:brightness-110 rounded-xl sm:rounded-2xl md:rounded-2xl p-1 sm:p-2 md:p-3'>
                                        <h1 className='2xs:text-xs xs:text-sm text-base md:text-lg lg:text-xl text-center font-semibold flex my-auto'>Unstake all your CLP</h1>
                                        <div className='flex flex-row mx-auto'>
                                            <img className='2xs:h-5 2xs:w-5 xs:h-6 xs:w-6 h-7 w-7 translate-x-[6px]' src={EWTlogo} alt="" />
                                            <img className='2xs:h-5 2xs:w-5 xs:h-6 xs:w-6 h-7 w-7 -translate-x-[6px]' src={shellcoin} alt="" />
                                        </div>
                                    </button>
                                <div className='xs:my-[1px] s:my-[2px] my-[3px] flex flex-col'>
                                    <div className='flex flex-col mx-auto mb-1'>
                                        <h1 className='xs:text-base text-lg md:text-xl lg:text-2xl text-center font-semibold'>Your staked CLP: {parseFloat((userStakedCLP.toString())).toFixed(4)}</h1>
                                        <h1 className='xs:text-base text-lg md:text-xl lg:text-2xl text-center font-semibold'>Your earned SHL: <span style={colorStyle}>{(parseFloat(userEarnedSHL)/100)}</span></h1>
                                        <h1 className='xs:text-sm text-base md:text-lg lg:text-xl text-center text-gray-600'>Estimated daily SHL rewards: <span style={colorStyle}>{(userEstimatedEarningsPerDayInSHL).toFixed(2)}</span></h1>
                                        <h1 className='xs:text-base text-lg md:text-xl lg:text-2xl text-center font-semibold'>APY: {apyPercentage}%</h1>
                                    </div>
                                </div>
                                <button onClick={claimAllLPRewards} className='my-1 2xs:my-[3px] 3xs:my-[2px] flex flex-row mx-auto bg-green-300 hover:brightness-110 rounded-xl sm:rounded-2xl md:rounded-2xl p-1 sm:p-2 md:p-3'>
                                    <h1 className='2xs:text-xs xs:text-sm text-base md:text-lg lg:text-xl text-center font-semibold flex my-auto'>Claim all rewards</h1>
                                    <div className='flex flex-row mx-auto'>
                                        <img className='2xs:h-5 2xs:w-5 xs:h-6 xs:w-6 h-7 w-7 ml-1 xs:ml-[3px]' src={shellcoin} alt="" />
                                    </div>
                                </button>
                            </div>
                                ) : (
                                    <div className='xs:my-[6px] s:my-[8px] my-[10px]'>
                                        <button onClick={approveSHLCLPtoContract} className='flex flex-row mx-auto bg-green-300 hover:brightness-110 rounded-xl sm:rounded-2xl md:rounded-2xl p-1 sm:p-2 md:p-3'>
                                            <h1 className='2xs:text-xs xs:text-sm text-base md:text-lg lg:text-xl text-center font-semibold flex my-auto'>Approve CLP</h1>
                                            <div className='flex flex-row mx-auto'>
                                                <img className='2xs:h-5 2xs:w-5 xs:h-6 xs:w-6 h-7 w-7 translate-x-[6px]' src={EWTlogo} alt="" />
                                                <img className='2xs:h-5 2xs:w-5 xs:h-6 xs:w-6 h-7 w-7 -translate-x-[6px]' src={shellcoin} alt="" />
                                            </div>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className='w-full flex justify-center'>
                        <p className='3xs:text-xs xs:text-sm text-base absolute z-[300] translate-y-7 translate-x-2'>Powered by Synthetix <img className='inline aspect-square w-5' src={synthetix} alt="" /></p>
                    </div>
                </div>)}
            </div>
        </div>
    );
}

export default Home;