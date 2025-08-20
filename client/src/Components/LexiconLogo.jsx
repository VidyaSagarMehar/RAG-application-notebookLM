const LexiconLogo = ({
	width = 400,
	height = 120,
	className = '',
	textColor = '#1F2937',
}) => {
	return (
		<svg
			viewBox="0 0 400 120"
			xmlns="http://www.w3.org/2000/svg"
			width={width}
			height={height}
			className={className}
		>
			<defs>
				{/* Gradient for the icon */}
				<linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
					<stop offset="0%" style={{ stopColor: '#3B82F6', stopOpacity: 1 }} />
					<stop
						offset="100%"
						style={{ stopColor: '#1E40AF', stopOpacity: 1 }}
					/>
				</linearGradient>

				{/* Gradient for accent */}
				<linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="0%">
					<stop offset="0%" style={{ stopColor: '#06B6D4', stopOpacity: 1 }} />
					<stop
						offset="100%"
						style={{ stopColor: '#0891B2', stopOpacity: 1 }}
					/>
				</linearGradient>

				{/* Glow effect */}
				<filter id="glow">
					<feGaussianBlur stdDeviation="2" result="coloredBlur" />
					<feMerge>
						<feMergeNode in="coloredBlur" />
						<feMergeNode in="SourceGraphic" />
					</feMerge>
				</filter>
			</defs>

			{/* Background circle for depth */}
			<circle cx="60" cy="60" r="45" fill="url(#iconGradient)" opacity="0.1" />

			{/* Main book/document stack */}
			<g transform="translate(30, 25)">
				{/* Book 1 (back) */}
				<rect
					x="15"
					y="15"
					width="35"
					height="50"
					rx="3"
					fill="#E5E7EB"
					stroke="#D1D5DB"
					strokeWidth="1"
				/>
				<rect x="18" y="20" width="29" height="2" fill="#9CA3AF" rx="1" />
				<rect x="18" y="25" width="25" height="2" fill="#9CA3AF" rx="1" />
				<rect x="18" y="30" width="27" height="2" fill="#9CA3AF" rx="1" />

				{/* Book 2 (middle) */}
				<rect
					x="10"
					y="10"
					width="35"
					height="50"
					rx="3"
					fill="#F3F4F6"
					stroke="#D1D5DB"
					strokeWidth="1"
				/>
				<rect x="13" y="15" width="29" height="2" fill="#6B7280" rx="1" />
				<rect x="13" y="20" width="25" height="2" fill="#6B7280" rx="1" />
				<rect x="13" y="25" width="27" height="2" fill="#6B7280" rx="1" />

				{/* Book 3 (front) - Main focus */}
				<rect
					x="5"
					y="5"
					width="35"
					height="50"
					rx="3"
					fill="url(#iconGradient)"
					stroke="#1E40AF"
					strokeWidth="1"
					filter="url(#glow)"
				/>
				<rect
					x="8"
					y="10"
					width="29"
					height="2"
					fill="white"
					rx="1"
					opacity="0.9"
				/>
				<rect
					x="8"
					y="15"
					width="25"
					height="2"
					fill="white"
					rx="1"
					opacity="0.8"
				/>
				<rect
					x="8"
					y="20"
					width="27"
					height="2"
					fill="white"
					rx="1"
					opacity="0.8"
				/>
				<rect
					x="8"
					y="25"
					width="23"
					height="2"
					fill="white"
					rx="1"
					opacity="0.7"
				/>

				{/* AI Brain/Circuit pattern overlay */}
				<g opacity="0.3">
					{/* Neural network nodes */}
					<circle cx="15" cy="35" r="2" fill="white" />
					<circle cx="25" cy="30" r="2" fill="white" />
					<circle cx="30" cy="40" r="2" fill="white" />
					<circle cx="20" cy="45" r="2" fill="white" />

					{/* Connecting lines */}
					<line
						x1="15"
						y1="35"
						x2="25"
						y2="30"
						stroke="white"
						strokeWidth="1"
						opacity="0.6"
					/>
					<line
						x1="25"
						y1="30"
						x2="30"
						y2="40"
						stroke="white"
						strokeWidth="1"
						opacity="0.6"
					/>
					<line
						x1="15"
						y1="35"
						x2="20"
						y2="45"
						stroke="white"
						strokeWidth="1"
						opacity="0.6"
					/>
					<line
						x1="30"
						y1="40"
						x2="20"
						y2="45"
						stroke="white"
						strokeWidth="1"
						opacity="0.6"
					/>
				</g>
			</g>

			{/* Company name */}
			<text
				x="120"
				y="45"
				fontFamily="Inter, -apple-system, BlinkMacSystemFont, sans-serif"
				fontSize="36"
				fontWeight="700"
				fill={textColor}
			>
				Lexicon
			</text>

			{/* Tagline */}
			<text
				x="120"
				y="70"
				fontFamily="Inter, -apple-system, BlinkMacSystemFont, sans-serif"
				fontSize="14"
				fontWeight="400"
				fill="#6B7280"
			>
				Intelligent Document Intelligence
			</text>

			{/* Accent underline */}
			<rect
				x="120"
				y="75"
				width="80"
				height="3"
				fill="url(#accentGradient)"
				rx="1.5"
			/>

			{/* Subtle geometric accent */}
			<g transform="translate(330, 20)" opacity="0.6">
				<polygon points="0,20 10,0 20,20 10,25" fill="url(#accentGradient)" />
				<polygon
					points="25,15 35,5 40,15 30,20"
					fill="url(#iconGradient)"
					opacity="0.7"
				/>
			</g>
		</svg>
	);
};

export default LexiconLogo;
