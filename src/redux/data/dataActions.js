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
      let rewardPerTokenStored = await store
        .getState()
        .blockchain.smartContract.methods.rewardPerTokenStored()
        .call();
      let clpAllowance = await store
        .getState()
        .blockchain.clpSmartContract.methods.allowance(String(account), '0xB9637E7ab7358A0246d275786EE940Da12EE96A5')
        .call();

      dispatch(
        fetchDataSuccess({
          account,
          earned,
          rewardPerTokenStored,
          clpAllowance,
        })
      );
    } catch (err) {
      console.log(err);
      dispatch(fetchDataFailed("Could not load data from contract."));
    }
  };
};
