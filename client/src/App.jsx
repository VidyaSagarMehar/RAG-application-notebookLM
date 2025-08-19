import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import RAGApp from './Components/RAGApp';

function App() {
	const [count, setCount] = useState(0);

	return (
		<>
			<RAGApp />
		</>
	);
}

export default App;
