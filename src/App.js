import {
  BrowserRouter as Router,
  Routes,
  Route
} from "react-router-dom";

import Home from './pages/Home';
import store from './redux/store';
import { Provider } from 'react-redux';

function App() {
  return (
    <Router>
      <Provider store={store}>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </Provider>
    </Router>
  );
}

export default App;
