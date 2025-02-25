export function parseArrangementXML(xmlString: string) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

  // Get basic arrangement info
  const arrangementElement = xmlDoc.querySelector('Arrangement');
  if (!arrangementElement) throw new Error('Invalid XML: No Arrangement element found');

  const arrangement = {
    Version: arrangementElement.getAttribute('Version') || '',
    Genre: (arrangementElement.getAttribute('Genre') || '').replace(/\//g, '.'),
    Name: arrangementElement.getAttribute('Name') || '',
    UserName: arrangementElement.getAttribute('UserName') || '',
    BPM: arrangementElement.getAttribute('BPM') || '',
    Blocks: [] as { Type: string; Name: string; HeightL: number; HeightR: number }[],
    Types: {} as Record<string, { Length: number }>
  };

  // Parse blocks
  const blockElements = xmlDoc.querySelectorAll('Blocks > Block');
  blockElements.forEach(block => {
    arrangement.Blocks.push({
      Type: block.getAttribute('Type') || '',
      Name: block.getAttribute('Name') || '',
      HeightL: parseInt(block.getAttribute('HeightL') || '0', 10),
      HeightR: parseInt(block.getAttribute('HeightR') || '0', 10)
    });
  });

  // Parse types
  const typeElements = xmlDoc.querySelectorAll('Types > *');
  typeElements.forEach(type => {
    const length = parseInt(type.getAttribute('Length') || '0', 10);
    arrangement.Types[type.tagName] = { Length: length };
  });

  return arrangement;
}