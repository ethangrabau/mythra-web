import readline from 'readline';
import { generateImageFlux } from './generateImageFlux.js';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function runInteractiveFlux() {
    console.log('Welcome to Flux Image Generator Playground!');
    console.log('Enter your prompts below. Type "exit" to quit.\n');

    const askForPrompt = () => {
        rl.question('Enter your image prompt: ', async (prompt) => {
            if (prompt.toLowerCase() === 'exit') {
                console.log('Goodbye!');
                rl.close();
                return;
            }

            try {
                console.log('\nGenerating image...');
                // Using a timestamp as a simple session ID
                const sessionId = Date.now().toString();
                await generateImageFlux(prompt, sessionId);
                console.log('\nImage generation complete! Check the generated_images folder.\n');
            } catch (error) {
                console.error('Error generating image:', error.message);
            }

            // Ask for another prompt
            askForPrompt();
        });
    };

    askForPrompt();
}

// Run the interactive prompt if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runInteractiveFlux();
}
