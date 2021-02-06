import { BrowserRouter } from 'react-router-dom';
import 'semantic-ui-css/semantic.min.css';
import Router from './Router';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Router />
      </BrowserRouter>
    </div>
  );
}

export default App;
