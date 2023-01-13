// log
import store from "../store";

const fetchDataRequest = () => {
  return {
    type: "CHECK_DATA_REQUEST",
  };
};

const fetchDataSuccess = (payload) => {
  return {
    type: "CHECK_DATA_SUCCESS",
    payload: payload,
  };
};

const fetchDataFailed = (payload) => {
  return {
    type: "CHECK_DATA_FAILED",
    payload: payload,
  };
};

export const fetchData = () => {
  return async (dispatch) => {
    dispatch(fetchDataRequest());
    try {
      let account = await store.getState()["blockchain"]["account"];
      let earned = await store
        .getState()
        .blockchain.smartContract.methods.earned(account)
        .call();
      let rewardPerToken = await store
        .getState()
        .blockchain.smartContract.methods.rewardPerToken()
        .call();
      let clpAllowance = await store
        .getState()
        .blockchain.clpSmartContract.methods.allowance(String(account), '0xd99A2f8CE0c503363f81484220113A9CAfE44DC3')
        .call();
      let totalSupply = await store
        .getState()
        .blockchain.smartContract.methods.totalSupply()
        .call();

      dispatch(
        fetchDataSuccess({
          account,
          earned,
          rewardPerToken,
          clpAllowance,
          totalSupply,
        })
      );
    } catch (err) {
      console.log(err);
      dispatch(fetchDataFailed("Could not load data from contract."));
    }
  };
};
