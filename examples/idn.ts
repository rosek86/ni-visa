import { VisaInstrument, VisaResourceManager } from '../src/Visa.ts';

const rm = new VisaResourceManager();

try {
  console.log('Listing resources...');
  const resources = rm.listResources();
  console.log(`Resources: ${resources}`);

  const usbResources = resources.filter((resource) => resource.startsWith('USB'));
  console.log(`USB resources: ${usbResources}...`);

  const selectedResource = usbResources[0];
  if (!selectedResource) {
    throw new Error('No USB resources found');
  }

  console.log(`Opening instrument: ${selectedResource}...`);
  const instr = rm.open(selectedResource);

  try {
    onInstrumentOpened(instr);
  } finally {
    console.log('Closing instrument...');
    instr.close();
  }
} catch (error) {
  console.error(error);
} finally {
  console.log('Closing default resource manager...');
  rm.close();
}

function onInstrumentOpened(instr: VisaInstrument) {
  const response = instr.query('*IDN?');
  console.log(`\nInstrument ID: ${response}\n`);
}
