import fs from 'fs/promises';
import path from 'path';

(async () => {
  const metadataPath = path.join(process.cwd(), 'metadata');
  const memoryLogPath = path.join(metadataPath, 'memory-log.txt');

  try {
    // Check directory access
    await fs.access(metadataPath);
    console.log('✅ Metadata directory is accessible.');

    // Check file read access
    const content = await fs.readFile(memoryLogPath, 'utf-8');
    console.log('✅ memory-log.txt is readable. Content:', content);

    // Check file write access
    await fs.writeFile(memoryLogPath, content + '\nTest Write Access');
    console.log('✅ memory-log.txt is writable. Test write succeeded.');

    // Cleanup test write
    const updatedContent = content.trim(); // Remove the test line
    await fs.writeFile(memoryLogPath, updatedContent);
    console.log('✅ Cleanup successful. File content restored.');
  } catch (error) {
    console.error('❌ Permission issue detected:', error);
  }
})();
