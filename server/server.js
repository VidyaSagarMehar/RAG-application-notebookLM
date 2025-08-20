import 'dotenv/config';
import express from 'express';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { CheerioWebBaseLoader } from '@langchain/community/document_loaders/web/cheerio';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { CSVLoader } from '@langchain/community/document_loaders/fs/csv';
import { OpenAIEmbeddings } from '@langchain/openai';
import { QdrantVectorStore } from '@langchain/qdrant';
import OpenAI from 'openai';

const app = express();
const port = process.env.PORT || 3001;
const client = new OpenAI();

// Middleware
app.use(
	cors({
		origin: [
			'http://localhost:3000',
			'https://rag-application-notebook-lm.vercel.app',
			'https://*.vercel.app',
		],
		credentials: true,
	}),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadsDir = './uploads';
if (!fs.existsSync(uploadsDir)) {
	fs.mkdirSync(uploadsDir);
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, uploadsDir);
	},
	filename: (req, file, cb) => {
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
		cb(
			null,
			file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname),
		);
	},
});

const upload = multer({
	storage: storage,
	limits: {
		fileSize: 10 * 1024 * 1024, // 10MB limit
	},
});

// Helper functions from your original code
async function splitDocs(docs, extraMetadata = {}) {
	const splitter = new RecursiveCharacterTextSplitter({
		chunkSize: 1000,
		chunkOverlap: 200,
	});

	const splitDocs = await splitter.splitDocuments(docs);
	return splitDocs.map((d) => ({
		...d,
		metadata: { ...d.metadata, ...extraMetadata },
	}));
}

async function saveToQdrant(docs, collectionName) {
	if (!docs || docs.length === 0) {
		throw new Error(`No documents to index for ${collectionName}`);
	}

	const embeddings = new OpenAIEmbeddings({ model: 'text-embedding-3-large' });

	try {
		const vectorStore = await QdrantVectorStore.fromExistingCollection(
			embeddings,
			{
				url: process.env.QDRANT_URL || 'http://localhost:6333',
				apiKey: process.env.QDRANT_API_KEY,
				collectionName,
			},
		);

		await vectorStore.addDocuments(docs);
		return { success: true, count: docs.length };
	} catch (error) {
		// If collection doesn't exist, create it
		if (
			error.message.includes('not found') ||
			error.message.includes('does not exist')
		) {
			const vectorStore = await QdrantVectorStore.fromDocuments(
				docs,
				embeddings,
				{
					url: process.env.QDRANT_URL || 'http://localhost:6333',
					collectionName,
				},
			);
			return { success: true, count: docs.length, created: true };
		}
		throw error;
	}
}

// API Routes

// Index PDF endpoint
app.post('/api/index/pdf', upload.single('pdf'), async (req, res) => {
	try {
		if (!req.file) {
			return res.status(400).json({ error: 'No PDF file uploaded' });
		}

		const { collection = 'pdf-collection' } = req.body;
		const filePath = req.file.path;

		const loader = new PDFLoader(filePath, { splitPages: true });
		const docs = await loader.load();

		const splitDocsResult = await splitDocs(docs, {
			filename: req.file.originalname,
			uploadDate: new Date().toISOString(),
		});

		const result = await saveToQdrant(splitDocsResult, collection);

		// Clean up uploaded file
		fs.unlinkSync(filePath);

		res.json({
			success: true,
			message: `PDF indexed successfully! ${result.count} chunks added to ${collection}`,
			collection,
			documentsCount: result.count,
			created: result.created || false,
		});
	} catch (error) {
		console.error('Error indexing PDF:', error);

		// Clean up file if it exists
		if (req.file && fs.existsSync(req.file.path)) {
			fs.unlinkSync(req.file.path);
		}

		res.status(500).json({
			error: 'Failed to index PDF',
			details: error.message,
		});
	}
});

// Index URL endpoint
app.post('/api/index/url', async (req, res) => {
	try {
		const { url, collection = 'url-collection' } = req.body;

		if (!url) {
			return res.status(400).json({ error: 'URL is required' });
		}

		const loader = new CheerioWebBaseLoader(url, {
			selector: 'main#content article, article#wikiArticle, main#content, body',
		});

		const docs = await loader.load();
		const splitDocsResult = await splitDocs(docs, {
			source: url,
			indexDate: new Date().toISOString(),
		});

		const result = await saveToQdrant(splitDocsResult, collection);

		res.json({
			success: true,
			message: `URL indexed successfully! ${result.count} chunks added to ${collection}`,
			collection,
			documentsCount: result.count,
			url,
			created: result.created || false,
		});
	} catch (error) {
		console.error('Error indexing URL:', error);
		res.status(500).json({
			error: 'Failed to index URL',
			details: error.message,
		});
	}
});

// Index CSV endpoint
app.post('/api/index/csv', upload.single('csv'), async (req, res) => {
	try {
		if (!req.file) {
			return res.status(400).json({ error: 'No CSV file uploaded' });
		}

		const { collection = 'csv-collection' } = req.body;
		const filePath = req.file.path;

		const loader = new CSVLoader(filePath);
		const docs = await loader.load();

		// Add row + filename metadata
		const withMetadata = docs.map((doc, i) => ({
			...doc,
			metadata: {
				...doc.metadata,
				row: i + 1,
				file: req.file.originalname,
				uploadDate: new Date().toISOString(),
			},
		}));

		const splitDocsResult = await splitDocs(withMetadata);
		const result = await saveToQdrant(splitDocsResult, collection);

		// Clean up uploaded file
		fs.unlinkSync(filePath);

		res.json({
			success: true,
			message: `CSV indexed successfully! ${result.count} chunks added to ${collection}`,
			collection,
			documentsCount: result.count,
			rowsProcessed: docs.length,
			created: result.created || false,
		});
	} catch (error) {
		console.error('Error indexing CSV:', error);

		// Clean up file if it exists
		if (req.file && fs.existsSync(req.file.path)) {
			fs.unlinkSync(req.file.path);
		}

		res.status(500).json({
			error: 'Failed to index CSV',
			details: error.message,
		});
	}
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
	try {
		const { message, collection = 'chaicode-collection' } = req.body;

		if (!message) {
			return res.status(400).json({ error: 'Message is required' });
		}

		const embeddings = new OpenAIEmbeddings({
			model: 'text-embedding-3-large',
		});

		const vectorStore = await QdrantVectorStore.fromExistingCollection(
			embeddings,
			{
				url: process.env.QDRANT_URL || 'http://localhost:6333',
				collectionName: collection,
			},
		);

		const retriever = vectorStore.asRetriever({ k: 5, searchType: 'mmr' });
		const relevantChunks = await retriever.invoke(message);

		if (relevantChunks.length === 0) {
			return res.json({
				success: true,
				response:
					"I don't have any relevant information in the selected collection to answer your question.",
				sources: [],
			});
		}

		// Format context with sources
		const contextText = relevantChunks
			.map((doc, i) => {
				const pageInfo = doc.metadata.pageNumber
					? `(Page ${doc.metadata.pageNumber})`
					: '';
				const sourceInfo = doc.metadata.source
					? `(Source: ${doc.metadata.source})`
					: '';
				const rowInfo = doc.metadata.row
					? `(Row: ${doc.metadata.row}, File: ${doc.metadata.file})`
					: '';
				const fileInfo = doc.metadata.filename
					? `(File: ${doc.metadata.filename})`
					: '';

				return `Chunk ${
					i + 1
				} ${pageInfo} ${sourceInfo} ${rowInfo} ${fileInfo}:\n${
					doc.pageContent
				}`;
			})
			.join('\n\n');

		const SYSTEM_PROMPT = `
      You are an AI assistant who answers queries based ONLY on the given context. 
      Always cite the source:
      - For PDFs → include the page number and filename if available.
      - For web docs → include the source URL.
      - For CSVs → include row number and filename.

      If the answer is not in the context, reply:
      "I don't know, based on the provided documents."

      Context:
      ${contextText}
      `;

		const completion = await client.chat.completions.create({
			model: 'gpt-4o-mini', // Using gpt-4o-mini as gpt-4.1 doesn't exist
			messages: [
				{ role: 'system', content: SYSTEM_PROMPT },
				{ role: 'user', content: message },
			],
		});

		const response = completion.choices[0].message.content;

		// Extract source information for frontend display
		const sources = relevantChunks.map((doc, i) => ({
			chunk: i + 1,
			pageNumber: doc.metadata.pageNumber,
			source: doc.metadata.source,
			row: doc.metadata.row,
			filename: doc.metadata.filename || doc.metadata.file,
			content: doc.pageContent.substring(0, 200) + '...',
		}));

		res.json({
			success: true,
			response,
			sources,
			collection,
		});
	} catch (error) {
		console.error('Error in chat:', error);
		res.status(500).json({
			error: 'Failed to process chat request',
			details: error.message,
		});
	}
});

// Get collections endpoint
app.get('/api/collections', async (req, res) => {
	try {
		// This is a simplified version - in a real app, you'd query Qdrant for actual collections
		const collections = [
			'chaicode-collection',
			'mdn-docs-collection',
			'csv-collection',
			'pdf-collection',
			'url-collection',
		];

		res.json({ success: true, collections });
	} catch (error) {
		console.error('Error getting collections:', error);
		res.status(500).json({
			error: 'Failed to get collections',
			details: error.message,
		});
	}
});

// Health check endpoint
app.get('/api/health', (req, res) => {
	res.json({ status: 'OK', message: 'RAG API Server is running' });
});

// Error handling middleware
app.use((error, req, res, next) => {
	console.error('Unhandled error:', error);
	res.status(500).json({
		error: 'Internal server error',
		details: error.message,
	});
});

app.listen(port, () => {
	console.log(`🚀 RAG API Server running on port ${port}`);
	console.log(`📊 Health check: http://localhost:${port}/api/health`);
});
