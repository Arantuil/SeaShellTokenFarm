const initialState = {
  loading: false,
  account: "",
  earned: 0,
  rewardPerToken: 0,
  clpAllowance: 0,
  totalSupply: 0,
  error: false,
  errorMsg: "",
};

const dataReducer = (state = initialState, action) => {
  switch (action.type) {
    case "CHECK_DATA_REQUEST":
      return {
        ...state,
        loading: true,
        error: false,
        errorMsg: "",
      };
    case "CHECK_DATA_SUCCESS":
      return {
        ...state,
        loading: false,
        account: action.payload.account,
        earned: action.payload.earned,
        rewardPerToken: action.payload.rewardPerToken,
        clpAllowance: action.payload.clpAllowance,
        totalSupply: action.payload.totalSupply,
        error: false,
        errorMsg: "",
      };
    case "CHECK_DATA_FAILED":
      return {
        ...initialState,
        loading: false,
        error: true,
        errorMsg: action.payload,
      };
    default:
      return state;
  }
};

export default dataReducer;
