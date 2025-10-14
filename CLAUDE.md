# Mythra Web - Development Notes

## Recent Work (January 2025)

### Image Display and Navigation System
Fixed critical issues with historical image display and navigation for D&D session recording system.

#### Issues Resolved:
1. **Import Error Fix**: Fixed `fs.existsSync is not a function` by properly importing from 'fs' instead of 'fs/promises'
2. **API Connection**: Changed from relative URLs to explicit `http://localhost:3002` to resolve IPv6/IPv4 issues
3. **Campaign Image Retrieval**: Created new endpoint `/api/campaign-images/:campaignId` for proper image retrieval
4. **Session Persistence**: Fixed session continuity to use existing campaign folders instead of creating new sessions
5. **Real-time Updates**: Implemented 2-second polling for new images with auto-jump to latest

#### Rate Limiting Implementation:
- Transcription chunks: 15 seconds (increased from 10)
- Image generation: Maximum 1 per 60 seconds
- Prevents API spam and reduces credit consumption

### System Architecture:
- **Frontend**: Next.js 15.0.2 with TypeScript on port 3000
- **WebSocket Server**: Port 8080 for real-time communication
- **Express API**: Port 3002 for image serving and campaign management
- **File Watcher**: Monitors transcription files and triggers image generation

### Key Files Modified:
- `server.mjs`: Fixed imports, added campaign-images endpoint
- `src/lib/hooks/useImageNavigation.ts`: Fixed API URLs, added auto-jump feature
- `src/lib/hooks/useAudioRecorder.ts`: Prevented duplicate session creation
- `src/app/session/[sessionId]/page.tsx`: Fixed prop passing for ImageDisplay
- `file-watcher.js`: Added rate limiting for image generation
- `src/lib/services/recordingService.js`: Increased chunk duration to 15 seconds

### Quality Analysis Findings:
1. **Memory System Issues**: Empty memory state causing inconsistent character descriptions
2. **Context Window**: Limited to 3 transcriptions, needs expansion to 4-5
3. **Fragment Handling**: Short transcriptions produce poor quality prompts
4. **Non-D&D Content**: System attempts to generate fantasy images for meta-commentary

## Commands to Run Services

```bash
# Start the backend server (WebSocket + Express API)
node server.mjs

# Start the Next.js development server
npm run dev

# The application will be available at:
# - Frontend: http://localhost:3000
# - WebSocket: ws://localhost:8080
# - API: http://localhost:3002
```

## Environment Variables Required
Ensure `.env.local` contains:
```
OPENAI_API_KEY=your_key_here
BFL_API_KEY=your_key_here
LLM_MODEL_MEMORY=gpt-4o-mini
```

## Known Issues to Address:
1. Memory persistence not working correctly
2. Context window needs expansion to 4-5 transcriptions
3. Fragment bundling needed for coherent prompts
4. Content filtering for non-D&D discussion

## Testing:
To test the system:
1. Navigate to http://localhost:3000
2. Select or create a campaign
3. Start recording session
4. Images should appear every 60 seconds during active discussion
5. Use arrow keys to navigate through historical images