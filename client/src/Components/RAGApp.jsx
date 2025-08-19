import React, { useState, useRef, useEffect } from 'react';
import {
	Upload,
	Link,
	FileText,
	Database,
	Send,
	Loader2,
	CheckCircle,
	XCircle,
	AlertCircle,
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:3001/api';

export default function RAGApp() {
	const [messages, setMessages] = useState([]);
	const [inputMessage, setInputMessage] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [indexingStatus, setIndexingStatus] = useState('');
	const [urlInput, setUrlInput] = useState('');
	const [selectedCollection, setSelectedCollection] = useState(
		'chaicode-collection',
	);
	const [availableCollections, setAvailableCollections] = useState([
		'chaicode-collection',
		'mdn-docs-collection',
		'csv-collection',
	]);
	const [error, setError] = useState('');

	const fileInputRef = useRef(null);
	const csvInputRef = useRef(null);

	// Load collections on component mount
	useEffect(() => {
		loadCollections();
		checkServerHealth();
	}, []);

	const checkServerHealth = async () => {
		try {
			const response = await fetch(`${API_BASE_URL}/health`);
			if (!response.ok) {
				setError('Backend server is not responding');
			} else {
				setError('');
			}
		} catch (err) {
			setError(
				"Cannot connect to backend server. Make sure it's running on port 3001",
			);
		}
	};

	const loadCollections = async () => {
		try {
			const response = await fetch(`${API_BASE_URL}/collections`);
			if (response.ok) {
				const data = await response.json();
				setAvailableCollections(data.collections);
			}
		} catch (err) {
			console.error('Failed to load collections:', err);
		}
	};

	const handleIndexPDF = async (file) => {
		setIndexingStatus('Indexing PDF...');
		setError('');

		const formData = new FormData();
		formData.append('pdf', file);
		formData.append('collection', selectedCollection);

		try {
			const response = await fetch(`${API_BASE_URL}/index/pdf`, {
				method: 'POST',
				body: formData,
			});

			const data = await response.json();

			if (response.ok) {
				setIndexingStatus(`✅ ${data.message}`);
				setTimeout(() => setIndexingStatus(''), 4000);
			} else {
				setIndexingStatus(`❌ Error: ${data.error}`);
				setError(data.details || data.error);
				setTimeout(() => setIndexingStatus(''), 5000);
			}
		} catch (err) {
			setIndexingStatus('❌ Failed to index PDF');
			setError('Network error. Check if backend server is running.');
			setTimeout(() => setIndexingStatus(''), 5000);
		}
	};

	const handleIndexURL = async () => {
		if (!urlInput.trim()) return;

		setIndexingStatus('Indexing URL...');
		setError('');

		try {
			const response = await fetch(`${API_BASE_URL}/index/url`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					url: urlInput,
					collection: selectedCollection,
				}),
			});

			const data = await response.json();

			if (response.ok) {
				setIndexingStatus(`✅ ${data.message}`);
				setUrlInput('');
				setTimeout(() => setIndexingStatus(''), 4000);
			} else {
				setIndexingStatus(`❌ Error: ${data.error}`);
				setError(data.details || data.error);
				setTimeout(() => setIndexingStatus(''), 5000);
			}
		} catch (err) {
			setIndexingStatus('❌ Failed to index URL');
			setError('Network error. Check if backend server is running.');
			setTimeout(() => setIndexingStatus(''), 5000);
		}
	};

	const handleIndexCSV = async (file) => {
		setIndexingStatus('Indexing CSV...');
		setError('');

		const formData = new FormData();
		formData.append('csv', file);
		formData.append('collection', selectedCollection);

		try {
			const response = await fetch(`${API_BASE_URL}/index/csv`, {
				method: 'POST',
				body: formData,
			});

			const data = await response.json();

			if (response.ok) {
				setIndexingStatus(`✅ ${data.message}`);
				setTimeout(() => setIndexingStatus(''), 4000);
			} else {
				setIndexingStatus(`❌ Error: ${data.error}`);
				setError(data.details || data.error);
				setTimeout(() => setIndexingStatus(''), 5000);
			}
		} catch (err) {
			setIndexingStatus('❌ Failed to index CSV');
			setError('Network error. Check if backend server is running.');
			setTimeout(() => setIndexingStatus(''), 5000);
		}
	};

	const handleFileUpload = (event, type) => {
		const file = event.target.files[0];
		if (file) {
			if (type === 'pdf') {
				handleIndexPDF(file);
			} else if (type === 'csv') {
				handleIndexCSV(file);
			}
		}
	};

	const handleSendMessage = async () => {
		if (!inputMessage.trim()) return;

		const userMessage = {
			role: 'user',
			content: inputMessage,
			timestamp: Date.now(),
		};
		setMessages((prev) => [...prev, userMessage]);
		setIsLoading(true);
		setError('');

		try {
			const response = await fetch(`${API_BASE_URL}/chat`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					message: inputMessage,
					collection: selectedCollection,
				}),
			});

			const data = await response.json();

			if (response.ok) {
				const botResponse = {
					role: 'assistant',
					content: data.response,
					sources: data.sources || [],
					timestamp: Date.now(),
				};
				setMessages((prev) => [...prev, botResponse]);
			} else {
				const errorResponse = {
					role: 'assistant',
					content: `❌ Error: ${data.error}`,
					isError: true,
					timestamp: Date.now(),
				};
				setMessages((prev) => [...prev, errorResponse]);
				setError(data.details || data.error);
			}
		} catch (err) {
			const errorResponse = {
				role: 'assistant',
				content:
					'❌ Network error. Please check if the backend server is running.',
				isError: true,
				timestamp: Date.now(),
			};
			setMessages((prev) => [...prev, errorResponse]);
			setError('Failed to connect to backend server');
		}

		setIsLoading(false);
		setInputMessage('');
	};

	const handleKeyPress = (e) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSendMessage();
		}
	};

	return (
		<div className="flex h-screen bg-gray-900 text-white">
			{/* Left Panel - Document Management */}
			<div className="w-1/2 p-6 border-r border-gray-700">
				<div className="h-full flex flex-col">
					{/* Header */}
					<div className="mb-6">
						<h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
							<Database className="w-6 h-6" />
							RAG Store
						</h2>
						<p className="text-gray-400">
							Add documents to your knowledge base
						</p>
					</div>

					{/* URL Input Section */}
					<div className="mb-6">
						<label className="block text-sm font-medium mb-2">Add URL</label>
						<div className="flex gap-2">
							<input
								type="url"
								value={urlInput}
								onChange={(e) => setUrlInput(e.target.value)}
								placeholder="https://example.com/article"
								className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							/>
							<button
								onClick={handleIndexURL}
								disabled={!urlInput.trim()}
								className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg flex items-center gap-2 transition-colors"
							>
								<Link className="w-4 h-4" />
								Add
							</button>
						</div>
					</div>

					{/* File Upload Buttons */}
					<div className="mb-6">
						<label className="block text-sm font-medium mb-3">
							Upload Documents
						</label>
						<div className="grid grid-cols-2 gap-3">
							<button
								onClick={() => fileInputRef.current?.click()}
								className="p-4 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg flex flex-col items-center gap-2 transition-colors"
							>
								<FileText className="w-6 h-6 text-red-400" />
								<span className="text-sm">Upload PDF</span>
							</button>

							<button
								onClick={() => csvInputRef.current?.click()}
								className="p-4 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg flex flex-col items-center gap-2 transition-colors"
							>
								<Upload className="w-6 h-6 text-green-400" />
								<span className="text-sm">Upload CSV</span>
							</button>
						</div>

						{/* Hidden file inputs */}
						<input
							ref={fileInputRef}
							type="file"
							accept=".pdf"
							onChange={(e) => handleFileUpload(e, 'pdf')}
							className="hidden"
						/>
						<input
							ref={csvInputRef}
							type="file"
							accept=".csv"
							onChange={(e) => handleFileUpload(e, 'csv')}
							className="hidden"
						/>
					</div>

					{/* Error Display */}
					{error && (
						<div className="mb-4 p-3 bg-red-900 border border-red-700 rounded-lg">
							<div className="flex items-center gap-2">
								<AlertCircle className="w-5 h-5 text-red-400" />
								<span className="text-sm text-red-200">{error}</span>
							</div>
						</div>
					)}

					{/* Status Display */}
					{indexingStatus && (
						<div className="mb-6 p-3 bg-gray-800 rounded-lg border border-gray-600">
							<div className="flex items-center gap-2">
								{indexingStatus.includes('✅') ? (
									<CheckCircle className="w-5 h-5 text-green-400" />
								) : indexingStatus.includes('❌') ? (
									<XCircle className="w-5 h-5 text-red-400" />
								) : (
									<Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
								)}
								<span className="text-sm">{indexingStatus}</span>
							</div>
						</div>
					)}

					{/* Collection Selector */}
					<div className="mt-auto">
						<label className="block text-sm font-medium mb-2">
							Active Collection
						</label>
						<select
							value={selectedCollection}
							onChange={(e) => setSelectedCollection(e.target.value)}
							className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
						>
							{availableCollections.map((collection) => (
								<option key={collection} value={collection}>
									{collection}
								</option>
							))}
						</select>
					</div>
				</div>
			</div>

			{/* Right Panel - Chat Interface */}
			<div className="w-1/2 flex flex-col">
				{/* Chat Header */}
				<div className="p-4 border-b border-gray-700">
					<h2 className="text-xl font-bold">Chat</h2>
					<p className="text-sm text-gray-400">
						Ask questions about your documents
					</p>
				</div>

				{/* Messages Area */}
				<div className="flex-1 overflow-y-auto p-4 space-y-4">
					{messages.length === 0 ? (
						<div className="text-center text-gray-400 mt-20">
							<Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
							<p>Start a conversation about your indexed documents</p>
						</div>
					) : (
						messages.map((message, index) => (
							<div
								key={index}
								className={`flex ${
									message.role === 'user' ? 'justify-end' : 'justify-start'
								}`}
							>
								<div
									className={`max-w-[80%] p-3 rounded-lg ${
										message.role === 'user'
											? 'bg-blue-600 text-white'
											: message.isError
											? 'bg-red-800 text-red-100 border border-red-600'
											: 'bg-gray-800 text-gray-100'
									}`}
								>
									<pre className="whitespace-pre-wrap font-sans text-sm">
										{message.content}
									</pre>
									{message.sources && message.sources.length > 0 && (
										<div className="mt-3 pt-2 border-t border-gray-600">
											<p className="text-xs text-gray-400 mb-1">Sources:</p>
											<div className="space-y-1">
												{message.sources.map((source, idx) => (
													<div
														key={idx}
														className="text-xs text-gray-300 bg-gray-700 p-2 rounded"
													>
														{source.filename && (
															<span className="font-medium">
																📄 {source.filename}
															</span>
														)}
														{source.pageNumber && (
															<span className="ml-2">
																Page {source.pageNumber}
															</span>
														)}
														{source.source && (
															<span className="font-medium">
																🔗 {source.source}
															</span>
														)}
														{source.row && (
															<span className="ml-2">Row {source.row}</span>
														)}
														<p className="mt-1 text-gray-400 italic">
															{source.content}
														</p>
													</div>
												))}
											</div>
										</div>
									)}
								</div>
							</div>
						))
					)}

					{isLoading && (
						<div className="flex justify-start">
							<div className="bg-gray-800 p-3 rounded-lg flex items-center gap-2">
								<Loader2 className="w-4 h-4 animate-spin" />
								<span>Thinking...</span>
							</div>
						</div>
					)}
				</div>

				{/* Input Area */}
				<div className="p-4 border-t border-gray-700">
					<div className="flex gap-2">
						<textarea
							value={inputMessage}
							onChange={(e) => setInputMessage(e.target.value)}
							onKeyPress={handleKeyPress}
							placeholder="Ask about your documents..."
							rows="1"
							className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							style={{ minHeight: '40px', maxHeight: '120px' }}
						/>
						<button
							onClick={handleSendMessage}
							disabled={!inputMessage.trim() || isLoading}
							className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg flex items-center gap-2 transition-colors"
						>
							<Send className="w-4 h-4" />
						</button>
					</div>
					<p className="text-xs text-gray-400 mt-2">
						Chatting with:{' '}
						<span className="text-blue-400">{selectedCollection}</span>
					</p>
				</div>
			</div>
		</div>
	);
}
